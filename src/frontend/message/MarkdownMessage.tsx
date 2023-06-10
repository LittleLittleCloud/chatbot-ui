import { IZeroshotAgentMessage } from "@/agent/chatAgent";
import { SmallLabel, TinyClickableLabel, TinyLabel } from "@/components/Global/EditableSavableTextField";
import { Markdown } from "@/components/Global/Markdown";
import { IMessage } from "@/types/chat";
import { providerType } from "@/utils/app/configPanelProvider";
import { Stack, Divider } from "@mui/material";
import error from "next/error";
import React from "react";
import { text } from "stream/consumers";

export interface IMarkdownMessage extends IMessage {
    type: 'message.markdown',
    content: string,
}

export const MarkdownMessage: providerType<IMarkdownMessage> = (message, onChange) => {
    const content = message.content;
    const [openContent, setOpenContent] = React.useState<'markdown' | 'plain text'>("markdown");
    return (
        <Stack
            direction="column"
            spacing={1}>
            {
                openContent === 'markdown' &&
                <Markdown>{content}</Markdown>
            }
            {
                openContent === 'plain text' &&
                <SmallLabel>{content.replace('\n', '<br />')}</SmallLabel>
            }
            <Stack
                direction="row"
                spacing={1}>
                {
                    <TinyClickableLabel
                    onClick={() => setOpenContent('markdown')}
                    sx = {{
                        color: openContent == 'markdown' ? 'primary.main' : 'text.secondary',
                    }}>content</TinyClickableLabel>
                }
                <Divider orientation="vertical" flexItem />
                <TinyClickableLabel
                    onClick={() => setOpenContent('plain text')}
                    sx = {{
                        color: openContent == 'plain text' ? 'primary.main' : 'text.secondary',
                    }}>plain text</TinyClickableLabel>
            </Stack>
        </Stack>
    )
}