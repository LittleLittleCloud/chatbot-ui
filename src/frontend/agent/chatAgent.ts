import { Agent, ChatAgent, ZeroShotAgent, AgentExecutor, LLMSingleActionAgent, AgentActionOutputParser } from "langchain/agents";
import { ConversationChain } from "langchain/chains";
import {BaseLLM, LLM} from "langchain/llms/base";
import { ChatMemory, IChatMemory } from "../memory/chatMemory";
import { AgentAction, AgentFinish, AgentStep, BaseChatMessage, ChatMessage, HumanChatMessage, InputValues, PartialValues, SystemChatMessage } from "langchain/schema";
import { BasePromptTemplate, BaseStringPromptTemplate, SerializedBasePromptTemplate, renderTemplate } from "langchain/prompts";
import { RecordMap } from "@/utils/app/recordProvider";
import { LLMChain } from "langchain";
import { CallbackManager, Callbacks, ConsoleCallbackHandler, LangChainTracer } from "langchain/callbacks";
import { Tool } from "langchain/tools";
import { IAgent, IAgentExecutor } from "./type";
import { IMessage } from "@/message/type";
import { IEmbeddingModel, ILLMModel } from "@/model/type";
import { IMemory } from "@/memory/type";
import { LLMProvider } from "@/model/llmprovider";
import { MemoryProvider } from "@/memory/memoryProvider";
import { BaseLanguageModel } from "langchain/base_language";
import { Logger } from "@/utils/logger";
import { BaseChatModel } from "langchain/chat_models/base";
import { IMarkdownMessage } from "@/message/MarkdownMessage";

export interface IZeroshotAgentMessage extends IMessage{
  type: 'message.zeroshot',
  prompt?: string,
  scratchpad?: string,
  error?: string,
}

interface IChatAgent extends IAgent {
    type: 'agent.chat';
    llm?: ILLMModel;
    memory?: IMemory;
    embedding?: IEmbeddingModel;
    // todo: tools
    suffixPrompt?: string;
    prefixPrompt?: string;
    useMarkdown?: boolean;
    includeHistory?: boolean;
    includeName?: boolean;
};

export class ChatAgentExecutor implements IAgentExecutor {
  llm: BaseLLM | BaseChatModel;
  agent: IChatAgent;

  constructor(agent: IChatAgent) {
    Logger.debug("initialize chat agent executor");
    var llmProvider = LLMProvider.getProvider(agent.llm!);
    this.llm = llmProvider(agent.llm!);
    this.agent = agent;
  }

  renderMessage(message: IMessage): string {
    var from = message.from;
    var content = message.content;

    // remove newline
    content = content.replace(/\n/g, " ");
    var messageStr = `[${from}]:${content}`;
    return messageStr;
  }

  renderChatHistoryMessages(history: IMessage[]): string {
    var historyStr = history.map((message) => this.renderMessage(message)).join("\n\n");
    return historyStr;
  }

  renderCandidateMessages(candidate_messages: IMessage[]): string {
    var candidateStr = candidate_messages.map((message, i) => `${this.renderMessage(message)}`).join("\n");

    return candidateStr;
  }

  renderCallPrompt(messages: IMessage[]): string {
    var namePrompt = `Your name is ${this.agent.alias}, ${this.agent.description}`;
    var useMarkdownPrompt = `use markdown to format response`;
    var historyPrompt = `###chat history###
${this.renderChatHistoryMessages(messages)}
###`;
    var prompts = [this.agent.prefixPrompt]
    if(this.agent.includeName) prompts.push(namePrompt);
    if(this.agent.useMarkdown) prompts.push(useMarkdownPrompt);
    if(this.agent.includeHistory) prompts.push(historyPrompt);
    prompts.push(this.agent.suffixPrompt);

    var prompt = prompts.join("\n");
    return prompt;
  }

  async callLLM(txt: string): Promise<string> {
    if (this.llm instanceof BaseChatModel) {
      var input = new HumanChatMessage(txt);
      var output = await this.llm.call([input]);
      return output.text;
    }
    else if (this.llm instanceof BaseLLM) {
      var llmOutput = await this.llm.call(txt);
      return llmOutput;
    }

    throw new Error("llm type not supported");
  }

  renderAgentInformation(agent_information: IAgent[]): string {
    var agentStr = agent_information.map((agent) => `${agent.alias}: ${agent.description}`).join("\n");

    return agentStr;
  }

  async rolePlay(messages: IMessage[], agents: IAgent[]): Promise<number> {
    var prompt = `### role information###
${this.renderAgentInformation(agents)}
### end of role information ###

### conversation ###
${this.renderChatHistoryMessages(messages)}
### end of conversation ###

You are in a multi-role play game and your task is to continue writing conversation. Carefully pick a role based on context. Put sender's name in square brackets. Explain why you pick this role.
(e.g: [sender]: // short and precise message)`

    Logger.debug(`prompt: ${prompt}`);
    var response = await this.callLLM(prompt);
    Logger.debug(`response from ${this.agent.alias}: ${response}`);
    try{
      var candidate_roles = agents.map((agent) => agent.alias.toLowerCase());
      var selected_role = response.match(/\[(.*?)\]/)![1].toLowerCase();
      var index = candidate_roles.indexOf(selected_role);

      Logger.debug(`response from ${this.agent.alias}: ${selected_role}, index: ${index}`);
      return index;
    }
    catch(e){
      Logger.error(`error: ${e}`);
      return -1;
    }
  }

  async ask(candidate_messages: IMessage[], chat_message: IMessage[], agent_information: IAgent[]): Promise<number> {
    // select the best message for response
    var prompt = `
### role information ###
${this.renderAgentInformation(agent_information)}
### end of role information ###

### conversation ###
${this.renderChatHistoryMessages(chat_message)}
### end of conversation ###

### candidate messages ###
${this.renderCandidateMessages(candidate_messages)}
### end of candidate messages ###

You are in a role play game, Carefully choose a response from candidate messages to make the conversation reasonable. Put sender's name in square brackets
(e.g: [sender]: // message)`

    Logger.debug(`prompt: ${prompt}`);
    var response = await this.callLLM(prompt);
    Logger.debug(`response from ${this.agent.alias}: ${response}`);
    try{
      var candidate_roles = candidate_messages.map((message) => message.from.toLowerCase());
      var selected_role = response.match(/\[(.*?)\]/)![1].toLowerCase();
      var index = candidate_roles.indexOf(selected_role);

      Logger.debug(`response from ${this.agent.alias}: ${selected_role}, index: ${index}`);
      return index;
    }
    catch(e){
      Logger.error(`error: ${e}`);
      return -1;
    }
  }

  async call(messages: IMessage[], agents: IAgent[]): Promise<IMessage> {
    var prompt = this.renderCallPrompt(messages);
    Logger.debug(`prompt: ${prompt}`);
    var response = await this.callLLM(prompt);
    Logger.debug(`response from ${this.agent.alias}: ${response}`);

    return {
      type: 'message.markdown',
      from: this.agent.alias,
      content: response,
    } as IMarkdownMessage;
  }
}

export function initializeChatAgentExecutor(agent: IChatAgent, history?: IMessage[]): IAgentExecutor {
    if (!agent.llm) {
        throw new Error("No llm provided");
    }
    var agentExecutor = new ChatAgentExecutor(agent);

    return agentExecutor;
}

export type { IChatAgent };