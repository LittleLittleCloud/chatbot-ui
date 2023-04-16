// config page for all available models

import { Key } from "@/components/Settings/Key";
import { Grid, Stack, TextField, Card, CardContent, CardHeader, Avatar, Typography, CardActions, Button, Box, Container } from "@mui/material";
import { GetStaticProps } from "next";
import { useEffect, useState } from "react";

interface TextCompletionModelConfig extends ModelConfig{
}

interface ImageGenerationModelConfig extends ModelConfig{
}

interface ModelConfig{
    avatar: string;
    alias: string;
    apiKey: string;
    description: string;
}

interface ModelConfigProps {
    modelConfig: ModelConfig;
    onModelConfigChanged: (modelConfig: ModelConfig) => void;
}

interface ModelProps{
    modelConfigs: ModelConfig[];
    onModelConfigsChange: (modelConfigs: ModelConfig[]) => void;
}

const ModelConfigPanel: React.FC<ModelConfigProps> = ({modelConfig, onModelConfigChanged}) => {
    const [avatar, setAvatar] = useState(modelConfig.avatar);
    const [alias, setAlias] = useState(modelConfig.alias);
    const [description, setDescription] = useState(modelConfig.description);
    const [apiKey, setApiKey] = useState(modelConfig.apiKey);
    
    useEffect(() => {
        setAvatar(modelConfig.avatar);
        setAlias(modelConfig.alias);
        setDescription(modelConfig.description);
        setApiKey(modelConfig.apiKey);
    }, [modelConfig]);
    
    const modelChangedHandler = () => onModelConfigChanged({avatar, alias, description, apiKey});

    console.log(modelConfig);
    return (
        <div>
            <Stack spacing={2}>
                <TextField fullWidth label="Avatar" value={avatar} onChange={(e) => { setAvatar(e.target.value); modelChangedHandler();}}/>
                <TextField fullWidth label="Alias" value={alias} onChange={(e) => { setAlias(e.target.value); modelChangedHandler();}}/>
                <TextField fullWidth label="Description" value={description} onChange={(e) => { setDescription(e.target.value); modelChangedHandler();}}/>
                <TextField type="password" fullWidth label="ApiKey" value={apiKey} onChange={(e) => {setApiKey(e.target.value); modelChangedHandler();}}/>
            </Stack>
        </div>
    )
}

const Models: React.FC<ModelProps> = ({modelConfigs, onModelConfigsChange}) => {
    const modelConfigsUseStates = modelConfigs.map((modelConfig) => useState(modelConfig));
    const modelConfigsStates = modelConfigsUseStates.map((modelConfigUseState) => modelConfigUseState[0]);
    const modelConfigsSetStates = modelConfigsUseStates.map((modelConfigUseState) => modelConfigUseState[1]);
    const [isEditingModelIndex, setIsEditingModelIndex] = useState(-1);
    const [editingModel, setEditingModel] = useState<ModelConfig>();
    useEffect(() => {
        setIsEditingModelIndex(isEditingModelIndex);
        modelConfigsStates.forEach((modelConfig, i) => modelConfigsSetStates[i](modelConfig));
        if (isEditingModelIndex >= 0){
            setEditingModel(modelConfigsStates[isEditingModelIndex]);
        }
    }, [isEditingModelIndex, modelConfigsStates]);

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
                {modelConfigsStates.map((modelConfig, i) =>
                <Box
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
                        <Box sx={{ height: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                            <Typography>{modelConfig.description}</Typography>
                        </Box>
                        <Stack direction="row" spacing={3} useFlexGap>
                            <Button variant="outlined" onClick={() => {setIsEditingModelIndex(i); setEditingModel(modelConfigsStates[i])}} >Edit</Button>
                            <Button variant="outlined" onClick={() => {setIsEditingModelIndex(-1)}} >Delete</Button>
                        </Stack>
                    </Stack>
                </Box>
                )}
            </Stack>
            {isEditingModelIndex >= 0 && editingModel &&
                <Container>
                    <Stack direction="column" spacing={2} useFlexGap>
                        <Typography variant="h4">Editing {modelConfigsStates[isEditingModelIndex].alias}</Typography>
                        <ModelConfigPanel modelConfig={modelConfigsStates[isEditingModelIndex]} onModelConfigChanged={(_config) => setEditingModel(_config)}/>
                        <Button variant="outlined" onClick={() => { modelConfigsSetStates[isEditingModelIndex](editingModel); setIsEditingModelIndex(-1);} }>Save</Button>
                        <Button variant="outlined" onClick={() => setIsEditingModelIndex(-1) }>Cancel</Button>
                    </Stack>
                </Container>
            }
        </Stack>);
};

export default Models;