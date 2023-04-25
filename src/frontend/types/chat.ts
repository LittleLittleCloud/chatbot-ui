import { OpenAIModel } from './openai';

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

export interface IMessage{
  from: string | '__user',
  mimeType: 'text/plain' | 'text/markdown',
  content: string | Blob
}