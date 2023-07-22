import { Callbacks } from "langchain/callbacks";
import { IRecord } from "@/types/storage";
import { IMessage } from "@/message/type";

export interface IAgent extends IRecord{
    alias: string,
    description: string,
    avatar: string,
}

// MAP: multi-agent protocol
export interface IAgentExecutor{
    call(messages: IMessage[], agents: IAgent[]): Promise<IMessage>;

    ask(candidate_messages: IMessage[], chat_history: IMessage[]): Promise<number>;
}
