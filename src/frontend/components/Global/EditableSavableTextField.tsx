import {
    FC,
    memo,
    MutableRefObject,
    useCallback,
    useEffect,
    useRef,
    useState,
  } from 'react';

import { Box, Select, InputLabel, Container, List, ListItem, Stack, Typography, Avatar, Button, ListItemButton, ListItemIcon, ListItemText, Divider, TextField, MenuItem, FormControl, TextFieldProps, BaseTextFieldProps, SelectProps } from '@mui/material';
import styled from '@emotion/styled';

export const EditableSavableTextField = (props: {name: string, value?: string, onChange: (valueS: string) => void}) => {
    const [value, setValue] = useState(props.value);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    return (
        <Stack direction="row" spacing={1}>
            <SmallTextField
                value={value}
                label={props.name}
                onChange={(e) => setValue(e.target.value)}
                disabled={!isEditing}
                fullWidth
                multiline
            />
            <Button
                onClick={() => {
                    if (isEditing && value != props.value) {
                        setIsSaving(true);
                        props.onChange(value!);
                        setIsSaving(false);
                    }
                    setIsEditing(!isEditing);
                }}
                disabled={isSaving}>
                {isEditing ? "Save" : "Edit"}
            </Button>
        </Stack>
    )
}

export const EditableSelectField = (props: {name: string, value?: string, onChange: (value: string) => void, options: string[]}) => {
    const [value, setValue] = useState(props.value);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    return (
        <Stack direction="row" spacing={1}>
            <FormControl fullWidth>
            <InputLabel id="editable-select-label">{props.name}</InputLabel>
            <Select
                labelId='editable-select-label'
                value={value}
                label={props.name}
                onChange={(e) => setValue(e.target.value)}
                disabled={!isEditing}
            >
                {props.options.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
            </Select>
            </FormControl>
            <Button
                onClick={() => {
                    if (isEditing) {
                        setIsSaving(true);
                        props.onChange(value!);
                        setIsSaving(false);
                    }
                    setIsEditing(!isEditing);
                }}
                disabled={isSaving}>
                {isEditing ? "Save" : "Edit"}
            </Button>
        </Stack>
    )
}

export const SmallSelectField = (props: {name: string, value?: string, onChange: (value: string) => void, options: string[]}) => {
    const [value, setValue] = useState(props.value);
    return (
        <FormControl fullWidth>
        <InputLabel id="editable-select-label">{props.name}</InputLabel>
        <Select
            labelId='editable-select-label'
            value={value}
            label={props.name}
            sx={{
                lineHeight: '1.5rem',
            }}
            onChange={(e) => setValue(e.target.value)}
        >
            {props.options.map((option) => (
                <MenuItem key={option} value={option}>
                    {option}
                </MenuItem>
                ))}
        </Select>
        </FormControl>
    )
}

export const SmallMultipleSelectField = (props: {name: string, value?: string[], onChange: (value: string[]) => void, options: string[]}) => {
    const [value, setValue] = useState(props.value);

    useEffect(() => {
        if(value != props.value && props.value != undefined){
            props.onChange(value);
        }
    }, [value]);

    return (
        <FormControl fullWidth>
        <InputLabel id="editable-select-label">{props.name}</InputLabel>
        <Select
            labelId='editable-select-label'
            value={value}
            label={props.name}
            multiple
            sx={{
                lineHeight: '1.5rem',
            }}
            onChange={(e) => setValue(e.target.value as string[])}
        >
            {props.options.map((option) => (
                <MenuItem key={option} value={option}>
                    {option}
                </MenuItem>
                ))}
        </Select>
        </FormControl>
    )
}


export const SmallTextField = styled(TextField)<BaseTextFieldProps>(({theme}) => ({
    '& .MuiOutlinedInput-root': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
}));

export const SmallSelect = styled(Select)(({theme}) => ({
    borderRadius: '0.25rem',
    lineHeight: '1.5rem',
    fontSize: '1rem',
}));