import { registerAgentProvider } from "@/utils/app/agentProvider";
import { IChatAgent, IZeroshotAgentMessage, initializeChatAgentExecutor } from "./chatAgent";
import { ChatAgentConfigPanel, ZeroshotMessage } from "./chatAgentConfigPanel";
import { registerMessageUIProvider } from "@/utils/app/configPanelProvider";

registerAgentProvider(
            "agent.chat",
            (agent, history) => initializeChatAgentExecutor(agent as IChatAgent, history),
            (agent, onConfigChange) => ChatAgentConfigPanel(agent as IChatAgent, onConfigChange),
            {
                type: "agent.chat",
                prefixPrompt: "you are a chatbot in a chat room. Try to be helpful and friendly. Below is chat history for you to reference:",
                suffixPrompt: `###chat history###: 
{history} 
###end of chat history###

###new message###
{from}: {content} 
your response(don't inlcude newline, use Chinese for all response):`,
            } as IChatAgent);

registerMessageUIProvider<IZeroshotAgentMessage>(
            "message.zeroshot",
            (message, onChange) => ZeroshotMessage(message, onChange));