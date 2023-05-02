import { IModelConfig } from "@/components/Model/model";
import { IModel } from "@/types/model";
import { Container } from "inversify";
import { LLM } from "langchain/llms/base";

const llmContainer: Container = new Container();
const availableLLMs: string[] = [];

export function registerProvider<T extends IModel>(id: string, provider: (model: T) => LLM){
    if(!availableLLMs.includes(id)){
        availableLLMs.push(id);
    }

    llmContainer.bind<(model: T) => LLM>(id).toConstantValue(provider);
}

export function getProvider<T extends IModel>(model: T): (model: T) => LLM{
    return llmContainer.get<(model: T) => LLM>(model.type);
}

export function hasProvider(model: IModel){
    return availableLLMs.includes(model.type);
}

export function createLLM(model: IModel){
    if(!hasProvider(model)){
        throw new Error(`No provider for model ${model.id}`);
    }

    return getProvider(model)(model);
}

export function getAvailableLLMs(): string[]{
    return availableLLMs;
}