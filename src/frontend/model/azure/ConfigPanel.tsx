import { useEffect, useState } from "react";
import { GPT_35_TURBO, TextDavinci003 } from "./GPT";
import { TextField, Stack } from "@mui/material";

const AzureGPT35TurboConfig: React.FC<{model: GPT_35_TURBO, onModelConfigChanged: (model: GPT_35_TURBO) => void}> = ({model, onModelConfigChanged}) => {
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

const AzureTextDavinci003Config: React.FC<{model: TextDavinci003, onModelConfigChanged: (model: TextDavinci003) => void}> = ({model, onModelConfigChanged}) => {
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
            <TextField fullWidth type="password" label="ApiKey" value={apiKey} onChange={(e) => {setApiKey(e.target.value); onModelConfigChanged(new TextDavinci003({ ...model, apiKey: e.target.value}));}}/>
            <TextField fullWidth label="MaxTokens" value={maxTokens} onChange={(e) => {setMaxTokens(Number(e.target.value)); onModelConfigChanged(new TextDavinci003({ ...model, maxTokens: Number(e.target.value)}));}}/>
            <TextField fullWidth label="Temperature" type="number" value={temperature} onChange={(e) => {setTemperature(Number(e.target.value)); onModelConfigChanged(new TextDavinci003({ ...model, temperature: Number(e.target.value)}));}}/>
            <TextField fullWidth label="TopP" type="number" value={topP} onChange={(e) => {setTopP(Number(e.target.value)); onModelConfigChanged(new TextDavinci003({ ...model, topP: Number(e.target.value)}));}}/>
            <TextField fullWidth label="FrequencyPenalty" type="number" value={frequencyPenalty} onChange={(e) => {setFrequencyPenalty(Number(e.target.value)); onModelConfigChanged(new TextDavinci003({ ...model, frequencyPenalty: Number(e.target.value)}));}}/>
            <TextField fullWidth label="PresencePenalty" type="number" value={presencePenalty} onChange={(e) => {setPresencePenalty(Number(e.target.value)); onModelConfigChanged(new TextDavinci003({ ...model, presencePenalty: Number(e.target.value)}));}}/>
            <TextField fullWidth multiline label="Description" value={description} onChange={(e) => {setDescription(e.target.value); onModelConfigChanged(new TextDavinci003({ ...model, description: e.target.value}));}}/>
        </Stack>);
};

export {AzureTextDavinci003Config, AzureGPT35TurboConfig}