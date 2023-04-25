import { IRecord } from "@/types/storage";

interface IModelMetaData extends IRecord{
    id: string;
    description?: string;
}

export type {IModelMetaData}