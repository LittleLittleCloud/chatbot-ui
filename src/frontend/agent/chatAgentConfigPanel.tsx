import { getAvailableLLMs, getLLMConfigUIProvider, getLLMModelDefaultValue, hasLLMProvider } from "@/utils/app/llmProvider";
import { IChatAgent, IZeroshotAgentMessage } from './chatAgent';
import { EditableSavableTextField, EditableSelectField, SettingSection, SmallLabel, SmallMultipleSelectSetting, SmallSelectSetting, SmallTextSetting, TinyLabel } from '@/components/Global/EditableSavableTextField';
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

    return (
        <Stack
            spacing={2}>
            <SettingSection
                title='prompt setting'
                toolTip='prompt settings'>
                <SmallTextSetting name='prefix prompt' value={agent.prefixPrompt} onChange={(value) => onAgentConfigChanged({...agent, prefixPrompt: value})}/>
                <SmallTextSetting name='suffix prompt' value={agent.suffixPrompt} onChange={(value) => onAgentConfigChanged({...agent, suffixPrompt: value})}/>
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

export const ZeroshotMessage: providerType<IZeroshotAgentMessage> = (message, onChange) => {
    const prompt = message.prompt ?? "no prompt";
    const error = message.error;
    const content = error ?? message.content;
    const [openContent, setOpenContent] = React.useState<'content' | 'prompt' | 'error'>(error ? "error" : "content");
    return (
        <Stack
            direction="column"
            spacing={1}>
            {openContent === 'content' &&
                <Markdown>{content.toString()}</Markdown>
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
                    <TinyLabel
                    onClick={() => setOpenContent('content')}
                    sx = {{
                        color: openContent == 'content' ? 'primary.main' : 'text.secondary',
                    }}>content</TinyLabel>
                }
                <Divider orientation="vertical" flexItem />
                <TinyLabel
                    onClick={() => setOpenContent('prompt')}
                    sx = {{
                        color: openContent == 'prompt' ? 'primary.main' : 'text.secondary',
                    }}>prompt</TinyLabel>
            </Stack>
        </Stack>
    )
}