import { registerLLMProvider } from "@/utils/app/llmProvider";
import { IGPT35Turbo, ITextDavinci003, OpenAIModel } from "./GPT";
import { ModelConfig } from "./ModelConfig";

registerLLMProvider<ITextDavinci003>(
    "openai.text-davinci-003",
    (model) => new OpenAIModel(model),
    (model, onConfigChange) => ModelConfig(model, (model) => onConfigChange(model as ITextDavinci003)),
    {
        type: "openai.text-davinci-003",
        maxTokens: 64,
        temperature: 0.7,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        isChatModel: false,
        isStreaming: true,
        model: "text-davinci-003",
    } as ITextDavinci003);

registerLLMProvider<IGPT35Turbo>(
    "openai.gpt-35-turbo",
    (model) => new OpenAIModel(model),
    (model, onConfigChange) => ModelConfig(model, (model) => onConfigChange(model as IGPT35Turbo)),
    {
        type: "openai.gpt-35-turbo",
        maxTokens: 64,
        temperature: 0.7,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        isChatModel: true,
        isStreaming: true,
        model: "gpt-3.5-turbo",
    } as IGPT35Turbo);
