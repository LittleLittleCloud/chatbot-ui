import {
    FC,
    memo,
    MutableRefObject,
    useCallback,
    useEffect,
    useRef,
    useState,
  } from 'react';

import { Box, Container, List, ListItem, Stack, Typography, Avatar, Button, ListItemButton, ListItemIcon, ListItemText, Divider, TextField, Tab, Tabs } from '@mui/material';
import { configPanelProviderType, getAgentConfigPannelProvider, getAvailableAgents, hasAgentConfigPannelProvider } from '@/utils/app/agentConfigPannelProvider';
import { IAgent } from '@/types/agent';
import { EditableSavableTextField, EditableSelectField } from '../Global/EditableSavableTextField';
import { TabContext, TabPanel } from '@mui/lab';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import { hasAgentExecutorProvider } from '@/utils/app/agentProvider';

export const AgentPage: FC<{agents: IAgent[]}> = ({agents}) => {
    const [availableAgents, setAvailableAgents] = useState<IAgent[]>(agents);
    const [selectedAgentID, setSelectedAgentID] = useState<string>();
    const [selectedAgent, setSelectedAgent] = useState<IAgent>();
    const [selectedAgentIndex, setSelectedAgentIndex] = useState(-1);
    const [tab, setTab] = useState("1");
    const [registeredAgents, setRegisteredAgents] = useState<string[]>(getAvailableAgents());

    useEffect(() => {
        setAvailableAgents(availableAgents);
    }, [availableAgents])

    useEffect(() => {
        if(selectedAgentIndex > -1){
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

    useEffect(() => {
        if(selectedAgent){
            const newAgents = availableAgents.map((agent, index) => {
                if(index === selectedAgentIndex){
                    return selectedAgent;
                }
                return agent;
            })
            setAvailableAgents(newAgents);
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
            <List
                sx={{
                    width: "20%",
                    height: "100%",
                }}>
                {availableAgents.map((agent, index) => 
                    <ListItem
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
            <Divider orientation="vertical" flexItem />
            {selectedAgent &&
                <Box sx = {{
                    width: "80%",
                    height: "100%",
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

        </Box>
    )
}