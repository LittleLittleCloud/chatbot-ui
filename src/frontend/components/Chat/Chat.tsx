import { Conversation, Message } from '@/types/chat';
import { KeyValuePair } from '@/types/data';
import { ErrorMessage } from '@/types/error';
import { OpenAIModel } from '@/types/openai';
import { Prompt } from '@/types/prompt';
import { throttle } from '@/utils';
import { IconClearAll, IconKey, IconSettings } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import {
  FC,
  memo,
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Spinner } from '../Global/Spinner';
import { ChatInput } from './ChatInput';
import { ChatLoader } from './ChatLoader';
import { ChatMessage } from './ChatMessage';
import { ErrorMessageDiv } from './ErrorMessageDiv';
import { ModelSelect } from './ModelSelect';
import { SystemPrompt } from './SystemPrompt';
import { Box, Container, List, ListItem, Stack, Typography } from '@mui/material';

interface Props {
  conversation: Conversation;
  models: OpenAIModel[];
  messageIsStreaming: boolean;
  loading: boolean;
  prompts: Prompt[];
  onSend: (message: Message, deleteCount?: number) => void;
  onUpdateConversation: (
    conversation: Conversation,
    data: KeyValuePair,
  ) => void;
  onEditMessage: (message: Message, messageIndex: number) => void;
  stopConversationRef: MutableRefObject<boolean>;
}

interface IMessage{
  from: string | '__user',
  mimeType: 'text/plain' | 'text/markdown',
  content: string | Blob
}

interface IAgent{
  alias: string,
  description: string,
  prompt: string,
  avatar: string,
}

interface IGroup{
  name: string,
  agents: IAgent[],
  conversation: IMessage[],
}

const GroupPanel: FC<{groups: IGroup[], onGroupSelected: (group: IGroup) => void}> = ({groups, onGroupSelected}) => {
  return (
    <List
      sx={{
        height: '100%',
        overflow: 'auto',
      }}>
      {groups.map((group, index) => (
        <ListItem onClick={() => onGroupSelected(group)}>
          <Typography key={index} variant="h6" sx={{ mt: 2, mb: 1 }}>
          {group.name}
        </Typography>
        </ListItem>
      ))}
    </List>
  )
}

export const Chat: FC<{groups: IGroup[]}> = memo(
  ({
    groups,
  }) => {
    const { t } = useTranslation('chat');
    const [currentGroup, setCurrentGroup] = useState<IGroup>();
    const [currentConversation, setCurrentConversation] = useState<IMessage[]>([]);
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
    const [showSettings, setShowSettings] = useState<boolean>(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = useCallback(() => {
      if (autoScrollEnabled) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        textareaRef.current?.focus();
      }
    }, [autoScrollEnabled]);

    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          chatContainerRef.current;
        const bottomTolerance = 30;

        if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
          setAutoScrollEnabled(false);
        } else {
          setAutoScrollEnabled(true);
        }
      }
    };

    const handleSettings = () => {
      setShowSettings(!showSettings);
    };

    const scrollDown = () => {
      if (autoScrollEnabled) {
        messagesEndRef.current?.scrollIntoView(true);
      }
    };
    const throttledScrollDown = throttle(scrollDown, 250);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setAutoScrollEnabled(entry.isIntersecting);
          if (entry.isIntersecting) {
            textareaRef.current?.focus();
          }
        },
        {
          root: null,
          threshold: 0.5,
        },
      );
      const messagesEndElement = messagesEndRef.current;
      if (messagesEndElement) {
        observer.observe(messagesEndElement);
      }
      return () => {
        if (messagesEndElement) {
          observer.unobserve(messagesEndElement);
        }
      };
    }, [messagesEndRef]);

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          height: "100%",
        }}>
        <Box
          sx={{
            width: "20%",
            height: "100%",
          }}>
          <GroupPanel
            groups={groups}
            onGroupSelected={(group) =>
            {
              setCurrentGroup(group);
              setCurrentConversation(group.conversation);
            }} />
        </Box>
        <Box
          sx={{
            backgroundColor: "background.default",
            display: "flex",
            flexGrow: 1,
            height: "100%",
            flexDirection: "column",
          }}>
          {currentConversation && 
            <List
              sx={{
                flexGrow: 1,
                maxHeight: "100%",
                overflow: "auto",
                height: "80",
              }}>

            {currentConversation.map((message, index) => (
              <Box
                sx={{
                  marginTop: 2,
                  marginRight: 5,
                  marginLeft: 5,
                }}>
                <ChatMessage
                  key={index}
                  message={message}
                  />
                </Box>
            ))}
            <div
              ref={messagesEndRef} />
            </List>
          }
          <Box
            sx={{
              padding: 5,
            }}>
            <ChatInput
            textareaRef={textareaRef}
            messageIsStreaming={false}
            onSend={(message) => {
              setCurrentConversation([...currentConversation, message]);
            }} />
          </Box>
        </Box>
      </Box>
      
    );
  },
);
Chat.displayName = 'Chat';

export type { IGroup, IMessage, IAgent }