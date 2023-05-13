import { IGPT35Turbo, ITextDavinci003, TextDavinci003, GPT_35_TURBO } from "./azure/GPT";
import { GPTConfig, AzureTextDavinci003Config } from "./azure/ConfigPanel";
import { registerLLMProvider } from "@/utils/app/llmProvider";

// register LLM provider
registerLLMProvider<ITextDavinci003>(
    "azure.text-davinci-003",
    (model) => new TextDavinci003(model),
    (model, onConfigChange) => GPTConfig(model, (model) => onConfigChange(model as ITextDavinci003)),
    {
        type: "azure.text-davinci-003",
        maxTokens: 64,
        temperature: 0.7,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        isChatModel: false,
        isStreaming: true,
        stop: ["\n"],
    } as ITextDavinci003);

registerLLMProvider<IGPT35Turbo>(
    "azure.gpt-35-turbo",
    (model) => new GPT_35_TURBO(model),
    (model, onConfigChange) => GPTConfig(model, (model) => onConfigChange(model as IGPT35Turbo)),
    {
        type: "azure.gpt-35-turbo",
        maxTokens: 64,
        temperature: 0.7,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        isChatModel: true,
        isStreaming: true,
    } as IGPT35Turbo);