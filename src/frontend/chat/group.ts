import { AgentProvider } from "@/agent/agentProvider";
import { IAgent } from "@/agent/type";
import { IGroup } from "@/chat/type";
import { IMarkdownMessage } from "@/message/MarkdownMessage";
import { IMessage, IsUserMessage } from "@/message/type";

export class MultiAgentGroup{
    private TERMINATE_MESSAGE: IMarkdownMessage = {
        from: "Avatar",
        content: "I have all the information I need, thank you!",
        type: 'message.markdown',
    };
    private ASK_USER_MESSAGE: IMarkdownMessage = {
        from: "Avatar",
        content: "// ask Avatar for his response",
        type: 'message.markdown',
    };

    private user: IAgent = {
        type: 'agent.chat',
        alias: "Avatar",
        description: "a user who seeks for help",
    } as IAgent;

    public agents: IAgent[];
    public conversation: IMessage[];
    
    constructor(agents: IAgent[], conversation: IMessage[]){
        this.agents = agents;
        this.conversation = conversation;
    }

    public async step(message: IMessage): Promise<IMessage[]>{
        // gather responses from all agents except the sender
        // if sender is not user, include terminate message from user
        var responses: IMessage[] = [];
        this.conversation.push(message);
        for (var agent of this.agents){
            if (agent.alias == message.from){
                continue;
            }
            var agentExecutor = AgentProvider.getProvider(agent)(agent);
            var response = await agentExecutor.call(this.conversation, this.agents);
            responses.push(response);
        }

        if (!IsUserMessage(message)){
            responses.push(this.ASK_USER_MESSAGE);
        }

        // shuffle responses
        responses = responses.sort(() => Math.random() - 0.5);

        return responses;
    }

    public async maxVote(messages: IMessage[]): Promise<IMessage>{
        // select the message with most votes
        var votes: Record<string, number> = {};
        for (var agent of this.agents){
            var agentExecutor = AgentProvider.getProvider(agent)(agent);
            var voteIndex = await agentExecutor.ask(messages, this.conversation, [this.user, ...this.agents]);
            if (voteIndex >= 0){
                var selectedMessage = messages[voteIndex];
                if (selectedMessage.from in votes){
                    votes[selectedMessage.from] += 1;
                }
                else{
                    votes[selectedMessage.from] = 1;
                }
            }
        }

        var maxVote = 0;
        var maxVoteMessage: IMessage = messages[0];
        for (var message of messages){
            if (message.from in votes){
                if (votes[message.from] > maxVote){
                    maxVote = votes[message.from];
                    maxVoteMessage = message;
                }
            }
        }

        return maxVoteMessage;
    }

    public async rolePlay(messages: IMessage): Promise<IAgent>{
        this.conversation.push(messages);
        var votes: Record<string, number> = {};
        var agent_list = [this.user, ...this.agents];
        for (var agent of this.agents){
            var agentExecutor = AgentProvider.getProvider(agent)(agent);
            var voteIndex = await agentExecutor.rolePlay(this.conversation, agent_list);
            if (voteIndex >= 0){
                var selectedAgent = agent_list[voteIndex];
                if (selectedAgent.alias in votes){
                    votes[selectedAgent.alias] += 1;
                }
                else{
                    votes[selectedAgent.alias] = 1;
                }
            }
        }

        var maxVote = 0;
        var maxVoteIndex = 0;
        for (var i = 0; i < agent_list.length; i++){
            var agent = agent_list[i];
            if (agent.alias in votes){
                if (votes[agent.alias] > maxVote){
                    maxVote = votes[agent.alias];
                    maxVoteIndex = i;
                }
            }
        }

        return agent_list[maxVoteIndex];
    }

    public async chat(message: IMessage, max_round: number): Promise<IMessage[]>{
        this.conversation.push(message);
        var round = 0;
        while (true){
            var agent = await this.rolePlay(this.conversation);
            if(agent == this.user){
                return this.conversation;
            }

            var agentExecutor = AgentProvider.getProvider(agent)(agent);
            var response = await agentExecutor.call(this.conversation, this.agents);
            // var responses = await this.step(message);
            // var response = await this.maxVote(responses);
            // if(response == this.TERMINATE_MESSAGE){
            //     return this.conversation;
            // }

            // if(response == this.ASK_USER_MESSAGE){
            //     return this.conversation;
            // }

            this.conversation.push(response);
            message = response;
            round += 1;

            if (round >= max_round){
                return this.conversation;
            }
        }
    }
}