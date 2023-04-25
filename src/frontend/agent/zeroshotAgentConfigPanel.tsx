import { configPanelProviderType } from '@/utils/app/agentConfigPannelProvider';
import { getAvailableLLMs, getProvider, hasProvider } from "@/utils/app/llmProvider";
import { IZeroshotAgent } from './zeroshotAgent';
import { EditableSavableTextField, EditableSelectField } from '@/components/Global/EditableSavableTextField';
import { Chip, Divider, Stack } from '@mui/material';
import { getConfigPanelProvider, hasConfigPanelProvider } from '@/utils/app/configPanelProvider';
import React from 'react';
import { IModelMetaData } from '@/model/type';

export const ZeroshotAgentConfigPanel: configPanelProviderType<IZeroshotAgent> = (agent, onAgentConfigChanged) => {
    const [selectedLLMModelID, setSelectedLLMModelID] = React.useState(agent.llm.id);
    const [llm, setLLM] = React.useState(agent.llm);
    const availableLLMModels = getAvailableLLMs();
    const LLMSettingPanel = (props: {model: IModelMetaData, onChange: (model: IModelMetaData) => void}) => {
        if(hasConfigPanelProvider(selectedLLMModelID)){
            return getConfigPanelProvider(props.model.id)(props.model, props.onChange);
        }
        return <></>;
    }

    React.useEffect(() => {
        // create default llm config
        if(selectedLLMModelID != agent.llm.id){
            var newLLM: IModelMetaData = {id: selectedLLMModelID};
            setLLM(newLLM);
            onAgentConfigChanged({...agent, llm: newLLM});
        }
    }, [selectedLLMModelID]);

    return (
        <Stack
            spacing={2}>
            <EditableSavableTextField name='prefix prompt' value={agent.prefixPrompt} onChange={(value) => onAgentConfigChanged({...agent, prefixPrompt: value})}/>
            <EditableSavableTextField name='suffix prompt' value={agent.suffixPrompt} onChange={(value) => onAgentConfigChanged({...agent, suffixPrompt: value})}/>
            <EditableSelectField name='selected llm model' options={availableLLMModels} value={selectedLLMModelID} onChange={(value) => setSelectedLLMModelID(value)}/>
            <Divider textAlign='left' >{`setting: ${selectedLLMModelID}`}</Divider>
            <LLMSettingPanel model = {llm} onChange={(model) => onAgentConfigChanged({...agent, llm: model})}/>
        </Stack>
    )
};