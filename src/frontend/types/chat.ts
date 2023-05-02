import { OpenAIModel } from './openai';
import { IRecord } from './storage';

export interface Message {
  role: Role;
  content: string;
}

export type Role = 'assistant' | 'user';
export interface IMessage extends IRecord{
  timestamp: number;
  from: string | '__user',
  type: 'text/plain' | 'text/markdown',
  content: string | Blob
}