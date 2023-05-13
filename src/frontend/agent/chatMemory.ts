import { IMessage } from "@/types/chat";
import { InputValues } from "langchain/dist/schema";
import { BaseMemory } from "langchain/memory";
export type OutputValues = Record<string, any>;
export type MemoryVariables = Record<string, any>;

export class ChatMemory extends BaseMemory{
    get memoryKeys(): string[] {
        return [this.memoryKey];
    }
    memoryKey = "history";
    fromKey = "from";
    contentKey = "content";
    outputKey = "output";
    useChatML = false;
    chatHistory: Omit<IMessage, 'type'>[] = [];

    constructor({memoryKey, fromKey, contentKey, outputKey, history, useChatML}: {memoryKey?: string, fromKey?: string, contentKey?: string, outputKey?: string, history?: IMessage[], useChatML?: boolean} = {}){
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
        if(useChatML){
            this.useChatML = useChatML;
        }
    }

    async saveContext(inputValues: InputValues, outputValues: OutputValues): Promise<void> {
        var from: string = inputValues[this.fromKey];
        var content: string = inputValues[this.contentKey];
        this.chatHistory.push({from: from, content: content, timestamp: Date.now()});
        var output = outputValues["response"];
        if(output){
            this.chatHistory.push({from: this.outputKey, content: output});
        }
    }

    async loadMemoryVariables(_values: InputValues): Promise<MemoryVariables> {
        var history: string[] = [];
        if(this.useChatML){
            history = this.chatHistory.map((message) => `<|im_start|>${message.from}\n${message.content?.toString()}\n<|im_end|>`);
        }
        else{
            history = this.chatHistory.map((message) => `${message.from}:${message.content}`);
        }
        return {
            [this.memoryKey]: history.join('\n')
        };
    }
}