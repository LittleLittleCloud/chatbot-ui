import { IModelConfig } from "@/components/Model/model";
import { IModel } from "@/model/type";
import { Container } from "inversify";

const container = new Container();
export type providerType<T extends IModel> = (config: T, onConfigChange: (config: T) => void) => JSX.Element;

export function registerConfigPanelProvider<T extends IModel>(id: string, provider: providerType<T>){
    container.bind<providerType<T>>(id).toConstantValue(provider);
}

export function getConfigPanelProvider(id: string): providerType<IModel>{
    return container.get<providerType<IModel>>(id);
}

export function hasConfigPanelProvider(id: string){
    return container.isBound(id);
}