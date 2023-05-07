import {
    Dispatch,
    FC,
    memo,
    MutableRefObject,
    useCallback,
    useEffect,
    useRef,
    useState,
  } from 'react';

import { Box, Container, List, ListItem, Stack, Typography, Avatar, Button, ListItemButton, ListItemIcon, ListItemText, Divider, TextField, Tab, Tabs, DialogTitle, Dialog, DialogActions, DialogContent, DialogContentText, ListItemAvatar, IconButton, Menu, MenuItem } from '@mui/material';
import { configPanelProviderType, getAgentConfigPannelProvider, getAvailableAgents, hasAgentConfigPannelProvider } from '@/utils/app/agentConfigPannelProvider';
import { IAgent } from '@/types/agent';
import { CentralBox, EditableSavableTextField, EditableSelectField, SelectableListItem, SettingSection, SmallSelectField, SmallSelectSetting, SmallTextField, SmallTextSetting } from '../Global/EditableSavableTextField';
import { TabContext, TabPanel } from '@mui/lab';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import { hasAgentExecutorProvider } from '@/utils/app/agentProvider';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { DeleteConfirmationDialog } from '../Global/DeleteConfirmationDialog';
import { AgentAction } from '@/utils/app/agentReducer';

const CreateAgentDialog = (props: {open: boolean, onClose: () => void, agentDispatcher: Dispatch<AgentAction>}) => {
    const [alias, setAlias] = useState("");
    const [agentID, setAgentID] = useState<string | null>(null);
    const availableAgents = getAvailableAgents();
    const [isSavable, setIsSavable] = useState(false);

    useEffect(() => {
        setIsSavable(alias != "" && agentID != null);
    }, [alias, agentID]);

    const onAgentCreatedHandler = (agent: IAgent) => {
        try{
            props.agentDispatcher({type: 'add', payload: agent});
        }
        catch(err){
            alert(err);
            return;
        }
    };

    return (
        <Dialog open={props.open} onClose={props.onClose}>
            <DialogTitle>Create Agent</DialogTitle>
            <DialogContent>
                <Stack
                    direction="column"
                    spacing={1}
                    sx={{
                        mt: 2,
                    }}>
                    <SmallTextField
                        value={alias}
                        label="Agent Alias"
                        onChange={(e) => setAlias(e.target.value)}
                        fullWidth
                    />
                    <SmallSelectField
                        value={agentID!}
                        name="Agent type"
                        options={availableAgents}
                        onChange={(value) => setAgentID(value!)}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancel</Button>
                <Button
                    disabled={!isSavable}
                    onClick={() => onAgentCreatedHandler({type: agentID!, alias: alias, description: '', avatar: alias})}>Create</Button>
            </DialogActions>
        </Dialog>
    );
}

export const AgentPage: FC<{availableAgents: IAgent[], agentDispatcher: Dispatch<AgentAction>}> = ({availableAgents, agentDispatcher}) => {
    const [selectedAgent, setSelectedAgent] = useState<IAgent>();
    const [tab, setTab] = useState("1");
    const [onOpenCreateAgentDialog, setOpenCreateAgentDialog] = useState(false);
    const [onOpenSettingMenu, setOpenSettingMenu] = useState(-1);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [agentToDelete, setAgentToDelete] = useState<IAgent | null>(null);

    const registeredAgents = getAvailableAgents();
    const handleClose = () => {
        setAnchorEl(null);
      };

    const AgentAdvancedSettingPanel = (props: { agent: IAgent, onchange: (agent: IAgent) => void}) => {
        if(!hasAgentConfigPannelProvider(props.agent.type)){
            return <Typography>Not implemented</Typography>
        }

        return getAgentConfigPannelProvider(props.agent.type)(props.agent, props.onchange);
    }

    const onCloseSettingMenu = () => {
        setOpenSettingMenu(-1);
        setAnchorEl(null);
    }
    const onAgentDeletedHandler = (agent: IAgent) => {
        agentDispatcher({type: 'remove', payload: agent});
        setAgentToDelete(null);
        onCloseSettingMenu();
    };

    const onAgentUpdatedHandler = (agent: IAgent, original?: IAgent) => {
        agentDispatcher({type: 'update', payload: agent, original: original});
        setSelectedAgent(agent);
    };

    const onAgentCloneHandler = (agent: IAgent) => {
        // deep copy
        var clonedAgent = JSON.parse(JSON.stringify(agent)) as IAgent;
        clonedAgent.alias = clonedAgent.alias + " (clone)";
        agentDispatcher({type: 'add', payload: clonedAgent});
        onCloseSettingMenu();
    };

    return (
        <Box
            sx={{
                display: "flex",
                height: "100%",
                width: "100%",
                backgroundColor: "background.default",
                flexDirection: "row",
                overflow: "scroll",
            }}>
            <CreateAgentDialog
                agentDispatcher={agentDispatcher}
                open={onOpenCreateAgentDialog}
                onClose={() => setOpenCreateAgentDialog(false)} />
                    
            {availableAgents?.length == 0 &&
            <CentralBox
                sx={{
                    width: "100%",
                    height: "100%",
                }}>
                <Button
                    onClick={() => setOpenCreateAgentDialog(true)}
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
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Create an agent</Typography>
                </Button>
            </CentralBox>}
            {availableAgents?.length > 0 &&
            <>
                <DeleteConfirmationDialog
                    open={agentToDelete != null}
                    message='Are you sure you want to delete this agent?'
                    onConfirm={() => onAgentDeletedHandler(agentToDelete!)}
                    onCancel={() => {
                        setAgentToDelete(null);
                        onCloseSettingMenu();
                    }}
                />
                <Menu
                MenuListProps={{
                    'aria-labelledby': 'hover-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                >
                    <MenuItem onClick={(e) => onAgentCloneHandler(availableAgents[onOpenSettingMenu])}>Clone</MenuItem>
                    <MenuItem onClick={(e) => setAgentToDelete(availableAgents[onOpenSettingMenu])}>Delete</MenuItem>
                </Menu>
            <Box
                sx={{
                    width: "20%",
                    height: "100%",
                }}>
            <Box
                sx={{
                    width: "100%",
                    height: "90%",
                }}>
            <List>
                {availableAgents.map((agent, index) => 
                    <SelectableListItem
                        selected={selectedAgent?.alias == agent.alias}
                        key={index}
                        onClick={() => setSelectedAgent(availableAgents[index])}
                        secondaryAction = {
                            <IconButton
                                onClick={(e) =>
                                {
                                    setOpenSettingMenu(index);
                                    setAnchorEl(e.currentTarget);
                                    e.stopPropagation();
                                }}
                                className='hover-button' >
                                <MoreVertIcon />
                            </IconButton>
                        }>
                        <ListItemButton>
                            <ListItemAvatar>
                                <Avatar>{agent.avatar}</Avatar>
                            </ListItemAvatar>
                            <ListItemText>
                                <Typography>{agent.alias}</Typography>
                            </ListItemText>
                        </ListItemButton>
                    </SelectableListItem>
                )}
            </List>
            </Box>
            <CentralBox
                sx={{
                    width: "100%",
                    height: "10%",
                }}
            >
            <Button
                sx={{
                    width: "100%",
                    height: "100%",
                }}
                onClick={() => setOpenCreateAgentDialog(true)}>
                Add an agent
            </Button>
            </CentralBox>
            </Box>
            
            <Divider orientation="vertical" flexItem />
            {selectedAgent &&
                <Box sx = {{
                    width: "80%",
                    height: "100%",
                    overflow: "scroll",
                }}>
                    <TabContext value={tab}>
                    <Tabs
                        value={tab}
                        onChange={(e, v) =>setTab(v)}>
                        <Tab label="Setting" value="1" />
                        <Tab label="Try it out" value="2" />
                    </Tabs>
                    <TabPanel value="1">
                        <Stack
                            direction="column"
                            spacing={4}
                            sx={{
                                height: "100%",
                                overflow: "scroll",
                            }}>
                        <SettingSection
                            title="Basic Setting"
                            toolTip="basic setting">
                            <SmallTextSetting name="alias" toolTip='The name of the agent' value={selectedAgent.alias} />
                            <SmallSelectSetting name='agent type' toolTip='the type of agent' options={registeredAgents} value={selectedAgent.type} onChange={(value) => onAgentUpdatedHandler({...selectedAgent, type: value!})}/>
                        </SettingSection>
                        <AgentAdvancedSettingPanel agent={selectedAgent} onchange={(value) => onAgentUpdatedHandler(value, selectedAgent)}  />
                        </Stack>
                    </TabPanel>
                    <TabPanel value="3">
                        <Typography>Try it out</Typography>
                    </TabPanel>
                    </TabContext>
                </Box>
            }
            </>
            }

        </Box>
    )
}