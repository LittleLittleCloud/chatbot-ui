import { registerAgentExecutorProvider } from "@/utils/app/agentProvider";
import { IZeroshotAgent, IZeroshotAgentMessage, initializeZeroshotAgentExecutor } from "./zeroshotAgent";
import { registerAgentConfigPannelProvider } from "@/utils/app/agentConfigPannelProvider";
import { ZeroshotAgentConfigPanel, ZeroshotMessage } from "./zeroshotAgentConfigPanel";
import { registerMessageUIProvider } from "@/utils/app/configPanelProvider";

registerAgentExecutorProvider<IZeroshotAgent>(
            "agent.chat",
            (agent: IZeroshotAgent, history) => { return initializeZeroshotAgentExecutor(agent, history);});

registerAgentConfigPannelProvider<IZeroshotAgent>(
            "agent.chat",
            (agent, onConfigChange) => ZeroshotAgentConfigPanel(agent, onConfigChange));

registerMessageUIProvider<IZeroshotAgentMessage>(
            "message.zeroshot",
            (message, onChange) => ZeroshotMessage(message, onChange));