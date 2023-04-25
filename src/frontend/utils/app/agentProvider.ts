import { IAgent } from "@/types/agent";
import { IChatMessage } from "@/types/chat";
import { Container } from "inversify";
import { Agent, initializeAgentExecutor, AgentExecutor } from "langchain/agents";
const container = new Container();
type providerType<T extends IAgent> = (agent: T, history?: IChatMessage[]) => AgentExecutor;

export function registerAgentExecutorProvider<T extends IAgent>(id: string, provider: providerType<T>){
    container.bind<providerType<T>>(id).toConstantValue(provider);
}

export function getAgentExecutorProvider(id: string): providerType<IAgent>{
    return container.get<providerType<IAgent>>(id);
}

export function hasAgentExecutorProvider(id: string){
    return container.isBound(id);
}
