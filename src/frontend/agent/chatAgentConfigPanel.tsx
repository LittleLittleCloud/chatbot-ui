import { getAvailableLLMs, getLLMConfigUIProvider, getLLMModelDefaultValue, hasLLMProvider } from "@/utils/app/llmProvider";
import { ChatAgentPromptTemplate, IChatAgent, IZeroshotAgentMessage } from './chatAgent';
import { EditableSavableTextField, EditableSelectField, SettingSection, SmallLabel, SmallMultipleSelectSetting, SmallSelectSetting, SmallTextSetting, SmallToggleSetting, TinyClickableLabel, TinyLabel, useEffectAsync } from '@/components/Global/EditableSavableTextField';
import { Box, Chip, Divider, Stack } from '@mui/material';
import { providerType } from '@/utils/app/configPanelProvider';
import React from 'react';
import { ILLMModel, IModel } from '@/types/model';
import { agentConfigUIProvderType } from "@/utils/app/agentProvider";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { Markdown } from "@/components/Global/Markdown";

export const ChatAgentConfigPanel: agentConfigUIProvderType<IChatAgent> = (agent, onAgentConfigChanged) => {
    const [selectedLLMModelID, setSelectedLLMModelID] = React.useState(agent.llm?.type);
    const [llm, setLLM] = React.useState(agent.llm);
    const [promptPreview, setPromptPreview] = React.useState<string>("");
    const availableLLMModels = getAvailableLLMs();
    const LLMSettingPanel = (props: {model: ILLMModel, onChange: (model: ILLMModel) => void}) => {
        if(selectedLLMModelID != undefined && hasLLMProvider(selectedLLMModelID)){
            return getLLMConfigUIProvider(selectedLLMModelID)(props.model, (model: IModel) => props.onChange(model as ILLMModel));
        }
        return <></>;
    }

    React.useEffect(() => {
        // create default llm config
        if(selectedLLMModelID != agent.llm?.type && selectedLLMModelID != undefined){
            var newLLM: ILLMModel = getLLMModelDefaultValue(selectedLLMModelID);
            setLLM(newLLM);
            onAgentConfigChanged({...agent, llm: newLLM});
        }
    }, [selectedLLMModelID]);

    useEffectAsync(async () => {
        var inputVariables = {
            'history': "agent: hello world",
            'from': "user",
            'content': "hello world too",
            intermediate_steps: [],
        }

        var promptTemplate = new ChatAgentPromptTemplate(agent);
        var prompt = await promptTemplate.format(inputVariables);
        setPromptPreview(prompt);
    }, [agent]);

    return (
        <Stack
            spacing={2}>
            <SettingSection
                title='prompt setting'
                toolTip='prompt settings'>
                <SmallToggleSetting
                    name='markdown'
                    toolTip="add markdown prompt"
                    value={agent.useMarkdown}
                    onChange={(value) => onAgentConfigChanged({...agent, useMarkdown: value})}/>
                <SmallToggleSetting
                    name='include name'
                    toolTip="include agent name in prompt"
                    value={agent.includeName}
                    onChange={(value) => onAgentConfigChanged({...agent, includeName: value})}/>
                <SmallToggleSetting
                    name='include history'
                    toolTip="include history in prompt"
                    value={agent.includeHistory}
                    onChange={(value) => onAgentConfigChanged({...agent, includeHistory: value})}/>
                <SmallTextSetting name='prefix prompt' value={agent.prefixPrompt} onChange={(value) => onAgentConfigChanged({...agent, prefixPrompt: value})}/>
                <SmallTextSetting name='suffix prompt' value={agent.suffixPrompt} onChange={(value) => onAgentConfigChanged({...agent, suffixPrompt: value})}/>
                <SmallTextSetting
                    name='prompt preview'
                    toolTip="prompt preview"
                    value={promptPreview} />
            </SettingSection>
            
            <SettingSection
                    title='llm setting'
                    toolTip='llm settings'>
                    <SmallSelectSetting name='selected llm model' options={availableLLMModels} value={selectedLLMModelID} onChange={(value) => setSelectedLLMModelID(value)}/>
                    {selectedLLMModelID && llm != undefined &&
                        <LLMSettingPanel model = {llm} onChange={(model) => onAgentConfigChanged({...agent, llm: model})}/>
                    }
                </SettingSection>
        </Stack>
    )
};

export const MarkdownMessage: providerType<IZeroshotAgentMessage> = (message, onChange) => {
    const prompt = message.prompt ?? "no prompt";
    const error = message.error;
    const content = error ?? message.content;
    const [openContent, setOpenContent] = React.useState<'markdown' | 'plain text' | 'prompt' | 'error'>(error ? "error" : "markdown");
    return (
        <Stack
            direction="column"
            spacing={1}>
            {openContent === 'markdown' &&
                <Markdown>{content}</Markdown>
            }
            {
                openContent === 'plain text' &&
                <SmallLabel>{content.replace('\n', '<br />')}</SmallLabel>
            }
            {
                openContent === 'error' &&
                <SmallLabel
                    color='error.main'>{error}</SmallLabel>
            }
            {openContent === 'prompt' &&
                <SmallLabel>{prompt}</SmallLabel>
            }
            <Stack
                direction="row"
                spacing={1}>
                {
                    error &&
                    <TinyLabel
                        onClick={() => setOpenContent('error')}
                        sx = {{
                            color: openContent == 'error' ? 'error.dark' : 'error.main',
                        }}>error</TinyLabel>
                }
                {
                    !error &&
                    <TinyClickableLabel
                    onClick={() => setOpenContent('markdown')}
                    sx = {{
                        color: openContent == 'markdown' ? 'primary.main' : 'text.secondary',
                    }}>content</TinyClickableLabel>
                }
                <Divider orientation="vertical" flexItem />
                <TinyClickableLabel
                    onClick={() => setOpenContent('plain text')}
                    sx = {{
                        color: openContent == 'plain text' ? 'primary.main' : 'text.secondary',
                    }}>plain text</TinyClickableLabel>
            </Stack>
        </Stack>
    )
}