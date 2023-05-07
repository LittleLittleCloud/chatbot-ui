import { configPanelProviderType } from '@/utils/app/agentConfigPannelProvider';
import { getAvailableLLMs, getProvider, hasProvider } from "@/utils/app/llmProvider";
import { IZeroshotAgent } from './zeroshotAgent';
import { EditableSavableTextField, EditableSelectField, SettingSection, SmallMultipleSelectSetting, SmallSelectSetting, SmallTextSetting } from '@/components/Global/EditableSavableTextField';
import { Chip, Divider, Stack } from '@mui/material';
import { getConfigPanelProvider, hasConfigPanelProvider } from '@/utils/app/configPanelProvider';
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