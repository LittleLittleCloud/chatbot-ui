import { IModelConfig } from "@/components/Model/model";
import { IMessage } from "@/types/chat";
import { IModel } from "@/types/model";
import { IRecord } from "@/types/storage";
import { Container } from "inversify";

const container = new Container();
export type providerType<T extends IRecord> = (config: T, onConfigChange: (config: T) => void) => JSX.Element;

export function registerMessageUIProvider<T extends IMessage>(id: string, provider: providerType<T>){
    container.bind<providerType<T>>(id).toConstantValue(provider);
}

export function getMessageUIProvider(id: string): providerType<IMessage>{
    return container.get<providerType<IMessage>>(id);
}

export function hasMessageUIProvider(id: string){
    try
    {
        return container.isBound(id);
    }
    catch(e){
        return false;
    }
}