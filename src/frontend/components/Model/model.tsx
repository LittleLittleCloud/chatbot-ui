// config page for all available models

import { Key } from "@/components/Settings/Key";
import { IModel } from "@/model/type";
import { Grid, Stack, TextField, Card, CardContent, CardHeader, Avatar, Typography, CardActions, Button, Box, Container, Divider, Chip, Collapse, Icon } from "@mui/material";
import { useEffect, useState } from "react";
import { BaseLLM, LLM } from "langchain/dist/llms/base";
import { GPT_35_TURBO, TextDavinci003 } from "@/model/azure/GPT";
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { createLLM, hasLLMProvider } from "@/utils/app/llmProvider";
import { getConfigPanelProvider, hasConfigPanelProvider, registerConfigPanelProvider } from "@/utils/app/configPanelProvider";

interface IModelConfig{
    avatar: string;
    alias: string;
    model: IModel;
}

interface ModelConfigProps {
    modelConfig: IModelConfig;
    onModelConfigChanged: (modelConfig: IModelConfig) => void;
}

interface ModelProps{
    modelConfigs: IModelConfig[];
    onModelConfigsChange: (modelConfigs: IModelConfig[]) => void;
}

const LLMTryOutPanel : React.FC<{llm: LLM}> = ({llm}) => {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    return (
        <Box>
            <Stack spacing={2}>
                <Stack spacing={2} direction='row'>
                    <TextField fullWidth label="Input" value={input} onChange={(e) => setInput(e.target.value)}/>
                    <Button variant="outlined" onClick={async () => setOutput(await llm.call(input))}>
                        <ChevronRightRoundedIcon />
                    </Button>
                </Stack>
                {output.length > 0 &&
                    <TextField fullWidth multiline label="Output" value={output}/>}
            </Stack>
        </Box>
    );
}

const ModelConfigPanel: React.FC<ModelConfigProps> = ({modelConfig, onModelConfigChanged}) => {
    const [avatar, setAvatar] = useState(modelConfig.avatar);
    const [alias, setAlias] = useState(modelConfig.alias);
    const [editingStatus, setEditingStatus] = useState(false);
    const [tryOutStatus, setTryOutStatus] = useState(false);
    useEffect(() => {
        setAvatar(modelConfig.avatar);
        setAlias(modelConfig.alias);
    }, [modelConfig]);
    
    const modelChangedHandler = (modelConfig: IModelConfig) => onModelConfigChanged(modelConfig);

    // call onModelConfigChanged when any of the fields change
    return (
        <div>
            <Stack spacing={2}>
                <TextField fullWidth label="Avatar" value={avatar} onChange={(e) => { setAvatar(e.target.value);modelChangedHandler({ avatar: e.target.value, alias, model: modelConfig.model})}}/>
                <TextField fullWidth label="Alias" value={alias} onChange={(e) => { setAlias(e.target.value); modelChangedHandler({ avatar, alias: e.target.value, model: modelConfig.model});}}/>
                <Divider>
                    {editingStatus ? 
                        <Chip label="Collapse" color="default" onClick={() => setEditingStatus(false)}/> :
                        <Chip label="Editing More" color="default" onClick={() => setEditingStatus(true)} />}
                </Divider>
                <Collapse in={editingStatus}>
                    {getConfigPanelProvider(modelConfig.model.id)(modelConfig.model, (model) => onModelConfigChanged({ ...modelConfig, model }))}
                </Collapse>
                {hasLLMProvider(modelConfig.model) &&
                <>
                    <Divider>
                        {tryOutStatus ?
                            <Chip label="Collapse" color="default" onClick={() => setTryOutStatus(false)}/> :
                            <Chip label="Try Out" color="default" onClick={() => setTryOutStatus(true)} />}
                    </Divider>
                    <Collapse in={tryOutStatus}>
                        <LLMTryOutPanel llm={createLLM(modelConfig.model)}/>
                    </Collapse>
                </>
                }
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
                        <Typography variant="h5" color='secondary'>ID: {modelConfigState[isEditingModelIndex].model.id}</Typography>
                        <ModelConfigPanel modelConfig={editingModel} onModelConfigChanged={(_config) => {console.log(_config); setEditingModel(_config)}}/>
                        <Button variant="outlined" onClick={() => { setModelConfigState(modelConfigState.map((m, i) => i == isEditingModelIndex? editingModel : m)); setIsEditingModelIndex(-1);} }>Save</Button>
                        <Button variant="outlined" onClick={() => setIsEditingModelIndex(-1) }>Cancel</Button>
                    </Stack>
                </Container>
            }
        </Stack>);
};

export type { IModelConfig, ModelProps, ModelConfigProps };
export default Models;