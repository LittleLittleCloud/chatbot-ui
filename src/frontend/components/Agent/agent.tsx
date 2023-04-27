import {
    FC,
    memo,
    MutableRefObject,
    useCallback,
    useEffect,
    useRef,
    useState,
  } from 'react';

import { Box, Container, List, ListItem, Stack, Typography, Avatar, Button, ListItemButton, ListItemIcon, ListItemText, Divider, TextField, Tab, Tabs, DialogTitle, Dialog, DialogActions, DialogContent, DialogContentText } from '@mui/material';
import { configPanelProviderType, getAgentConfigPannelProvider, getAvailableAgents, hasAgentConfigPannelProvider } from '@/utils/app/agentConfigPannelProvider';
import { IAgent } from '@/types/agent';
import { CentralBox, EditableSavableTextField, EditableSelectField, SmallSelectField, SmallTextField } from '../Global/EditableSavableTextField';
import { TabContext, TabPanel } from '@mui/lab';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import { hasAgentExecutorProvider } from '@/utils/app/agentProvider';

const CreateAgentDialog = (props: {open: boolean, onClose: () => void, onAgentCreated: (agent: IAgent) => void}) => {
    const [alias, setAlias] = useState("");
    const [agentID, setAgentID] = useState<string | null>(null);
    const availableAgents = getAvailableAgents();
    const [isSavable, setIsSavable] = useState(false);
    useEffect(() => {
        setIsSavable(alias != "" && agentID != null);
    }, [alias, agentID]);
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
                    onClick={() => props.onAgentCreated({id: agentID!, alias: alias, description: '', avatar: alias})}>Create</Button>
            </DialogActions>
        </Dialog>
    );
}

export const AgentPage: FC<{agents: IAgent[], onAgentsChanged: (agents: IAgent[]) => void}> = ({agents, onAgentsChanged}) => {
    const [availableAgents, setAvailableAgents] = useState<IAgent[]>(agents);
    const [selectedAgentID, setSelectedAgentID] = useState<string>();
    const [selectedAgent, setSelectedAgent] = useState<IAgent>();
    const [selectedAgentIndex, setSelectedAgentIndex] = useState(-1);
    const [tab, setTab] = useState("1");
    const [registeredAgents, setRegisteredAgents] = useState<string[]>(getAvailableAgents());
    const [onOpenCreateAgentDialog, setOpenCreateAgentDialog] = useState(false);

    useEffect(() => {
        setAvailableAgents(agents);
    }, [agents])

    useEffect(() => {
        if(selectedAgentIndex > -1){
            console.log("selected agent index changed");
            setSelectedAgentID(availableAgents[selectedAgentIndex].id);
            setSelectedAgent(availableAgents[selectedAgentIndex]);
        }
    }, [selectedAgentIndex])

    useEffect(() => {
        if(selectedAgentID != selectedAgent?.id && selectedAgentID != undefined){
            setSelectedAgent({id: selectedAgentID, alias: selectedAgent?.alias!, description: selectedAgent?.description!, avatar: selectedAgent?.avatar!});
        }
    }, [selectedAgentID]);

    const AgentAdvancedSettingPanel = (props: { agent: IAgent, onchange: (agent: IAgent) => void}) => {
        if(!hasAgentConfigPannelProvider(props.agent.id)){
            return <Typography>Not implemented</Typography>
        }

        return getAgentConfigPannelProvider(props.agent.id)(props.agent, props.onchange);
    }

    const onAgentCreatedHandler = (agent: IAgent) => {
        // check if agent already exists
        if(availableAgents.find((a) => a.alias == agent.alias)){
            alert("Agent already exists");
        }

        setAvailableAgents([...availableAgents, agent]);
        setOpenCreateAgentDialog(false);
    };

    useEffect(() => {
        if(selectedAgent){
            const newAgents = availableAgents.map((agent, index) => {
                if(index === selectedAgentIndex){
                    return selectedAgent;
                }
                return agent;
            })
            setAvailableAgents(newAgents);
            onAgentsChanged(newAgents);
        }
    }, [selectedAgent]);

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
                onAgentCreated={onAgentCreatedHandler}
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
                    <ListItem
                        key={index}
                        onClick={() => setSelectedAgentIndex(index)}>
                        <ListItemButton>
                            <ListItemIcon>
                                <Avatar>{agent.avatar}</Avatar>
                            </ListItemIcon>
                            <ListItemText>
                                <Typography>{agent.alias}</Typography>
                            </ListItemText>
                        </ListItemButton>
                    </ListItem>
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
                    width: "100%",
                    height: "100%",
                    overflow: "scroll",
                }}>
                    <TabContext value={tab}>
                    <Tabs onChange={(e, v) =>setTab(v)} >
                        <Tab label="General Setting" value="1" />
                        <Tab label="Advanced Setting" value="2" />
                        <Tab label="Try it out" value="3" />
                    </Tabs>
                    <TabPanel value="1">
                        <Stack
                            spacing={2}>
                            <EditableSavableTextField name='alias' value={selectedAgent.alias} onChange={(value) => setSelectedAgent({...selectedAgent, alias: value!})}/>
                            <EditableSelectField name='agent type' options={registeredAgents} value={selectedAgent.id} onChange={(value) => setSelectedAgent({...selectedAgent, id: value!})}/>
                        </Stack>
                    </TabPanel>
                    <TabPanel value="2">
                        <AgentAdvancedSettingPanel agent={selectedAgent} onchange={(value) => setSelectedAgent(value)}  />
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