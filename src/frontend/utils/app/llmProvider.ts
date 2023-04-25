import { IModelConfig } from "@/components/Model/model";
import { IModelMetaData } from "@/model/type";
import { Container } from "inversify";
import { LLM } from "langchain/llms/base";

const llmContainer: Container = new Container();
const availableLLMs: string[] = [];

export function registerProvider<T extends IModelMetaData>(id: string, provider: (model: T) => LLM){
    if(!availableLLMs.includes(id)){
        availableLLMs.push(id);
    }

    llmContainer.bind<(model: T) => LLM>(id).toConstantValue(provider);
}

export function getProvider<T extends IModelMetaData>(model: T): (model: T) => LLM{
    return llmContainer.get<(model: T) => LLM>(model.id);
}

export function hasProvider(model: IModelMetaData){
    return availableLLMs.includes(model.id);
}

export function createLLM(model: IModelMetaData){
    if(!hasProvider(model)){
        throw new Error(`No provider for model ${model.id}`);
    }

    return getProvider(model)(model);
}

export function getAvailableLLMs(): string[]{
    return availableLLMs;
}