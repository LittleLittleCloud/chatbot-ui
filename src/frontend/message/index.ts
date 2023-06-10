import { registerMessageUIProvider } from "@/utils/app/configPanelProvider";
import { IMarkdownMessage, MarkdownMessage } from "./MarkdownMessage";

registerMessageUIProvider<IMarkdownMessage>(
    "message.markdown",
    (message, onChange) => MarkdownMessage(message, onChange)
)