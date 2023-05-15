import { IModelConfig } from "@/components/Model/model";
import { ILLMModel, IModel } from "@/types/model";
import { LLM } from "langchain/llms/base";

export type llmProviderType<T extends ILLMModel> = (model: T) => LLM;
export type llmConfigUIProviderType<T extends ILLMModel> = (config: T, onConfigChange: (config: T) => void) => JSX.Element;
const defaultValues: Record<string, ILLMModel> = {};
const llmProviders: Record<string, llmProviderType<ILLMModel>> = {};
const llmConfigUIProviders: Record<string, llmConfigUIProviderType<ILLMModel>> = {};
const availableLLMs: string[] = [];

export function registerLLMProvider<T extends ILLMModel>(id: string,
    llmProvider: llmProviderType<T>,
    llmConfigUIProvider: llmConfigUIProviderType<T>,
    llmDefaultConfig: T){
    if(!availableLLMs.includes(id)){
        availableLLMs.push(id);
    }

    llmProviders[id] = (model: ILLMModel) => llmProvider(model as T);
    llmConfigUIProviders[id] = (config: ILLMModel, onConfigChange: (config: ILLMModel) => void) => llmConfigUIProvider(config as T, onConfigChange as (config: T) => void);
    defaultValues[id] = llmDefaultConfig;
}

export function getLLMModelDefaultValue(type: string): ILLMModel{
    if(!defaultValues[type]){
        throw new Error(`No default value for model ${type}`);
    }

    return defaultValues[type];
}

export function getLLMConfigUIProvider(type: string): llmConfigUIProviderType<ILLMModel>{
    if(!hasLLMProvider(type)){
        throw new Error(`No provider for model ${type}`);
    }

    return llmConfigUIProviders[type];
}

export function getLLMProvider<T extends ILLMModel>(model: T): (model: T) => LLM{
    if(!hasLLMProvider(model.type)){
        throw new Error(`No provider for model ${model.id}`);
    }

    return llmProviders[model.type];
}

export function hasLLMProvider(type: string): boolean{
    return availableLLMs.includes(type);
}

export function getAvailableLLMs(): string[]{
    return availableLLMs;
}