import { IRecord } from "@/types/storage";

interface IModel extends IRecord{
    type: string;
    description?: string;
}

interface ILLMModel extends IModel{
    isStreaming: boolean;
    isChatModel: boolean;
}

export type {IModel as IModel, ILLMModel}