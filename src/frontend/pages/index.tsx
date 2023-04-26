import { Chat, IAgent, IGroup } from '@/components/Chat/Chat';
import { Chatbar } from '@/components/Chatbar/Chatbar';
import { Navbar } from '@/components/Mobile/Navbar';
import { Promptbar } from '@/components/Promptbar/Promptbar';
import { ChatBody, Conversation, Message } from '@/types/chat';
import { KeyValuePair } from '@/types/data';
import { ErrorMessage } from '@/types/error';
import { Folder, FolderType } from '@/types/folder';
import { OpenAIModel, OpenAIModelID, OpenAIModels } from '@/types/openai';
import { Prompt } from '@/types/prompt';
import {
  cleanConversationHistory,
  cleanSelectedConversation,
} from '@/utils/app/clean';
import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const';
import {
  saveConversation,
  saveConversations,
  updateConversation,
} from '@/utils/app/conversation';
import { saveFolders } from '@/utils/app/folders';
import { exportData, importData } from '@/utils/app/importExport';
import { savePrompts } from '@/utils/app/prompts';
import { AppBar, Button, Toolbar, Typography, Box, createTheme, Divider, Stack, Tooltip, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import { IconArrowBarLeft, IconArrowBarRight } from '@tabler/icons-react';
import { GetServerSideProps, GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Models, { IModelConfig } from '../components/Model/model';
import { ThemeProvider } from '@emotion/react';
import { IModelMetaData } from '@/model/type';
import { BaseLLM, LLM } from "langchain/dist/llms/base";
import { GPT_35_TURBO, TextDavinci003 } from '@/model/azure/GPT';
import '@/utils/app/setup';
import { AgentPage } from '@/components/Agent/agent';
import { IStorage } from '@/types/storage';
import SettingsIcon from '@mui/icons-material/Settings';

const Home: React.FC<IStorage> = () => {
  const { t } = useTranslation('chat');
  // STATE ----------------------------------------------
  const [storage, setStorage] = useState<IStorage>({ groups: [], agents: [], id: 'storage' });
  const [availableGroups, setGroups] = useState<IGroup[]>(storage.groups);
  const [availableAgents, setAgents] = useState<IAgent[]>(storage.agents);
  const [lightMode, setLightMode] = useState<'dark' | 'light'>('dark');
  const [hasChange, setHasChange] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isInit, setIsInit] = useState<boolean>(false);
  const [messageIsStreaming, setMessageIsStreaming] = useState<boolean>(false);


  const [folders, setFolders] = useState<Folder[]>([]);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation>();
  const [currentMessage, setCurrentMessage] = useState<Message>();

  const [showSidebar, setShowSidebar] = useState<boolean>(true);

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [showPromptbar, setShowPromptbar] = useState<boolean>(true);

  // REFS ----------------------------------------------

  const stopConversationRef = useRef<boolean>(false);
  // FETCH RESPONSE ----------------------------------------------

  // First loading
  useEffect(() => {
    if(isInit) return;
    const storage = localStorage.getItem('storage');
    if (storage) {
      setStorage(JSON.parse(storage));
    }
    setIsInit(false);
    console.log('init');
  }, []);
  // BASIC HANDLERS --------------------------------------------

  const handleLightMode = (mode: 'dark' | 'light') => {
    setLightMode(mode);
    localStorage.setItem('theme', mode);
  };

  const handleExportSettings = () => {
    exportData(storage)
    setIsMenuOpen(false);
  };

  const handleImportSettings = ({ target }: {target: HTMLInputElement}) => {
    if (!target.files?.length) return;
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data: IStorage = JSON.parse(event.target?.result as string);
      setStorage(data);
      setIsMenuOpen(false);
    };

    reader.readAsText(file);
  };

  useEffect(() => {
    if(isSaving){
      localStorage.setItem('storage', JSON.stringify(storage));
      setHasChange(false);
      setIsSaving(false);
    }
  }, [isSaving]);

  useEffect(() => {
    setGroups(storage.groups);
    setAgents(storage.agents);
  }, [storage]);

  const tabs = ['Chat', 'Agent']
  const settings = ['Import', 'Export'];
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const theme = createTheme({
    palette: {
      mode: 'dark',
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Chatbot UI</title>
        <meta
          name="viewport"
          content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main
          className={`text-sm text-white dark:text-white ${lightMode}`}
        >
      <Box
        sx={{
          display: 'flex',
          flexDirection: "column",
          width: "100%",
          height: "100vh",
          maxHeight: "100vh"}}>
        <Box
          sx={{
            Height: "10%",
          }}>
          <AppBar position='static' >
          <Toolbar variant="regular">
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
              CHATBOT
            </Typography>
            <Stack direction="row" spacing={2}>
              {hasChange && <Button variant='outlined' onClick={() => setIsSaving(true)}>save</Button>}
              {
                tabs.map((tab, i) => {
                  return (
                    <Button key={i} sx={{ color: '#fff' }} onClick={() => setSelectedTab(tab)} >{tab}</Button>
                  )
                })
              }
              <Box sx={{ flexGrow: 0 }}> 
                <Tooltip title="Open settings">
                  <SettingsIcon fontSize="large" onClick={() => setIsMenuOpen(true)} />
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={isMenuOpen}
                  onClose={() => setIsMenuOpen(false)}
                  >
                  <MenuItem key="Export" onClick={handleExportSettings}>
                    <Button component="label">Export</Button>
                  </MenuItem>
                  <MenuItem key="Import">
                    <Button component="label">
                      Import
                      <input
                        type="file"
                        accept=".chat"
                        onChange={handleImportSettings}
                        hidden
                      />
                    </Button>
                  </MenuItem>
            </Menu>
              </Box>
            </Stack>
            </Toolbar>
          </AppBar>
        </Box>
      <Box
        sx={{
          flexGrow: 1,
          height: "90%",
        }}>
        {selectedTab == 'Chat' && 
          <Chat
            groups={availableGroups}
            agents={availableAgents}
            onGroupsChange={(groups) => {
              setStorage({ ...storage, groups });
              setHasChange(true);
            }}
          />
        }
        {selectedTab == 'Agent' && (
          <AgentPage
            agents={availableAgents}
            onAgentsChanged={(agents) => {
              setStorage({ ...storage, agents });
              setHasChange(true);
            }}
            />
        )}
      </Box>
      </Box>
      </main>
      </ThemeProvider>
  );
};
export default Home;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'chat',
        'sidebar',
        'markdown',
      ])),
    },
  };
};
