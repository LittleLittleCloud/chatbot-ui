// config page for all available models

import { Key } from "@/components/Settings/Key";
import { IModelMetaData } from "@/model/type";
import { Grid, Stack, TextField, Card, CardContent, CardHeader, Avatar, Typography, CardActions, Button, Box, Container } from "@mui/material";
import { GetStaticProps } from "next";
import { useEffect, useState } from "react";
import { BaseLLM, LLM } from "langchain/dist/llms/base";
import { GPT_35_TURBO, IGPT35TurboModelConfiguration } from "@/model/azure/GPT";

interface TextCompletionModelConfig extends IModelConfig{
}

interface ImageGenerationModelConfig extends IModelConfig{
}

interface IModelConfig{
    avatar: string;
    alias: string;
    model: IModelMetaData & (LLM | BaseLLM | undefined);
}

interface ModelConfigProps {
    modelConfig: IModelConfig;
    onModelConfigChanged: (modelConfig: IModelConfig) => void;
}

interface ModelProps{
    modelConfigs: IModelConfig[];
    onModelConfigsChange: (modelConfigs: IModelConfig[]) => void;
}

interface IAzureGPTModelConfigPanelProps{
    model: GPT_35_TURBO;
    onModelConfigChanged: (modelConfig: GPT_35_TURBO) => void;
}

const AzureGPTModelConfigPanel: React.FC<IAzureGPTModelConfigPanelProps> = ({model, onModelConfigChanged}) => {
    const [apiKey, setApiKey] = useState(model.apiKey);
    const [description, setDescription] = useState(model.description);
    const [maxTokens, setMaxTokens] = useState(model.maxTokens);
    const [temperature, setTemperature] = useState(model.temperature);
    const [topP, setTopP] = useState(model.topP);
    const [frequencyPenalty, setFrequencyPenalty] = useState(model.frequencyPenalty);
    const [presencePenalty, setPresencePenalty] = useState(model.presencePenalty);
    const [stopSequences, setStopSequences] = useState(model.stop);

    useEffect(() => {
        setApiKey(model.apiKey);
        setMaxTokens(model.maxTokens);
        setTemperature(model.temperature);
        setDescription(model.description);
        setTopP(model.topP);
        setFrequencyPenalty(model.frequencyPenalty);
        setPresencePenalty(model.presencePenalty);
        setStopSequences(model.stop);
    }, [model]);

    return (
        <Stack spacing={2}>
            <TextField fullWidth type="password" label="ApiKey" value={apiKey} onChange={(e) => {setApiKey(e.target.value); onModelConfigChanged(new GPT_35_TURBO({ ...model, apiKey: e.target.value}));}}/>
            <TextField fullWidth label="MaxTokens" value={maxTokens} onChange={(e) => {setMaxTokens(Number(e.target.value)); onModelConfigChanged(new GPT_35_TURBO({ ...model, maxTokens: Number(e.target.value)}));}}/>
            <TextField fullWidth label="Temperature" type="number" value={temperature} onChange={(e) => {setTemperature(Number(e.target.value)); onModelConfigChanged(new GPT_35_TURBO({ ...model, temperature: Number(e.target.value)}));}}/>
            <TextField fullWidth label="TopP" type="number" value={topP} onChange={(e) => {setTopP(Number(e.target.value)); onModelConfigChanged(new GPT_35_TURBO({ ...model, topP: Number(e.target.value)}));}}/>
            <TextField fullWidth label="FrequencyPenalty" type="number" value={frequencyPenalty} onChange={(e) => {setFrequencyPenalty(Number(e.target.value)); onModelConfigChanged(new GPT_35_TURBO({ ...model, frequencyPenalty: Number(e.target.value)}));}}/>
            <TextField fullWidth label="PresencePenalty" type="number" value={presencePenalty} onChange={(e) => {setPresencePenalty(Number(e.target.value)); onModelConfigChanged(new GPT_35_TURBO({ ...model, presencePenalty: Number(e.target.value)}));}}/>
            <TextField fullWidth multiline label="Description" value={description} onChange={(e) => {setDescription(e.target.value); onModelConfigChanged(new GPT_35_TURBO({ ...model, description: e.target.value}));}}/>
        </Stack>);
};

const ModelConfigPanel: React.FC<ModelConfigProps> = ({modelConfig, onModelConfigChanged}) => {
    const [avatar, setAvatar] = useState(modelConfig.avatar);
    const [alias, setAlias] = useState(modelConfig.alias);
    const [description, setDescription] = useState(modelConfig.model.description);
    
    useEffect(() => {
        setAvatar(modelConfig.avatar);
        setAlias(modelConfig.alias);
        setDescription(modelConfig.model.description);
    }, [modelConfig]);
    
    const modelChangedHandler = (modelConfig: IModelConfig) => onModelConfigChanged(modelConfig);

    // call onModelConfigChanged when any of the fields change
    return (
        <div>
            <Stack spacing={2}>
                <TextField fullWidth label="Avatar" value={avatar} onChange={(e) => { setAvatar(e.target.value);modelChangedHandler({ avatar: e.target.value, alias, model: modelConfig.model})}}/>
                <TextField fullWidth label="Alias" value={alias} onChange={(e) => { setAlias(e.target.value); modelChangedHandler({ avatar, alias: e.target.value, model: modelConfig.model});}}/>
                {modelConfig.model instanceof GPT_35_TURBO &&
                    <AzureGPTModelConfigPanel model={modelConfig.model} onModelConfigChanged={(modelConfig) => modelChangedHandler({ avatar, alias, model: modelConfig})}/>
                }
                {/* <TextField type="password" fullWidth label="ApiKey" value={apiKey} onChange={(e) => {setApiKey(e.target.value); modelChangedHandler({ avatar, alias, description, apiKey: e.target.value});}}/> */}
            </Stack>
        </div>
    )
}

const Models: React.FC<ModelProps> = ({modelConfigs, onModelConfigsChange}) => {
    const [modelConfigState, setModelConfigState] = useState(modelConfigs);
    const [isEditingModelIndex, setIsEditingModelIndex] = useState(-1);
    const [editingModel, setEditingModel] = useState<IModelConfig>();
    useEffect(() => {
        setIsEditingModelIndex(-1);
        setModelConfigState(modelConfigs);
    }, [modelConfigs]);

    return (
        <Stack
            direction="row"
            useFlexGap
            spacing = {5}
            sx={{
                width: "100%",
                height: "100%",
            }}>
            <Stack
                direction="row"
                useFlexGap
                spacing={5}
                sx={{
                    width: "100%",
                    flexWrap: "wrap",
                    alignContent: "flex-start",
                    alignItems: "top"}}>
                {modelConfigState.map((modelConfig, i) =>
                <Box
                    key={i}
                    sx={{
                        padding: 2,
                        maxWidth: 200,
                        boarderColor: 'primary.light',
                        border: "1px solid"}}>
                    <Stack spacing={1} direction="column" useFlexGap >
                        <Stack direction="row" spacing={3} useFlexGap>
                            <Avatar src={modelConfig.avatar}/>
                            <Typography>{modelConfig.alias}</Typography>
                        </Stack>
                        <Box sx={{ height: 150, overflow: "scroll", textOverflow: "ellipsis", whiteSpace: "normal"}}>
                            <Typography>{modelConfig.model.description}</Typography>
                        </Box>
                        <Stack direction="row" spacing={3} useFlexGap>
                            <Button variant="outlined" onClick={() => {setIsEditingModelIndex(i); setEditingModel(modelConfig)}} >Edit</Button>
                            <Button variant="outlined" onClick={() => {setIsEditingModelIndex(-1)}} >Delete</Button>
                        </Stack>
                    </Stack>
                </Box>
                )}
            </Stack>
            {isEditingModelIndex >= 0 && editingModel &&
                <Container>
                    <Stack direction="column" spacing={2} useFlexGap>
                        <Typography variant="h4">Editing {modelConfigState[isEditingModelIndex].alias}</Typography>
                        <Typography variant="h4">ID {modelConfigState[isEditingModelIndex].model.id}</Typography>
                        <ModelConfigPanel modelConfig={editingModel} onModelConfigChanged={(_config) => {console.log(_config); setEditingModel(_config)}}/>
                        <Button variant="outlined" onClick={() => { setModelConfigState(modelConfigState.map((m, i) => i == isEditingModelIndex? editingModel : m)); setIsEditingModelIndex(-1);} }>Save</Button>
                        <Button variant="outlined" onClick={() => setIsEditingModelIndex(-1) }>Cancel</Button>
                    </Stack>
                </Container>
            }
        </Stack>);
};

export type { IModelConfig, ModelProps, ModelConfigProps, TextCompletionModelConfig, ImageGenerationModelConfig };
export default Models;