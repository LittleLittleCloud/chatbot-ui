import { IAgent, IAgentExcutor } from "@/types/agent";
import { IMessage } from "@/types/chat";
import { Container } from "inversify";
const container = new Container();
type agentProviderType<T extends IAgent> = (agent: T, history?: IMessage[]) => IAgentExcutor;

export function registerAgentExecutorProvider<T extends IAgent>(id: string, provider: agentProviderType<T>){
    container.bind<agentProviderType<T>>(id).toConstantValue(provider);
}

export function getAgentExecutorProvider(id: string): agentProviderType<IAgent>{
    return container.get<agentProviderType<IAgent>>(id);
}

export function hasAgentExecutorProvider(id: string){
    return container.isBound(id);
}
