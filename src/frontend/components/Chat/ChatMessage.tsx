import { IMessage, IsUserMessage, Message } from '@/types/chat';
import { IconEdit } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { FC, memo, useEffect, useRef, useState } from 'react';
import rehypeMathjax from 'rehype-mathjax';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { CodeBlock } from '../Markdown/CodeBlock';
import { MemoizedReactMarkdown } from '../Markdown/MemoizedReactMarkdown';
import { CopyButton } from './CopyButton';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import { SmallLabel, TinyLabel } from '../Global/EditableSavableTextField';
import { getMessageUIProvider, hasMessageUIProvider } from '@/utils/app/configPanelProvider';

interface Props {
  message: IMessage;
}



export const ChatMessage: FC<Props> = memo(
  ({ message}) => {
    const { t } = useTranslation('chat');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [messageContent, setMessageContent] = useState(message.content);
    const [messagedCopied, setMessageCopied] = useState(false);
    const isUser = IsUserMessage(message);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const copyOnClick = () => {
      if (!navigator.clipboard) return;

      navigator.clipboard.writeText(message.content.toString()).then(() => {
        setMessageCopied(true);
        setTimeout(() => {
          setMessageCopied(false);
        }, 2000);
      });
    };

    const MessageElement = (props: { message: IMessage, onchange: (agent: IMessage) => void}) => {
      if(!hasMessageUIProvider(props.message.type)){
          return <SmallLabel>{props.message.content.toString()}</SmallLabel>
      }

      return getMessageUIProvider(props.message.type)(props.message, props.onchange);
  }

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'inherit';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [isEditing]);

    return (
        <Box
          sx={{
            overflowWrap: 'anywhere',
          }}
        >
          <Stack
            direction={ isUser ? "row-reverse" : "row"}
            spacing={2}>
            <Avatar>
              {isUser ? 'You' : message.from.substring(0, 2)}
            </Avatar>
            <Box
              sx={{
                display: 'flex',
                maxWidth: '40%',
                backgroundColor: 'grey.900',
                borderRadius: 2,
              }}>
              <Stack
                direction="column"
                spacing={1}
                sx={{
                  padding: 2,
                  pt: 1,
                }}>
              <Stack
                direction="row"
                spacing={2}>
              {!isUser &&
                <TinyLabel
                  sx={{
                    color: 'text.secondary',
                  }}>{message.from}</TinyLabel>
              }
              {
                message.timestamp &&
                <TinyLabel color='text.secondary'>{new Date(message.timestamp).toLocaleString()}</TinyLabel>
              }
              </Stack>
                <MessageElement message={message} onchange={(message: IMessage) => {}} />
              </Stack>
            </Box>
          </Stack>
        </Box>
    );
  },
);
ChatMessage.displayName = 'ChatMessage';
