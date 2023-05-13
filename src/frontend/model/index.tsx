import { registerLLMModelDefaultValue, registerProvider } from "@/utils/app/llmProvider";
import { IGPT35Turbo, ITextDavinci003, TextDavinci003, GPT_35_TURBO } from "./azure/GPT";
import { registerConfigPanelProvider } from "@/utils/app/configPanelProvider";
import { AzureGPT35TurboConfig, AzureTextDavinci003Config } from "./azure/ConfigPanel";

// register LLM provider
registerProvider("azure.text-davinci-003", (model: ITextDavinci003) => new TextDavinci003(model));
registerProvider("azure.gpt-35-turbo", (model: IGPT35Turbo) => new GPT_35_TURBO(model));
registerLLMModelDefaultValue("azure.text-davinci-003",
    {
        type: "azure.text-davinci-003",
        maxTokens: 64,
        temperature: 0.7,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        isChatModel: false,
        isStreaming: true,
        stop: ["\n"]} as ITextDavinci003);
registerLLMModelDefaultValue("azure.gpt-35-turbo",
    {
        type: "azure.gpt-35-turbo",
        maxTokens: 64,
        temperature: 0.7,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        isChatModel: true,
        isStreaming: true} as IGPT35Turbo);
        
registerConfigPanelProvider<ITextDavinci003>("azure.text-davinci-003",
    (config, onConfigChange) => AzureTextDavinci003Config(config, onConfigChange));
registerConfigPanelProvider<IGPT35Turbo>("azure.gpt-35-turbo",
    (config, onConfigChange) => AzureGPT35TurboConfig(config, onConfigChange));