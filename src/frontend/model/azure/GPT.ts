import { BaseLLM, BaseLLMParams, LLM } from "langchain/llms/base";
import { IModelMetaData } from "../type";

// azure openai gpt parameters
interface IGPTBaseModelConfiguration {
    id: string;
    resourceName?: string,
    deploymentID?: string,
    apiKey?: string,
    temperature?: number,
    apiVersion?: string,
    maxTokens?: number,
    topP?: number,
    stream?: boolean,
    stop?: string[],
    presencePenalty?: number,
    frequencyPenalty?: number,
    bestOf?: number,
}

interface IGPTModelOutput{
    id: string;
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

abstract class GPTBase extends LLM implements IGPTBaseModelConfiguration{
    abstract id: string;
    apiKey?: string;
    temperature: number;
    resourceName?: string;
    deploymentID?: string;
    apiVersion: string = "2022-12-01";
    maxTokens?: number = 16;
    topP?: number = 1;
    stream: boolean = false;
    stop?: string[];
    presencePenalty?: number = 0;
    frequencyPenalty?: number = 0;
    bestOf?: number = 1;

    constructor(fields: Partial<IGPTBaseModelConfiguration> & BaseLLMParams){
        super(fields ?? {});
        this.apiKey = fields.apiKey ?? undefined;
        this.temperature = fields.temperature ?? 0.9;
        this.resourceName = fields.resourceName ?? undefined;
        this.deploymentID = fields.deploymentID ?? undefined;
        this.apiVersion = fields.apiVersion ?? "2022-12-01";
        this.maxTokens = fields.maxTokens ?? 16;
        this.topP = fields.topP ?? 1;
        
        this.stream = fields.stream ?? false;
        this.stop = fields.stop ?? undefined;
        this.presencePenalty = fields.presencePenalty ?? 0;
        this.frequencyPenalty = fields.frequencyPenalty ?? 0;
        this.bestOf = fields.bestOf ?? 1;

        if(!this.apiKey) throw new Error("apiKey is required");
        if(!this.resourceName) throw new Error("resourceName is required");
        if(!this.deploymentID) throw new Error("deploymentID is required");
        if(this.bestOf != undefined && this.stream == true) throw new Error("bestOf cannot be used with stream");
    }

    async _call(prompt: string, stop?: string[]): Promise<string>{
        // https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT_NAME/completions?api-version=2022-12-01
        var endPoint = `https://${this.resourceName}.openai.azure.com/openai/deployments/${this.deploymentID}/completions?api-version=${this.apiVersion}`;
        var response = await fetch(endPoint,{
            method: "POST",
            headers:{
                "Content-Type": "application/json",
                "Authorization": "api-key " + this.apiKey,
            },
            body: JSON.stringify({
                prompt: prompt,
                max_tokens: this.maxTokens,
                temperature: this.temperature,
                top_p: this.topP,
                presence_penalty: this.presencePenalty,
                frequency_penalty: this.frequencyPenalty,
                best_of: this.bestOf,
                stream: this.stream,
                stop: stop ?? this.stop,
        })});

        if(response.status != 200) throw new Error("Azure GPT API call failed with status code " + response.status);
        var modelOutput: IGPTModelOutput = await response.json();

        return modelOutput.choices[0].text;
    }
}

interface IGPT35TurboModelConfiguration extends IGPTBaseModelConfiguration, IModelMetaData{
}

class GPT_35_TURBO extends GPTBase implements IGPT35TurboModelConfiguration{
    description = "The ChatGPT model (gpt-35-turbo) is a language model designed for conversational interfaces and the model behaves differently than previous GPT-3 models. Previous models were text-in and text-out, meaning they accepted a prompt string and returned a completion to append to the prompt. However, the ChatGPT model is conversation-in and message-out. The model expects a prompt string formatted in a specific chat-like transcript format, and returns a completion that represents a model-written message in the chat."
    id = "azure.gpt-35-turbo";

    constructor(fields: Partial<IGPT35TurboModelConfiguration> & BaseLLMParams & IModelMetaData){
        super(fields ?? {});
        this.description = fields.description ?? this.description;
    }

    _llmType(): string {
        return this.id;
    }
}

export { GPT_35_TURBO };
export type { IGPT35TurboModelConfiguration };