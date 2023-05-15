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

export function saveStorage(storage: IStorage){
  localStorage.setItem('storage', JSON.stringify(storage));
}

export function loadStorage(): IStorage{
  var storage = localStorage.getItem('storage');
  if(storage){
    return JSON.parse(storage);
  }
  return {
    type: "storage",
    agents: [],
    groups: []
  };
}