import { IAgent, IAgentExcutor } from "@/types/agent";
import { getProvider } from "@/utils/app/llmProvider";
import { Agent, ChatAgent, ZeroShotAgent, initializeAgentExecutor, AgentExecutor, Tool, LLMSingleActionAgent, AgentActionOutputParser } from "langchain/agents";
import { ConversationChain } from "langchain/chains";
import {LLM} from "langchain/llms/base";
import { ChatMemory } from "./chatMemory";
import { AgentAction, AgentFinish, AgentStep, InputValues, PartialValues } from "langchain/dist/schema";
import { BasePromptTemplate, BaseStringPromptTemplate, SerializedBasePromptTemplate, renderTemplate } from "langchain/prompts";
import { RecordMap } from "@/utils/app/recordProvider";
import { LLMChain } from "langchain";
import { IMessage } from "@/types/chat";
import { IModel } from "@/types/model";
import { ConsoleCallbackHandler } from "langchain/callbacks";

export interface IZeroshotAgentMessage extends IMessage{
  type: 'message.zeroshot',
  prompt: string,
  scratchpad: string,
  error?: string,
}

interface IZeroshotAgent extends IAgent {
    llm?: IModel;
    // todo: tools
    suffixPrompt?: string;
    prefixPrompt?: string;
};

class ReplyTool extends Tool{
    llm: LLM;
    constructor(llm: LLM){
        super();
        this.llm = llm;
    }
    protected async _call(arg: string): Promise<string> {
        var reply = await this.llm.call(arg);

        return reply;
    }
    name: string = "Reply";
    description: string = "Reply question with whatever you find";
}

class DummyTool extends Tool{
    protected async _call(arg: string): Promise<string> {
        return '';
    }
    name: string = "Dummy";
    description: string = "Dummy tool that does nothing";
}

class CustomOutputParser extends AgentActionOutputParser {
    async parse(text: string): Promise<AgentAction | AgentFinish> {
        return {log: text, returnValues: {output: text}};
    }
  
    getFormatInstructions(): string {
      throw new Error("Not implemented");
    }
}

class CustomPromptTemplate extends BaseStringPromptTemplate {
    prefix: string;
    suffix: string;
  
    constructor(args: { prefix: string, suffix: string, inputVariables: string[] }) {
        super({ inputVariables: args.inputVariables });
        this.prefix = args.prefix;
        this.suffix = args.suffix;
    }
  
    _getPromptType(): string {
      throw new Error("Not implemented");
    }
  
    format(input: InputValues): Promise<string> {
      /** Construct the final template */
      const template = [this.prefix, this.suffix].join("\n\n");
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
      return Promise.resolve(renderTemplate(template, "f-string", newInput));
    }
  
    partial(_values: PartialValues): Promise<BasePromptTemplate> {
      throw new Error("Not implemented");
    }
  
    serialize(): SerializedBasePromptTemplate {
      throw new Error("Not implemented");
    }
  }

class ZeroshotAgentExcutor implements IAgentExcutor{
    agentExecutor: AgentExecutor;
    agent: IZeroshotAgent;
    constructor(agentExecutor: AgentExecutor, agent: IZeroshotAgent){
        this.agentExecutor = agentExecutor;
        this.agent = agent;
    }
    async call(message: IMessage): Promise<IZeroshotAgentMessage> {
      try{
        var reply = await this.agentExecutor.call({from: message.from, content: message.content});
        return {
          type: 'message.zeroshot',
          from: this.agent.alias,
          content: reply["output"],
          timestamp: Date.now(),
        };
      }
      catch(e){
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

export function initializeZeroshotAgentExecutor(agent: IZeroshotAgent, history?: IMessage[]): IAgentExcutor {
    if (!agent.llm) {
        throw new Error("No llm provided");
    }
    var llmProvider = getProvider(agent.llm!);
    var llm = llmProvider(agent.llm!);
    var prompt = `
    ${agent.prefixPrompt}
    history:
    {history}

    new message
    {from}: {content}`;
    var chatChain = new ConversationChain({
        llm: llm,
        memory: new ChatMemory({
            history: history,
            outputKey: agent.alias,
        }),
        prompt: new CustomPromptTemplate({prefix: agent.prefixPrompt!, suffix: agent.suffixPrompt!, inputVariables: ["history", "from", "content"]}),
    });
    var singleActionAgent = new LLMSingleActionAgent({
        llmChain: chatChain,
        outputParser: new CustomOutputParser(),
    });
    const handler = new ConsoleCallbackHandler();
    var executor = AgentExecutor.fromAgentAndTools({agent: singleActionAgent, tools: [], verbose: true, callbacks: [handler]});
    var agentExecutor = new ZeroshotAgentExcutor(executor, agent);
    return agentExecutor;
}

export type { IZeroshotAgent };