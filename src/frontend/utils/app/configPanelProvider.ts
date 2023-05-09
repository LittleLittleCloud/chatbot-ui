import { IModelConfig } from "@/components/Model/model";
import { IMessage } from "@/types/chat";
import { IModel } from "@/types/model";
import { IRecord } from "@/types/storage";
import { Container } from "inversify";

const container = new Container();
export type providerType<T extends IRecord> = (config: T, onConfigChange: (config: T) => void) => JSX.Element;

export function registerConfigPanelProvider<T extends IModel>(id: string, provider: providerType<T>){
    container.bind<providerType<T>>(id).toConstantValue(provider);
}

export function getConfigPanelProvider(id: string): providerType<IModel>{
    return container.get<providerType<IModel>>(id);
}

export function hasConfigPanelProvider(id: string){
    return container.isBound(id);
}

export function registerMessageUIProvider<T extends IMessage>(id: string, provider: providerType<T>){
    container.bind<providerType<T>>(id).toConstantValue(provider);
}

export function getMessageUIProvider(id: string): providerType<IMessage>{
    return container.get<providerType<IMessage>>(id);
}

export function hasMessageUIProvider(id: string){
    return container.isBound(id);
}