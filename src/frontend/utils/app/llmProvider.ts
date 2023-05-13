import { IModelConfig } from "@/components/Model/model";
import { ILLMModel, IModel } from "@/types/model";
import { Container } from "inversify";
import { LLM } from "langchain/llms/base";

const llmContainer: Container = new Container();
const defaultValues: Record<string, ILLMModel> = {};
const availableLLMs: string[] = [];

export function registerProvider<T extends ILLMModel>(id: string, provider: (model: T) => LLM){
    if(!availableLLMs.includes(id)){
        availableLLMs.push(id);
    }

    llmContainer.bind<(model: T) => LLM>(id).toConstantValue(provider);
}

export function registerLLMModelDefaultValue<T extends ILLMModel>(type: string, defaultValue: T){
    defaultValues[type] = defaultValue;
}

export function getLLMModelDefaultValue(type: string): ILLMModel{
    if(!defaultValues[type]){
        throw new Error(`No default value for model ${type}`);
    }
    
    return defaultValues[type];
}

export function getProvider<T extends ILLMModel>(model: T): (model: T) => LLM{
    return llmContainer.get<(model: T) => LLM>(model.type);
}

export function hasProvider(model: ILLMModel): boolean{
    return availableLLMs.includes(model.type);
}

export function createLLM(model: ILLMModel): LLM{
    if(!hasProvider(model)){
        throw new Error(`No provider for model ${model.id}`);
    }

    return getProvider(model)(model);
}

export function getAvailableLLMs(): string[]{
    return availableLLMs;
}