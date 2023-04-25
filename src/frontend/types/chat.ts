import { OpenAIModel } from './openai';
import { IRecord } from './storage';

export interface Message {
  role: Role;
  content: string;
}

export type Role = 'assistant' | 'user';

export interface ChatBody {
  to: string;
  messages: Message[];
  from: string;
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  model: OpenAIModel;
  prompt: string;
  folderId: string | null;
}

export interface IMessage extends IRecord{
  from: string | '__user',
  id: 'text/plain' | 'text/markdown',
  content: string | Blob
}