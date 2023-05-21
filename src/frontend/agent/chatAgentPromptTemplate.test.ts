import { ChatAgentPromptTemplate, IChatAgent } from "./chatAgent"

test('chat agent prompt template format test', async () => {
    var agent: IChatAgent = {
        type: 'agent.chat',
        alias: "test",
        description: "test",
        avatar: "test",
        prefixPrompt: "prefix",
        suffixPrompt: "suffix",
        useMarkdown: true,
        includeHistory: true,
        includeName: true,
    };
    var promptTemplate = new ChatAgentPromptTemplate(agent);

    var input = {
        history: "history",
        from: "from",
        content: "content",
        intermediate_steps: [],
    };

    var expected = `prefix
You name is test
use markdown to format response
###chat history###
history
###
###new message###
from: content
suffix`;
    var actual = await promptTemplate.format(input);
    expect(actual).toBe(expected);
});