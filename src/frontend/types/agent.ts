import { IRecord } from "./storage";

interface IAgent extends IRecord{
    alias: string,
    description: string,
    avatar: string,
  }


export type { IAgent }