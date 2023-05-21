import { registerAgentProvider } from "@/utils/app/agentProvider";
import { IChatAgent, IZeroshotAgentMessage, initializeChatAgentExecutor } from "./chatAgent";
import { ChatAgentConfigPanel, MarkdownMessage } from "./chatAgentConfigPanel";
import { registerMessageUIProvider } from "@/utils/app/configPanelProvider";

registerAgentProvider(
            "agent.chat",
            (agent, history) => initializeChatAgentExecutor(agent as IChatAgent, history),
            (agent, onConfigChange) => ChatAgentConfigPanel(agent as IChatAgent, onConfigChange),
            {
                type: "agent.chat",
                prefixPrompt: "you are a chatbot in a chat room. Try to be helpful and friendly.",
                suffixPrompt: `your response:`,
                useMarkdown: true,
                includeHistory: true,
                includeName: true,
            } as IChatAgent);

registerMessageUIProvider<IZeroshotAgentMessage>(
            "message.zeroshot",
            (message, onChange) => MarkdownMessage(message, onChange));