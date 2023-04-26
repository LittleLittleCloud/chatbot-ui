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
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, List, ListItem, Paper, Stack, Typography } from '@mui/material';
import { IAgent } from '@/types/agent';
import { AgentExecutor } from 'langchain/agents';
import { getAgentExecutorProvider } from '@/utils/app/agentProvider';
import { IRecord } from '@/types/storage';
import { EditableSavableTextField, EditableSelectField, SmallMultipleSelectField, SmallSelectField, SmallTextField } from '../Global/EditableSavableTextField';
import { getAvailableAgents } from '@/utils/app/agentConfigPannelProvider';

const CreateGroupDialog: FC<{open: boolean, availableAgents: IAgent[], onSaved: (group: IGroup) => void, onCancel: () => void}> = ({open, availableAgents, onSaved, onCancel}) => {
  const [groupName, setGroupName] = useState<string>();
  const [selectAgents, setSelectAgents] = useState<string[]>([]); // [agentId]
  const [savable, setSavable] = useState<boolean>(false); // [agentId]

  useEffect(() => {
    setSavable(groupName != undefined && groupName.length > 0 && selectAgents.length > 0);
  }, [groupName, selectAgents]);

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Create a new Group</DialogTitle>
      <DialogContent>
        <Stack
          sx={{ mt:2 }}
          spacing={2}
          direction="column">
          <SmallTextField label="Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
          <SmallMultipleSelectField name="Agents" value={selectAgents} onChange={setSelectAgents} options={availableAgents.map(a => a.alias)} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button disabled = {!savable} onClick={() => onSaved({id: 'group', name: groupName!, agents: selectAgents, conversation: []})}>Save</Button>
      </DialogActions>
    </Dialog>);
};

  interface IGroup extends IRecord{
  name: string,
  agents: string[],
  conversation: IMessage[],
}

const GroupPanel: FC<{groups: IGroup[], onGroupSelected: (group: IGroup) => void}> = ({groups, onGroupSelected}) => {
  return (
    <List
      sx={{
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
    const [currentConversation, setCurrentConversation] = useState<IMessage[]>();
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [agentExecutors, setAgentExecutors] = useState<AgentExecutor[]>([]);
    const [newMessage, setNewMessage] = useState<IMessage>();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [availableAgents, setAvailableAgents] = useState<IAgent[]>(agents);
    const [availableGroups, setAvailableGroups] = useState<IGroup[]>(groups);
    const [openCreateGroupDialog, setOpenCreateGroupDialog] = useState<boolean>(false);

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
      if(currentGroup == null && groups.length > 0){
        setCurrentGroup(groups[0]);
      }
    }, [groups, agents]);

    useEffect(() => {
      setCurrentConversation(currentGroup?.conversation);
    }, [currentGroup]);

    useEffect(() => {
      if(newMessage){
        setCurrentConversation([...currentConversation!, newMessage]);
        onGroupsChange(availableGroups.map(group => group.name == currentGroup?.name ? {...group, conversation: [...group.conversation, newMessage]} : group));
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

    const onHandleCreateGroup = (group: IGroup) => {
      // first check if the group already exists
      if(groups.find(g => g.name === group.name)){
        alert('Group already exists');
        return;
      }
      onGroupsChange([...groups, group]);
      setOpenCreateGroupDialog(false);
    }

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          height: "100%",
          backgroundColor: "background.default",
        }}>
        {
          availableGroups?.length > 0 &&
          <Box
          sx={{
            width: "20%",
            height: "100%",
          }}>
          <Box
            sx={{
              height: "90%",
              overflow: "auto",
            }}>
          <GroupPanel
            groups={availableGroups}
            onGroupSelected={(group) =>
            {
              console.log(group);
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
                height: "10%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}>
              <Button onClick={() => setOpenCreateGroupDialog(true)}>Create Group</Button>
            </Box>
        </Box>
        }
        <Divider orientation="vertical" flexItem />
        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            maxWidth: "100%",
            height: "100%",
            flexDirection: "column",
          }}>
          {currentConversation ?
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
            </List> :
            <Box
              sx={{
                display: "flex",
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}>
                {availableAgents?.length == 0 &&
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>No agent available, create agent first</Typography>
                }
                {availableAgents && availableAgents.length > 0 &&
                <>
                <Button
                  onClick={() => setOpenCreateGroupDialog(true)}
                  sx={{
                    border: "3px dashed",
                    borderColor: "text.disabled",
                    '&.MuiButton-text':{
                      color: "text.disabled",
                    },
                    '&:hover': {
                      border: "3px dashed",
                    },
                  }}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Create a group</Typography>
                </Button>
                
                </>
                }
            </Box>
          }
          {currentGroup &&
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
          }
        </Box>
        <CreateGroupDialog
                  open={openCreateGroupDialog}
                  availableAgents={availableAgents}
                  onCancel={() => setOpenCreateGroupDialog(false)}
                  onSaved={onHandleCreateGroup} />
      </Box>
      
    );
  },
);
Chat.displayName = 'Chat';

export type { IGroup, IAgent }