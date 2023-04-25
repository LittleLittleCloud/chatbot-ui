import { IMessage } from "@/types/chat";
import { InputValues } from "langchain/dist/schema";
import { BaseMemory } from "langchain/memory";
export type OutputValues = Record<string, any>;
export type MemoryVariables = Record<string, any>;

export class ChatMemory extends BaseMemory{
    memoryKey = "history";
    fromKey = "from";
    contentKey = "content";
    outputKey = "output";
    chatHistory: IMessage[] = [];

    constructor({memoryKey, fromKey, contentKey, outputKey, history}: {memoryKey?: string, fromKey?: string, contentKey?: string, outputKey?: string, history?: IMessage[]} = {}){
        super();
        if(memoryKey){
            this.memoryKey = memoryKey;
        }
        if(fromKey){
            this.fromKey = fromKey;
        }
        if(contentKey){
            this.contentKey = contentKey;
        }
        if(outputKey){
            this.outputKey = outputKey;
        }
        if(history){
            this.chatHistory = history;
        }
    }

    async saveContext(inputValues: InputValues, outputValues: OutputValues): Promise<void> {
        console.log(outputValues);
        var from: string = inputValues[this.fromKey];
        var content: string = inputValues[this.contentKey];
        this.chatHistory.push({from: from, content: content, id: 'text/plain'});
        var output = outputValues["response"];
        if(output){
            this.chatHistory.push({from: this.outputKey, content: output, id: 'text/plain'});
        }
    }

    async loadMemoryVariables(_values: InputValues): Promise<MemoryVariables> {
        var history: string[] = this.chatHistory.map((message: IMessage) => `${message.from}:${message.content}`);
        return {
            [this.memoryKey]: history.join('\n')
        };
    }
}