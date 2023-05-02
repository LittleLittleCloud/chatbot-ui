import { IMessage, Message } from '@/types/chat';
import { KeyValuePair } from '@/types/data';
import { ErrorMessage } from '@/types/error';
import { OpenAIModel } from '@/types/openai';
import { Prompt } from '@/types/prompt';
import { throttle } from '@/utils';
import { IconClearAll, IconKey, IconSettings } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import {
  Dispatch,
  FC,
  memo,
  MutableRefObject,
  useCallback,
  useEffect,
  useReducer,
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
import { GroupAction, GroupCmd, groupReducer } from '@/utils/app/groupReducer';
import { IGroup } from '@/types/group';

const CreateOrEditGroupDialog: FC<{open: boolean, group?: IGroup, agents: IAgent[], onSaved: (group: IGroup) => void, onCancel: () => void}> = ({open, group, agents, onSaved, onCancel}) => {
  const [groupName, setGroupName] = useState(group?.name);
  const [selectAgents, setSelectAgents] = useState(group?.agents ?? []); // [agentId]
  const [savable, setSavable] = useState<boolean>(false); // [agentId]

  useEffect(() => {
    setGroupName(group?.name);
    setSelectAgents(group?.agents ?? []);
  }, [group]);

  const onSavedHandler = () => {
    if(group){
      onSaved({...group, name: groupName!, agents: selectAgents!});
    }
    else{
      onSaved({name: groupName!, agents: selectAgents!, type: 'group', conversation: []} as IGroup);
    }
  };

  useEffect(() => {
    setSavable(groupName != undefined && groupName.length > 0 && selectAgents.length > 0);
  }, [groupName, selectAgents]);

  return (
    <Dialog open={open} onClose={onCancel}>
      {group && <DialogTitle>{`Edit ${group.name}`}</DialogTitle>}
      {!group && <DialogTitle>Create a new Group</DialogTitle>}
      <DialogContent>
        <Stack
          sx={{ mt:2 }}
          spacing={2}
          direction="column">
          <SmallTextField label="Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
          <SmallMultipleSelectField name="Agents" value={selectAgents} onChange={setSelectAgents} options={agents.map(a => a.alias)} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button disabled = {!savable} onClick={onSavedHandler}>Save</Button>
      </DialogActions>
    </Dialog>);
};

const GroupPanel: FC<{groups: IGroup[], agents: IAgent[], onGroupSelected: (group: IGroup) => void, groupDispatch: Dispatch<GroupAction>}> = ({groups, agents, onGroupSelected, groupDispatch}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [groupToDelete, setGroupToDelete] = useState<IGroup | null>(null);
  const [groupToEdit, setGroupToEdit] = useState<IGroup>();
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
    groupDispatch({type: 'remove', payload: groupToDelete!});
    setGroupToDelete(null);
  }

  const onEditGroupHandler = (group: IGroup) => {
    handleClose();
    setOpenUpdateGroupDialog(false);
    groupDispatch({type: 'update', payload: group, original: groupToEdit!});
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
      open={openUpdateGroupDialog && groupToEdit != undefined}
      group={groupToEdit}
      agents={agents}
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

export const Chat: FC<{groups: IGroup[], agents: IAgent[], groupDispatch: Dispatch<GroupAction>}> =
  ({
    groups,
    agents,
    groupDispatch,
  }) => {
    const { t } = useTranslation('chat');
    const [currentGroup, setCurrentGroup] = useState<IGroup>();
    const [currentConversation, setCurrentConversation] = useState<IMessage[]>();
    const [agentExecutors, setAgentExecutors] = useState<AgentExecutor[]>([]);
    const [newMessage, setNewMessage] = useState<IMessage>();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    // const [availableGroups, setAvailableGroups] = useState<IGroup[]>(groups);
    const [openCreateGroupDialog, setOpenCreateGroupDialog] = useState<boolean>(false);

    useEffect(() => {
      setCurrentConversation(currentGroup?.conversation);
    }, [currentGroup]);

    useEffect(() => {
      if(newMessage){
        setCurrentConversation([...currentConversation!, newMessage]);
        groupDispatch({type: 'update', payload: {...currentGroup!, conversation: [...currentConversation!, newMessage]}})
        if(newMessage.from == '__user'){
          agentExecutors.forEach(async (executor, i) => {
            var response = await executor.call({'from': newMessage.from, 'content': newMessage.content});
              var content = response['output'];
              if(content?.length > 0){
                var currentTimestamp = Date.now();
                var responseMessage: IMessage = { from: currentGroup?.agents[i]!, type: 'text/plain', content: content, timestamp: currentTimestamp};
                setNewMessage(responseMessage);
              }
          })
        }
      }
    }, [newMessage]);

    const onHandleCreateGroup = (group: IGroup) => {
      // first check if the group already exists
      try{
        groupDispatch({type: 'add', payload: group});
      }
      catch(e){
        alert(e);
        return;
      }

      setOpenCreateGroupDialog(false);
    }

    const onHandleSelectGroup = (group: IGroup) => {
      group.agents = group.agents.filter(agent => agents.find(a => a.alias === agent));
      setCurrentGroup(group);
      setCurrentConversation(group.conversation);

      // set agents
      // if none of agents is available, alert user to add an agent first
      var _agents = group.agents.map(agent => agents.find(a => a.alias === agent));
      var agentExecutorProviders = _agents.map(_agent => getAgentExecutorProvider(_agent!.type));
      var agentExecutors = agentExecutorProviders.map((_agents, i) => _agents(agents[i]!, group.conversation));
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
        {currentConversation == undefined && groups?.length == 0 &&
            <CentralBox
              sx={{
                width: "100%",
                height: "100%",
              }}>
                {agents?.length == 0 &&
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>No agent available, create agent first</Typography>
                }
                {agents && agents.length > 0 &&
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
        {groups?.length > 0 &&
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
            groups={groups}
            agents={agents}
            onGroupSelected={onHandleSelectGroup}
            groupDispatch={groupDispatch}/>
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
                  agents={agents}
                  onCancel={() => setOpenCreateGroupDialog(false)}
                  onSaved={onHandleCreateGroup} />
      </Box>
      
    );
  };
Chat.displayName = 'Chat';