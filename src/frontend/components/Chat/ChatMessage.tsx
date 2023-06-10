import { IMessage, IsUserMessage, Message } from '@/types/chat';
import { IconEdit, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { FC, memo, useEffect, useRef, useState } from 'react';
import rehypeMathjax from 'rehype-mathjax';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { CodeBlock } from '../Markdown/CodeBlock';
import { MemoizedReactMarkdown } from '../Markdown/MemoizedReactMarkdown';
import { CopyButton } from './CopyButton';
import { Avatar, Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { SmallAvatar, SmallLabel, TinyLabel } from '../Global/EditableSavableTextField';
import { getMessageUIProvider, hasMessageUIProvider } from '@/utils/app/configPanelProvider';
import { IAgent } from '@/types/agent';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Props {
  message: IMessage;
  agent?: IAgent;
  onDeleteMessage?: (message: IMessage) => void;
  onResendMessage?: (message: IMessage) => void;
}

export const ChatMessage: FC<Props> = memo(
  ({ message, agent, onDeleteMessage, onResendMessage}) => {
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

    const onDeleteMessageHandler = () => {
      if (confirm('Are you sure you want to delete this message?')) {
        onDeleteMessage && onDeleteMessage(message);
      }
    };

    const onResendMessageHandler = () => {
      if (confirm('Are you sure you want to resend this message?')) {
        onResendMessage && onResendMessage(message);
      }
    };

    return (
        <Box>
          <Stack
            direction={ isUser ? "row-reverse" : "row"}
            spacing={2}
            sx={{
              ":hover": {
                '& .toolBar': {
                  visibility: 'visible',
                }
              },
            }}>
            {isUser ? 
              <Avatar
                sx={{
                  width: '3rem',
                  height: '3rem',
                }}>You</Avatar> :
              <SmallAvatar avatarKey={agent?.avatar!}/>}
            <Box
              sx={{
                display: 'flex',
                backgroundColor: 'background.secondary',
                borderRadius: 2,
                maxWidth: '80%',
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
                spacing={2}
                sx={{
                  alignItems: 'center',
                }}>
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
              <Stack
                direction="row"
                spacing={1}
                className='toolBar'
                sx={{
                  justifyContent: 'flex-end',
                  flexGrow: 1,
                  visibility: 'hidden',
                }}>
                  {isUser &&
                  <Tooltip
                    title='resend this message'>
                    <IconButton
                      onClick={onResendMessageHandler}>
                      <RefreshIcon
                        sx={{
                          color: 'text.secondary',
                          fontSize: '1rem',
                        }} />
                    </IconButton>
                  </Tooltip>
                  }
                  <Tooltip
                    title='delete this message'>
                    <IconButton
                      onClick={onDeleteMessageHandler}
                      size='small'>
                      <DeleteOutlineIcon
                        sx={{
                          color: 'text.secondary',
                          fontSize: '1rem',
                        }} />
                    </IconButton>
                  </Tooltip>
              </Stack>
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
