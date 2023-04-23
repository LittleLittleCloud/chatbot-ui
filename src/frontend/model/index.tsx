import { registerProvider } from "@/utils/app/llmProvider";
import { IGPT35Turbo, ITextDavinci003, TextDavinci003, GPT_35_TURBO } from "./azure/GPT";
import { registerConfigPanelProvider } from "@/utils/app/configPanelProvider";
import { AzureGPT35TurboConfig, AzureTextDavinci003Config } from "./azure/ConfigPanel";

// register LLM provider
registerProvider("azure.text-davinci-003", (model: ITextDavinci003) => new TextDavinci003(model));
registerProvider("azure.gpt-35-turbo", (model: IGPT35Turbo) => new GPT_35_TURBO(model));
registerConfigPanelProvider<TextDavinci003>("azure.text-davinci-003", (config, onConfigChanged) => <AzureTextDavinci003Config model={config} onModelConfigChanged={onConfigChanged}/>);
registerConfigPanelProvider<GPT_35_TURBO>("azure.gpt-35-turbo", (config, onConfigChanged) => <AzureGPT35TurboConfig model={config} onModelConfigChanged={onConfigChanged}/>);