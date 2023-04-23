import { IModelConfig } from "@/components/Model/model";
import { IModelMetaData } from "@/model/type";
import { Container } from "inversify";

const container = new Container();
type providerType<T extends IModelMetaData> = (config: T, onConfigChange: (config: IModelMetaData) => void) => JSX.Element;

export function registerConfigPanelProvider<T extends IModelMetaData>(id: string, provider: providerType<T>){
    container.bind<providerType<T>>(id).toConstantValue(provider);
}

export function getConfigPanelProvider(id: string): providerType<IModelMetaData>{
    return container.get<providerType<IModelMetaData>>(id);
}

export function hasConfigPanelProvider(id: string){
    return container.isBound(id);
}