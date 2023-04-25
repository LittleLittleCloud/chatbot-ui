import { registerAgentExecutorProvider } from "@/utils/app/agentProvider";
import { IZeroshotAgent, initializeZeroshotAgentExecutor } from "./zeroshotAgent";
import { registerAgentConfigPannelProvider } from "@/utils/app/agentConfigPannelProvider";
import { ZeroshotAgentConfigPanel } from "./zeroshotAgentConfigPanel";

registerAgentExecutorProvider<IZeroshotAgent>(
            "agent.chat",
            (agent: IZeroshotAgent, history) => { return initializeZeroshotAgentExecutor(agent, history);});

registerAgentConfigPannelProvider<IZeroshotAgent>(
            "agent.chat",
            (agent, onConfigChange) => ZeroshotAgentConfigPanel(agent, onConfigChange));