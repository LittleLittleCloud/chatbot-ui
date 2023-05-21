import { IAgent, IAgentExcutor } from "@/types/agent";
import { Agent, ChatAgent, ZeroShotAgent, AgentExecutor, LLMSingleActionAgent, AgentActionOutputParser } from "langchain/agents";
import { ConversationChain } from "langchain/chains";
import {LLM} from "langchain/llms/base";
import { ChatMemory } from "./chatMemory";
import { AgentAction, AgentFinish, AgentStep, InputValues, PartialValues } from "langchain/dist/schema";
import { BasePromptTemplate, BaseStringPromptTemplate, SerializedBasePromptTemplate, renderTemplate } from "langchain/prompts";
import { RecordMap } from "@/utils/app/recordProvider";
import { LLMChain } from "langchain";
import { IMessage } from "@/types/chat";
import { ILLMModel, IModel } from "@/types/model";
import { CallbackManager, Callbacks, ConsoleCallbackHandler, LangChainTracer } from "langchain/callbacks";
import { Tool } from "langchain/tools";
import { getLLMProvider } from "@/utils/app/llmProvider";

export interface IZeroshotAgentMessage extends IMessage{
  type: 'message.zeroshot',
  prompt?: string,
  scratchpad?: string,
  error?: string,
}

interface IChatAgent extends IAgent {
    type: 'agent.chat';
    llm?: ILLMModel;
    // todo: tools
    suffixPrompt?: string;
    prefixPrompt?: string;
    useMarkdown?: boolean;
    includeHistory?: boolean;
    includeName?: boolean;
};

class CustomOutputParser extends AgentActionOutputParser {
    async parse(text: string): Promise<AgentAction | AgentFinish> {
        return {log: text, returnValues: {output: text}};
    }
  
    getFormatInstructions(): string {
      throw new Error("Not implemented");
    }
}

export class ChatAgentPromptTemplate extends BaseStringPromptTemplate {
    prefix: string;
    suffix: string;
    useChatML: boolean;
    useMarkdown: boolean;
    includeHistory: boolean;
    includeName: boolean;
    name: string;
  
    constructor(args: IChatAgent & {inputVariables?: string[]}) {
        var _inputVariables = ['history', 'from', 'content', ...args.inputVariables ?? []]
        super({ inputVariables: _inputVariables });
        this.prefix = args.prefixPrompt!;
        this.suffix = args.suffixPrompt!;
        this.name = args.alias;
        this.useMarkdown = args.useMarkdown ?? false;
        this.includeHistory = args.includeHistory ?? false;
        this.includeName = args.includeName ?? false;
        this.useChatML = args.llm?.isChatModel ?? false;
    }
  
    _getPromptType(): string {
      throw new Error("Not implemented");
    }
  
    format(input: InputValues): Promise<string> {
      /** Construct the final template */
      var namePrompt = `Your name is ${this.name}`;
      var historyPrompt = `###chat history###
{history}
###`;
      var newMessagePrompt = `###new message###
{from}: {content}`;
      var useMarkdownPrompt = `use markdown to format response`;
      const templates = [this.prefix];
      if(this.includeName) templates.push(namePrompt);
      if(this.useMarkdown) templates.push(useMarkdownPrompt);
      if(this.includeHistory) templates.push(historyPrompt);
      templates.push(newMessagePrompt);
      templates.push(this.suffix);
      var template = templates.join("\n");
      /** Construct the agent_scratchpad */
      const intermediateSteps = input.intermediate_steps as AgentStep[];
      const agentScratchpad = intermediateSteps.reduce(
        (thoughts, { action, observation }) =>
          thoughts +
          [action.log, `\nObservation: ${observation}`, "Thought:"].join("\n"),
        ""
      );
      const newInput = { agent_scratchpad: agentScratchpad, ...input };
      /** Format the template. */
      var prompt = renderTemplate(template, "f-string", newInput);
      return Promise.resolve(prompt);
    }
  
    partial(_values: PartialValues): Promise<BasePromptTemplate> {
      throw new Error("Not implemented");
    }
  
    serialize(): SerializedBasePromptTemplate {
      throw new Error("Not implemented");
    }
  }

class ChatAgentExecutor implements IAgentExcutor{
    agentExecutor: AgentExecutor;
    agent: IChatAgent;
    constructor(agentExecutor: AgentExecutor, agent: IChatAgent){
        this.agentExecutor = agentExecutor;
        this.agent = agent;
    }
    async call(message: IMessage, callBack?: Callbacks): Promise<IZeroshotAgentMessage> {
      try{
        var reply = await this.agentExecutor.call({from: message.from, content: message.content}, callBack);
        return {
          type: 'message.zeroshot',
          from: this.agent.alias,
          content: reply["output"],
          timestamp: Date.now(),
        };
      }
      catch(e: any){
        return {
          type: 'message.zeroshot',
          from: this.agent.alias,
          content: '',
          timestamp: Date.now(),
          error: e.toString(),
        };
      }
    }
}

export function initializeChatAgentExecutor(agent: IChatAgent, history?: IMessage[]): IAgentExcutor {
    if (!agent.llm) {
        throw new Error("No llm provided");
    }

    console.log(history);
    var llmProvider = getLLMProvider(agent.llm!);
    var llm = llmProvider(agent.llm!);
    var chatChain = new ConversationChain({
        llm: llm,
        memory: new ChatMemory({
            history: history,
            outputKey: agent.alias,
        }),
        prompt: new ChatAgentPromptTemplate({...agent}),
    });
    var singleActionAgent = new LLMSingleActionAgent({
        llmChain: chatChain,
        outputParser: new CustomOutputParser(),
    });
    const handler = new ConsoleCallbackHandler();
    var executor = AgentExecutor.fromAgentAndTools({agent: singleActionAgent, tools: [], verbose: true, callbacks: [handler]});
    var agentExecutor = new ChatAgentExecutor(executor, agent);
    return agentExecutor;
}

export type { IChatAgent };