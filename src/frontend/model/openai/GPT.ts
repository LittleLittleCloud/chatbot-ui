import { ILLMModel } from "@/types/model";
import { CallbackManager, CallbackManagerForLLMRun } from "langchain/callbacks";
import { LLMResult } from "langchain/dist/schema";
import { BaseLLM, LLM } from "langchain/llms/base";

export interface IOpenAIModel extends ILLMModel
{
    maxTokens: number;
    temperature: number;
    topP: number;
    presencePenalty: number;
    frequencyPenalty: number;
    stop: string[];
    apiKey?: string;
    model: string;
}

export interface ITextDavinci003 extends IOpenAIModel{
    type: "openai.text-davinci-003";
    model: "text-davinci-003";
    isStreaming: true;
    isChatModel: false;
}

export interface IGPT35Turbo extends IOpenAIModel{
    type: "openai.gpt-35-turbo";
    model: "gpt-3.5-turbo";
    isStreaming: true;
    isChatModel: true;
}

interface IOpenAIModelOutput{
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        text: string;
        message: {
            role: string;
            content: string;
        };
        index: number;
        logprobs: {
            token_logprobs: number[];
            top_logprobs: number[];
        };
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export class OpenAIModel extends LLM{
    type: string;
    isStreaming: boolean;
    maxTokens: number;
    temperature: number;
    topP: number;
    presencePenalty: number;
    frequencyPenalty: number;
    stop: string[];
    apiKey?: string;
    model?: string;
    isChatModel: boolean;

    constructor(fields: IOpenAIModel){
        super({});
        this.type = fields.type;
        this.isStreaming = fields.isStreaming;
        this.maxTokens = fields.maxTokens;
        this.temperature = fields.temperature;
        this.topP = fields.topP;
        this.presencePenalty = fields.presencePenalty;
        this.frequencyPenalty = fields.frequencyPenalty;
        this.stop = fields.stop;
        this.apiKey = fields.apiKey;
        this.model = fields.model;
        this.isChatModel = fields.isChatModel;
    }

    async _call(prompt: string, stop?: string[] | this["CallOptions"] | undefined, runManager?: CallbackManagerForLLMRun | undefined): Promise<string> {
        if(this.isChatModel){
            var endPoint = "https://api.openai.com/v1/chat/completions";
            var message = [
                {"role": "system", "content": prompt},
            ];
            var response = await fetch(endPoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    messages: message,
                    max_tokens: this.maxTokens,
                    temperature: this.temperature,
                    top_p: this.topP,
                    presence_penalty: this.presencePenalty,
                    frequency_penalty: this.frequencyPenalty,
                    stop: stop ?? this.stop,
                    stream: false,
                    model: this.model,
                })
            });

            if(!response.ok){
                var error = await response.json();
                var errorMessage = `Failed to call OpenAI API: ${error.error.message}`;
                throw new Error(errorMessage);
            }

            var result = await response.json() as IOpenAIModelOutput;
            return result.choices[0].message.content;
        }
        else{
            var endPoint = "https://api.openai.com/v1/completions";
            var response = await fetch(endPoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    prompt: prompt,
                    max_tokens: this.maxTokens,
                    temperature: this.temperature,
                    top_p: this.topP,
                    presence_penalty: this.presencePenalty,
                    frequency_penalty: this.frequencyPenalty,
                    stop: stop ?? this.stop,
                    stream: false,
                    model: this.model,
                })
            });
    
            if(!response.ok){
                var error = await response.json();
                var errorMessage = `Failed to call OpenAI API: ${error.error.message}`;
                throw new Error(errorMessage);
            }
    
            var result = await response.json() as IOpenAIModelOutput;
            return result.choices[0].text;
        }
    }

    _llmType(): string {
        return this.type;
    }
}