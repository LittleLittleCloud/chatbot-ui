import { IChatAgent } from "@/agent/chatAgent";
import { IGPT35Turbo } from "@/model/openai/GPT"
import { MultiAgentGroup } from "./group";
import { Logger } from "@/utils/logger";
import { AgentProvider } from "@/agent/agentProvider";

test('multi-agent response test', async () => {
    const OPENAI_API_KEY  = process.env.OPENAI_API_KEY;
    var llm: IGPT35Turbo = {
        type: "openai.gpt-35-turbo",
        isChatModel: true,
        model: "gpt-3.5-turbo",
        apiKey: OPENAI_API_KEY,
        isStreaming: true,
        maxTokens: 64,
        temperature: 0.5,
        topP: 1,
        frequencyPenalty: 0,
    } as IGPT35Turbo;

    var alice: IChatAgent = {
        type: 'agent.chat',
        alias: "alice",
        description: "an enthusiastic bot with rich knowledge over computer science",
        avatar: "test",
        includeHistory: true,
        suffixPrompt: "alice:",
        includeName: true,
        useMarkdown: true,
        llm: llm,
    } as IChatAgent;

    var bob: IChatAgent = {
        type: 'agent.chat',
        alias: "bob",
        description: "an enthusiastic bot with rich knowledge over real estate",
        avatar: "test",
        includeHistory: true,
        includeName: true,
        useMarkdown: true,
        suffixPrompt: "bob:",
        llm: llm,
    } as IChatAgent;

    var group = new MultiAgentGroup([alice, bob], []);
    var userMessage = {
        from: 'user',
        content: 'hello, I want to buy a house',
        type: 'message.markdown',
    };

    var responses = await group.step(userMessage);
    expect(responses.length).toBe(2);
})

test('multi-agent max-vote test', async () => {
    const OPENAI_API_KEY  = process.env.OPENAI_API_KEY;
    var llm: IGPT35Turbo = {
        type: "openai.gpt-35-turbo",
        isChatModel: true,
        model: "gpt-3.5-turbo-0613",
        apiKey: OPENAI_API_KEY,
        isStreaming: true,
        maxTokens: 256,
        temperature: 0,
        topP: 1,
        frequencyPenalty: 0,
    } as IGPT35Turbo;

    var alice: IChatAgent = {
        type: 'agent.chat',
        alias: "alice",
        description: "a computer scientist",
        avatar: "test",
        includeHistory: true,
        suffixPrompt: "alice:",
        includeName: true,
        useMarkdown: true,
        llm: llm,
    } as IChatAgent;

    var bob: IChatAgent = {
        type: 'agent.chat',
        alias: "bob",
        description: "a real estate agent",
        avatar: "test",
        includeHistory: true,
        includeName: true,
        useMarkdown: true,
        suffixPrompt: "bob:",
        llm: llm,
    } as IChatAgent;

    var group = new MultiAgentGroup([alice, bob], []);
    var userMessage = {
        from: 'Avatar',
        content: 'hello, I want to buy a house',
        type: 'message.markdown',
    };
    var rolePlay = await group.rolePlay(userMessage);
    expect(rolePlay.alias).toBe('bob');
    var bobAgent = AgentProvider.getProvider(rolePlay)(rolePlay);
    var response = await bobAgent.call([userMessage], [alice, bob]);
    rolePlay = await group.rolePlay(response);
    expect(rolePlay.alias).toBe('Avatar');
})

test('single-agent max-vote test', async () => {
    const OPENAI_API_KEY  = process.env.OPENAI_API_KEY;
    var llm: IGPT35Turbo = {
        type: "openai.gpt-35-turbo",
        isChatModel: true,
        model: "gpt-3.5-turbo-0613",
        apiKey: OPENAI_API_KEY,
        isStreaming: true,
        maxTokens: 1024,
        temperature: 0,
        topP: 1,
        frequencyPenalty: 0,
    } as IGPT35Turbo;

    var alice: IChatAgent = {
        type: 'agent.chat',
        alias: "alice",
        description: "a computer scientist",
        avatar: "test",
        includeHistory: true,
        suffixPrompt: "alice:",
        includeName: true,
        useMarkdown: true,
        llm: llm,
    } as IChatAgent;
    var group = new MultiAgentGroup([alice], []);

    var userMessage = {
        from: 'Avatar',
        content: 'hello, I want to buy a house',
        type: 'message.markdown',
    };

    var rolePlay = await group.rolePlay(userMessage);
    expect(rolePlay.alias).toBe('alice');
    var aliceAgent = AgentProvider.getProvider(rolePlay)(rolePlay);
    var response = await aliceAgent.call([userMessage], [alice]);
    rolePlay = await group.rolePlay(response);
    expect(rolePlay.alias).toBe('Avatar');
})
