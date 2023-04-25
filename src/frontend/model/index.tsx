import { registerProvider } from "@/utils/app/llmProvider";
import { IGPT35Turbo, ITextDavinci003, TextDavinci003, GPT_35_TURBO } from "./azure/GPT";
import { registerConfigPanelProvider } from "@/utils/app/configPanelProvider";
import { AzureGPT35TurboConfig, AzureTextDavinci003Config } from "./azure/ConfigPanel";

// register LLM provider
registerProvider("azure.text-davinci-003", (model: ITextDavinci003) => new TextDavinci003(model));
registerProvider("azure.gpt-35-turbo", (model: IGPT35Turbo) => new GPT_35_TURBO(model));
registerConfigPanelProvider<ITextDavinci003>("azure.text-davinci-003",
    (config, onConfigChange) => AzureTextDavinci003Config(config, onConfigChange));
registerConfigPanelProvider<IGPT35Turbo>("azure.gpt-35-turbo",
    (config, onConfigChange) => AzureGPT35TurboConfig(config, onConfigChange));