import { Conversation, IMessage, Message } from '@/types/chat';
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
import { IAgent } from '@/types/agent';
import { AgentExecutor } from 'langchain/agents';
import { getAgentExecutorProvider } from '@/utils/app/agentProvider';
import { IRecord } from '@/types/storage';

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

interface IGroup extends IRecord{
  name: string,
  agents: string[],
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
        <ListItem key={index} onClick={() => onGroupSelected(group)}>
          <Typography key={index} variant="h6" sx={{ mt: 2, mb: 1 }}>
          {group.name}
        </Typography>
        </ListItem>
      ))}
    </List>
  )
}

export const Chat: FC<{groups: IGroup[], agents: IAgent[], onGroupsChange: (groups: IGroup[]) => void}> = memo(
  ({
    groups,
    agents,
    onGroupsChange,
  }) => {
    const { t } = useTranslation('chat');
    const [currentGroup, setCurrentGroup] = useState<IGroup>();
    const [currentConversation, setCurrentConversation] = useState<IMessage[]>([]);
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [agentExecutors, setAgentExecutors] = useState<AgentExecutor[]>([]);
    const [newMessage, setNewMessage] = useState<IMessage>();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [availableAgents, setAvailableAgents] = useState<IAgent[]>(agents);
    const [availableGroups, setAvailableGroups] = useState<IGroup[]>(groups);
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

    // init
    useEffect(() => {
      setAvailableGroups(groups);
      setAvailableAgents(agents);
    }, [groups, agents]);

    useEffect(() => {
      if(newMessage){
        setCurrentConversation([...currentConversation, newMessage]);
        onGroupsChange(groups.map(group => group.id === currentGroup?.id ? {...group, conversation: [...group.conversation, newMessage]} : group));
        agentExecutors.forEach(async (executor, i) => {
          if(newMessage.from != currentGroup?.agents[i]){
            var response = await executor.call({'from': newMessage.from, 'content': newMessage.content});
            var content = response['output'];
            if(content?.length > 0){
              var responseMessage: IMessage = { from: currentGroup?.agents[i]!, id: 'text/plain', content: content};
              setNewMessage(responseMessage);
            }
          }
        })
      }
    }, [newMessage]);

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
            groups={availableGroups}
            onGroupSelected={(group) =>
            {
              setCurrentGroup(group);
              var agents = group.agents.map(agent => availableAgents.find(a => a.alias === agent));
              var agentExecutorProviders = agents.map(agent => getAgentExecutorProvider(agent!.id));
              var agentExecutors = agentExecutorProviders.map((provider, i) => provider(agents[i]!, group.conversation));
              setAgentExecutors(agentExecutors);
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
                key={index}
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
                setNewMessage(message);
              }} />
          </Box>
        </Box>
      </Box>
      
    );
  },
);
Chat.displayName = 'Chat';

export type { IGroup, IAgent }