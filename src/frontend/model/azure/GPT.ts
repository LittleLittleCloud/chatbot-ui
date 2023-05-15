import { BaseLLM, BaseLLMParams, LLM } from "langchain/llms/base";
import { ILLMModel, IModel } from '@/types/model';
import { IJsonConverter, extract } from "@/utils/app/convertJson";
import { injectable } from "inversify";
import { IRecord } from "@/types/storage";
import { RecordMap } from "@/utils/app/recordProvider";
import { CallbackManagerForLLMRun } from "langchain/callbacks";

// azure openai gpt parameters
interface IGPTBaseModelConfiguration extends ILLMModel {
    resourceName?: string,
    deploymentID?: string,
    apiKey?: string,
    temperature?: number,
    apiVersion?: string,
    maxTokens?: number,
    topP?: number,
    stop?: string[],
    presencePenalty?: number,
    frequencyPenalty?: number,
}

interface IGPTModelOutput{
    object: string;
    created: number;
    model: string;
    choices: {
        text: string;
        index: number;
        logprobs: {
            token_logprobs: number[];
            top_logprobs: number[];
        };
        finish_reason: string;
    }[];
}

abstract class GPTBase extends LLM{
    abstract type: string;
    abstract isStreaming: boolean;
    abstract isChatModel: boolean;

    apiKey?: string;
    temperature: number;
    resourceName?: string;
    deploymentID?: string;
    apiVersion: string = "2023-03-15-preview";
    maxTokens?: number = 16;
    topP?: number = 1;
    stream: boolean = false;
    stop?: string[];
    presencePenalty?: number = 0;
    frequencyPenalty?: number = 0;

    constructor(fields: Partial<IGPTBaseModelConfiguration & BaseLLMParams>){
        super(fields ?? {});
        this.apiKey = fields.apiKey ?? undefined;
        this.temperature = fields.temperature ?? 0.9;
        this.resourceName = fields.resourceName ?? undefined;
        this.deploymentID = fields.deploymentID ?? undefined;
        this.apiVersion = fields.apiVersion ?? "2022-12-01";
        this.maxTokens = fields.maxTokens ?? 128;
        this.topP = fields.topP ?? 1;
        
        this.stop = fields.stop ?? undefined;
        this.presencePenalty = fields.presencePenalty ?? 0;
        this.frequencyPenalty = fields.frequencyPenalty ?? 0;

        if(!this.apiKey) throw new Error("apiKey is required");
        if(!this.resourceName) throw new Error("resourceName is required");
        if(!this.deploymentID) throw new Error("deploymentID is required");
    }

    description?: string | undefined;

    async _call(prompt: string, stop?: string[], runManager?: CallbackManagerForLLMRun): Promise<string>{
        // https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT_NAME/completions?api-version=2022-12-01
        var endPoint = `https://${this.resourceName}.openai.azure.com/openai/deployments/${this.deploymentID}/completions?api-version=${this.apiVersion}`;
        stop = stop ?? this.isChatModel ? [...this.stop ?? [], "<|im_end|>"] : this.stop;
        if(this.isChatModel){
            prompt = `<|im_start|>system
            ${prompt}
            <|im_end|>
            <|im_start|>assistant`;
        }
        var response = await fetch(endPoint,{
            method: "POST",
            headers:[
                ["Content-Type", "application/json"],
                ["api-key", this.apiKey!],
            ],
            body: JSON.stringify({
                prompt: prompt,
                max_tokens: this.maxTokens,
                temperature: this.temperature,
                top_p: this.topP,
                presence_penalty: this.presencePenalty,
                frequency_penalty: this.frequencyPenalty,
                stream: false,
                stop: stop,
        })});

        if(response.status != 200){
            var error = await response.json();
            throw new Error(`Azure GPT API call failed. \r\n error code: ${error.error.code} \r\n error message: ${error.error.message}`);
        }
        var modelOutput: IGPTModelOutput = await response.json();
        return modelOutput.choices[0].text;
    }
}

interface IGPT35Turbo extends IGPTBaseModelConfiguration{
    type: 'azure.gpt-35-turbo',
    isStreaming: true,
    isChatModel: true,
}

class GPT_35_TURBO extends GPTBase {
    isStreaming = true;
    isChatModel = true;
    description = "The ChatGPT model (gpt-35-turbo) is a language model designed for conversational interfaces and the model behaves differently than previous GPT-3 models. Previous models were text-in and text-out, meaning they accepted a prompt string and returned a completion to append to the prompt. However, the ChatGPT model is conversation-in and message-out. The model expects a prompt string formatted in a specific chat-like transcript format, and returns a completion that represents a model-written message in the chat."
    type = "azure.gpt-35-turbo";

    constructor(fields: Partial<IGPT35Turbo>){
        super(fields ?? {});
        this.description = fields.description ?? this.description;
    }

    _llmType(): string {
        return this.type;
    }
}

interface ITextDavinci003 extends IGPTBaseModelConfiguration{
    type: 'azure.text-davinci-003';
    isStreaming: true;
    isChatModel: false;
}

class TextDavinci003 extends GPTBase {
    isStreaming = true;
    isChatModel = false;
    description = `Davinci is the most capable model and can perform any task the other models can perform, often with less instruction. For applications requiring deep understanding of the content, like summarization for a specific audience and creative content generation, Davinci produces the best results. The increased capabilities provided by Davinci require more compute resources, so Davinci costs more and isn't as fast as other models.
    Another area where Davinci excels is in understanding the intent of text. Davinci is excellent at solving many kinds of logic problems and explaining the motives of characters. Davinci has been able to solve some of the most challenging AI problems involving cause and effect.`
    type = "azure.text-davinci-003";

    constructor(fields: Partial<ITextDavinci003>){
        super(fields ?? {});
        this.description = fields.description ?? this.description;
    }

    _llmType(): string {
        return this.type;
    }
}

export { GPT_35_TURBO, TextDavinci003 };
export type { IGPT35Turbo, ITextDavinci003 };