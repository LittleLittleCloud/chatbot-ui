import { IGroup } from '@/components/Chat/Chat';
import { IAgent } from './agent';
import { IModelMetaData } from '@/model/type';

export interface IUISettings extends IRecord{
}

export type availableValueTypes = string | number | boolean | Blob | undefined | IRecord;
export interface IRecord extends Record<string, availableValueTypes | availableValueTypes[]>{
  id: string;
}

export interface IStorage extends IRecord{
  agents: IAgent[];
  groups: IGroup[];
}