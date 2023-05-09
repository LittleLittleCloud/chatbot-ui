import { configPanelProviderType } from '@/utils/app/agentConfigPannelProvider';
import { getAvailableLLMs, getProvider, hasProvider } from "@/utils/app/llmProvider";
import { IZeroshotAgent, IZeroshotAgentMessage } from './zeroshotAgent';
import { EditableSavableTextField, EditableSelectField, SettingSection, SmallLabel, SmallMultipleSelectSetting, SmallSelectSetting, SmallTextSetting, TinyLabel } from '@/components/Global/EditableSavableTextField';
import { Chip, Divider, Stack } from '@mui/material';
import { getConfigPanelProvider, hasConfigPanelProvider, providerType } from '@/utils/app/configPanelProvider';
import React from 'react';
import { IModel } from '@/types/model';

export const ZeroshotAgentConfigPanel: configPanelProviderType<IZeroshotAgent> = (agent, onAgentConfigChanged) => {
    const [selectedLLMModelID, setSelectedLLMModelID] = React.useState(agent.llm?.type);
    const [llm, setLLM] = React.useState(agent.llm);
    const availableLLMModels = getAvailableLLMs();
    const LLMSettingPanel = (props: {model: IModel, onChange: (model: IModel) => void}) => {
        if(selectedLLMModelID != undefined && hasConfigPanelProvider(selectedLLMModelID)){
            return getConfigPanelProvider(selectedLLMModelID)(props.model, props.onChange);
        }
        return <></>;
    }

    React.useEffect(() => {
        // create default llm config
        if(selectedLLMModelID != agent.llm?.type && selectedLLMModelID != undefined){
            var newLLM: IModel = {type: selectedLLMModelID};
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
        <>
        <Stack
            direction="column"
            spacing={1}>
            {openContent === 'content' &&
                <SmallLabel>{content.toString()}</SmallLabel>
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
        </>
    )
}