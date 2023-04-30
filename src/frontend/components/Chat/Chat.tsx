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
import { Alert, Avatar, Box, Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, List, ListItem, Menu, MenuItem, Paper, Stack, Typography } from '@mui/material';
import { IAgent } from '@/types/agent';
import { AgentExecutor } from 'langchain/agents';
import { getAgentExecutorProvider } from '@/utils/app/agentProvider';
import { IRecord } from '@/types/storage';
import { CentralBox, EditableSavableTextField, EditableSelectField, SmallMultipleSelectField, SmallSelectField, SmallTextField } from '../Global/EditableSavableTextField';
import { getAvailableAgents } from '@/utils/app/agentConfigPannelProvider';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { DeleteConfirmationDialog } from '../Global/DeleteConfirmationDialog';

const CreateOrEditGroupDialog: FC<{open: boolean, group: IGroup | null, availableAgents: IAgent[], onSaved: (group: IGroup) => void, onCancel: () => void}> = ({open, group, availableAgents, onSaved, onCancel}) => {
  const [groupName, setGroupName] = useState<string | undefined>();
  const [selectAgents, setSelectAgents] = useState<string[]>([]); // [agentId]
  const [savable, setSavable] = useState<boolean>(false); // [agentId]
  const [currentGroup, setCurrentGroup] = useState<IGroup | null>(group);

  useEffect(() => {
    setCurrentGroup(group);
    setGroupName(group?.name);
    setSelectAgents(group?.agents || []);
  }, [group]);

  useEffect(() => {
    setSavable(groupName != undefined && groupName.length > 0 && selectAgents.length > 0);
  }, [groupName, selectAgents]);

  return (
    <Dialog open={open} onClose={onCancel}>
      {currentGroup && <DialogTitle>{`Edit ${groupName}`}</DialogTitle>}
      {!currentGroup && <DialogTitle>Create a new Group</DialogTitle>}
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

const GroupPanel: FC<{groups: IGroup[], agents: IAgent[], onGroupSelected: (group: IGroup) => void, onGroupUpdate: (groups: IGroup[]) => void}> = ({groups, agents, onGroupSelected, onGroupUpdate}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [groupToDelete, setGroupToDelete] = useState<IGroup | null>(null);
  const [groupToEdit, setGroupToEdit] = useState<IGroup | null>(null);
  const [openUpdateGroupDialog, setOpenUpdateGroupDialog] = useState<boolean>(false); // [agentId
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    event.stopPropagation();
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const onClickDeleteGroup = (group: IGroup) => {
    handleClose();
    console.log('delete group', group);
    setGroupToDelete(group);
  }

  const onClickEditGroup = (group: IGroup) => {
    handleClose();
    setGroupToEdit(group);
    setOpenUpdateGroupDialog(true);
  }

  const onConfirmDeleteGroup = () => {
    onGroupUpdate(groups.filter(g => g.name !== groupToDelete?.name));
    setGroupToDelete(null);
  }

  const onEditGroupHandler = (group: IGroup) => {
    handleClose();
    setOpenUpdateGroupDialog(false);
    onGroupUpdate(groups.map(g => g.name == groupToEdit?.name ? group : g));
  }

  const onCancelDeleteGroup = () => {
    setGroupToDelete(null);
  }

  return (
    <>
    <DeleteConfirmationDialog
      open={groupToDelete != null}
      message="Are you sure to delete this group?"
      onConfirm={onConfirmDeleteGroup}
      onCancel={onCancelDeleteGroup} />
    <CreateOrEditGroupDialog
      open={openUpdateGroupDialog && groupToEdit != null}
      group={groupToEdit}
      availableAgents={agents}
      onCancel={() => setOpenUpdateGroupDialog(false)}
      onSaved={onEditGroupHandler} />
        
    <Menu
      variant='menu'
      MenuListProps={{
        'aria-labelledby': `hidden-button`,
      }}
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      >
      <MenuItem onClick={() => onClickEditGroup(groupToEdit!)}>{`Edit ${groupToEdit?.name}`}</MenuItem>
      <MenuItem onClick={() => onClickDeleteGroup(groupToEdit!)}>Delete</MenuItem>
    </Menu>
    <List>
      {groups.map((group, index) => (
        <ListItem
          key={index}
          onClick={() => onGroupSelected(group)}
          sx={{
            "& .hidden-button": {
              display: "flex",
            },
            "&:hover .hidden-button": {
              display: "flex",
            },
          }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
              <Avatar>{group.name[0]}</Avatar>
              <Typography variant="h6">
                {group.name}
              </Typography>
              <IconButton
                id={`hidden-button`}
                onClick={(e) => {
                  setGroupToEdit(group);
                  handleClick(e);
                }}
                color="primary"
                className="hidden-button"
                aria-haspopup="true">
                <MoreVertIcon fontSize='small'/>
              </IconButton>
            </Stack>
        </ListItem>
      ))}
    </List>
    </>
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

    // init
    useEffect(() => {
      setAvailableGroups(groups);
      setAvailableAgents(agents);
      if(currentGroup == undefined && groups.length > 0){
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
        if(newMessage.from == '__user'){
          agentExecutors.forEach(async (executor, i) => {
            var response = await executor.call({'from': newMessage.from, 'content': newMessage.content});
              var content = response['output'];
              if(content?.length > 0){
                var responseMessage: IMessage = { from: currentGroup?.agents[i]!, id: 'text/plain', content: content};
                setNewMessage(responseMessage);
              }
          })
        }
      }
    }, [newMessage]);

    const onHandleCreateGroup = (group: IGroup) => {
      // first check if the group already exists
      if(availableGroups.find(g => g.name === group.name)){
        alert('Group already exists');
        return;
      }
      onGroupsChange([...availableGroups, group]);
      setOpenCreateGroupDialog(false);
    }

    const onHandleDeleteGroup = (group: IGroup) => {
      console.log('delete group', group);
      if(group.name == currentGroup?.name){
        console.log('delete current group');
        setCurrentGroup(undefined);
      }
      setAvailableGroups(availableGroups.filter(g => g.name !== group.name));
      onGroupsChange(availableGroups.filter(g => g.name !== group.name));
    };

    const onHandleSelectGroup = (group: IGroup) => {
      group.agents = group.agents.filter(agent => availableAgents.find(a => a.alias === agent));
      setCurrentGroup(group);
      setCurrentConversation(group.conversation);

      // set agents
      // if none of agents is available, alert user to add an agent first
      var agents = group.agents.map(agent => availableAgents.find(a => a.alias === agent));
      var agentExecutorProviders = agents.map(agent => getAgentExecutorProvider(agent!.id));
      var agentExecutors = agentExecutorProviders.map((provider, i) => provider(agents[i]!, group.conversation));
      setAgentExecutors(agentExecutors);
    };

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          height: "100%",
          backgroundColor: "background.default",
        }}>
        {currentConversation == undefined && availableGroups?.length == 0 &&
            <CentralBox
              sx={{
                width: "100%",
                height: "100%",
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
            </CentralBox>
          }
        {availableGroups?.length > 0 &&
          <>
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
            agents={availableAgents}
            onGroupSelected={onHandleSelectGroup}
            onGroupUpdate={onGroupsChange}/>
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
          <Divider orientation="vertical" flexItem />
          </>
        }
        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            maxWidth: "80%",
            height: "100%",
            flexDirection: "column",
          }}>
          { currentConversation && agentExecutors && agentExecutors.length > 0 &&
            <List
              sx={{
                flexGrow: 1,
                maxHeight: "100%",
                overflow: "auto",
                height: "80%",
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
          {currentGroup && currentGroup.agents.length == 0 && 
          <CentralBox
            sx={{
              width: "100%",
              height: "100%",
            }}>
              <Typography variant="h4">{`No agent available in ${currentGroup.name}, add agent first`}</Typography>
          </CentralBox>
            }
          
          {currentGroup && agentExecutors && agentExecutors.length > 0 &&
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
        <CreateOrEditGroupDialog
                  open={openCreateGroupDialog}
                  availableAgents={availableAgents}
                  group={null}
                  onCancel={() => setOpenCreateGroupDialog(false)}
                  onSaved={onHandleCreateGroup} />
      </Box>
      
    );
  },
);
Chat.displayName = 'Chat';

export type { IGroup, IAgent }