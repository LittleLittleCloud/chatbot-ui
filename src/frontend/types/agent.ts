import { IMessage } from "./chat";
import { IRecord } from "./storage";

interface IAgent extends IRecord{
    alias: string,
    description: string,
    avatar: string,
}

interface IAgentExcutor{
    call(message: IMessage): Promise<IMessage>;
}


export type { IAgent, IAgentExcutor }