import { IGroup } from '@/types/group';
import { IAgent } from './agent';

export interface IUISettings extends IRecord{
}

export type availableValueTypes = string | number | boolean | Blob | undefined | IRecord;
export interface IRecord extends Record<string, availableValueTypes | availableValueTypes[]>{
  type: string;
}

export interface IStorage extends IRecord{
  agents: IAgent[];
  groups: IGroup[];
}