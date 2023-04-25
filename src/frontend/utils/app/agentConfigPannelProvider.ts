import { IAgent } from "@/types/agent";
import { Container } from "inversify";
const container = new Container();
const availableAgent: string[] = [];

export type configPanelProviderType<T extends IAgent> = (agent: T, onConfigChange: (config: T) => void) => JSX.Element;

export function registerAgentConfigPannelProvider<T extends IAgent>(id: string, provider: configPanelProviderType<T>){
    if(availableAgent.includes(id)){
        throw new Error(`Agent ${id} already registered`);
    }

    availableAgent.push(id);
    container.bind<configPanelProviderType<T>>(id).toConstantValue(provider);
}

export function getAgentConfigPannelProvider(id: string): configPanelProviderType<IAgent>{
    return container.get<configPanelProviderType<IAgent>>(id);
}

export function hasAgentConfigPannelProvider(id: string){
    return availableAgent.includes(id);
}

export function getAvailableAgents(): string[]{
    return availableAgent;
}
