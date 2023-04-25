import {
    FC,
    memo,
    MutableRefObject,
    useCallback,
    useEffect,
    useRef,
    useState,
  } from 'react';

import { Box, Select, InputLabel, Container, List, ListItem, Stack, Typography, Avatar, Button, ListItemButton, ListItemIcon, ListItemText, Divider, TextField, MenuItem, FormControl } from '@mui/material';

export const EditableSavableTextField = (props: {name: string, value?: string, onChange: (valueS: string) => void}) => {
    const [value, setValue] = useState(props.value);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    return (
        <Stack direction="row" spacing={1}>
            <TextField
                value={value}
                label={props.name}
                onChange={(e) => setValue(e.target.value)}
                disabled={!isEditing}
                fullWidth
                multiline
                size='small'
                sx={{
                    '& .MuiOutlinedInput-root': {
                      },
                }}
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
                size='small'
                sx={{
                    '& .MuiOutlinedInput-input': {
                        borderRadius: '15rem'
                        
                      },
                }}
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