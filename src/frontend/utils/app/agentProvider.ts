import { IAgent, IAgentExcutor } from "@/types/agent";
import { IMessage } from "@/types/chat";

type agentProviderType<T extends IAgent> = (agent: T, history?: IMessage[]) => IAgentExcutor;
export type agentConfigUIProvderType<T extends IAgent> = (agent: T, onConfigChange: (config: T) => void) => JSX.Element;

const availableAgent: string[] = [];
const agentProviderRecord: Record<string, agentProviderType<IAgent>> = {};
const agentConfigUIProviderRecord: Record<string, agentConfigUIProvderType<IAgent>> = {};
const defaultAgentConfig: Record<string, IAgent> = {};

export function registerAgentProvider<T extends IAgent>(
    id: string,
    agentProvider: agentProviderType<T>,
    agentConfigUIProvider: agentConfigUIProvderType<T>,
    defaultConfig: T){
    agentProviderRecord[id] = (agent) => agentProvider(agent as T);
    agentConfigUIProviderRecord[id] = (agent, onConfigChange) => agentConfigUIProvider(agent as T, onConfigChange);
    defaultAgentConfig[id] = defaultConfig;

    if(!availableAgent.includes(id)){
        availableAgent.push(id);
    }
}

export function getAgentExecutorProvider(id: string): agentProviderType<IAgent>{
    return agentProviderRecord[id];
}

export function hasAgentExecutorProvider(id: string){
    return agentProviderRecord[id] !== undefined;
}

export function getAgentConfigUIProvider(id: string): agentConfigUIProvderType<IAgent>{
    return agentConfigUIProviderRecord[id];
}

export function hasAgentConfigUIProvider(id: string){
    return agentConfigUIProviderRecord[id] !== undefined;
}

export function getAgentDefaultConfig(id: string): IAgent{
    return defaultAgentConfig[id];
}

export function getAvailableAgents(): string[]{
    return availableAgent;
}
