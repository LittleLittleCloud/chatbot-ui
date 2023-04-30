import { useEffect, useState } from "react";
import { GPT_35_TURBO, IGPT35Turbo, ITextDavinci003, TextDavinci003 } from "./GPT";
import { TextField, Stack } from "@mui/material";
import { EditableSavableTextField } from "@/components/Global/EditableSavableTextField";
import { providerType } from "@/utils/app/configPanelProvider";

const AzureGPT35TurboConfig: providerType<IGPT35Turbo> = (model, onModelConfigChanged) => {
    return (
        <Stack spacing={2}>
            <EditableSavableTextField name="ApiKey" value={model.apiKey} onChange={(value) => onModelConfigChanged({ ...model, apiKey: value})}/>
            <EditableSavableTextField name="MaxTokens" value={model.maxTokens?.toString()} onChange={(value) => onModelConfigChanged({ ...model, maxTokens: Number(value)})}/>
            <EditableSavableTextField name="Temperature" value={model.temperature?.toString()} onChange={(value) => onModelConfigChanged({ ...model, temperature: Number(value)})}/>
            <EditableSavableTextField name="TopP" value={model.topP?.toString()} onChange={(value) => onModelConfigChanged({ ...model, topP: Number(value)})}/>
            <EditableSavableTextField name="FrequencyPenalty" value={model.frequencyPenalty?.toString()} onChange={(value) => onModelConfigChanged({ ...model, frequencyPenalty: Number(value)})}/>
            <EditableSavableTextField name="PresencePenalty" value={model.presencePenalty?.toString()} onChange={(value) => onModelConfigChanged({ ...model, presencePenalty: Number(value)})}/>
            <EditableSavableTextField name="Description" value={model.description} onChange={(value) => onModelConfigChanged({ ...model, description: value})}/>
            <EditableSavableTextField name="Deploy ID" value={model.deploymentID} onChange={(value) => onModelConfigChanged({ ...model, deploymentID: value})}/>
        </Stack>);
};

const AzureTextDavinci003Config: providerType<ITextDavinci003> = (model, onModelConfigChanged) => {
    return (
        <Stack spacing={2}>
            <EditableSavableTextField name="ApiKey" value={model.apiKey} onChange={(value) => onModelConfigChanged({ ...model, apiKey: value})}/>
            <EditableSavableTextField name="Resource Name" value={model.resourceName} onChange={(value) => onModelConfigChanged({ ...model, resourceName: value})}/>
            <EditableSavableTextField name="Deploy ID" value={model.deploymentID} onChange={(value) => onModelConfigChanged({ ...model, deploymentID: value})}/>
            <EditableSavableTextField name="MaxTokens" value={model.maxTokens?.toString()} onChange={(value) => onModelConfigChanged({ ...model, maxTokens: Number(value)})}/>
            <EditableSavableTextField name="Temperature" value={model.temperature?.toString()} onChange={(value) => onModelConfigChanged({ ...model, temperature: Number(value)})}/>
            <EditableSavableTextField name="TopP" value={model.topP?.toString()} onChange={(value) => onModelConfigChanged({ ...model, topP: Number(value)})}/>
            <EditableSavableTextField name="FrequencyPenalty" value={model.frequencyPenalty?.toString()} onChange={(value) => onModelConfigChanged({ ...model, frequencyPenalty: Number(value)})}/>
            <EditableSavableTextField name="PresencePenalty" value={model.presencePenalty?.toString()} onChange={(value) => onModelConfigChanged({ ...model, presencePenalty: Number(value)})}/>
            <EditableSavableTextField name="Description" value={model.description} onChange={(value) => onModelConfigChanged({ ...model, description: value})}/>
        </Stack>);
};

export {AzureTextDavinci003Config, AzureGPT35TurboConfig}