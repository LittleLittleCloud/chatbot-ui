import { IMessage, Message } from '@/types/chat';
import { IconEdit } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { FC, memo, useEffect, useRef, useState } from 'react';
import rehypeMathjax from 'rehype-mathjax';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { CodeBlock } from '../Markdown/CodeBlock';
import { MemoizedReactMarkdown } from '../Markdown/MemoizedReactMarkdown';
import { CopyButton } from './CopyButton';
import { Avatar, Box, Stack, Typography } from '@mui/material';

interface Props {
  message: IMessage;
}

export const ChatMessage: FC<Props> = memo(
  ({ message}) => {
    const { t } = useTranslation('chat');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isHovering, setIsHovering] = useState<boolean>(false);
    const [messageContent, setMessageContent] = useState(message.content);
    const [messagedCopied, setMessageCopied] = useState(false);
    const [isUser, setIsUser] = useState(message.from == '__user');
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

    useEffect(() => {
      setIsUser(message.from == '__user');
    }, [message]);

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'inherit';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [isEditing]);

    return (
        <Box
          sx={{
            overflowWrap: 'anywhere',
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <Stack
            direction={ isUser ? "row-reverse" : "row"}
            spacing={2}>
            <Avatar>
              {isUser ? 'You' : message.from.substring(0, 2)}
            </Avatar>
            <Typography maxWidth="40%" variant="h6" pt="100" sx={{padding:2, borderRadius:2, color: 'text.primary',fontWeight: 'fontWeightLight', backgroundColor: 'grey.900' }}>
              {message.content.toString()}
            </Typography>
            
          </Stack>
        {/* <div className="relative m-auto flex gap-4 p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
          <div className="min-w-[40px] font-bold">
            {!isUser ? t('AI') : t('You')}:
          </div>

          <div className="prose mt-[-2px] w-full dark:prose-invert">
            {isUser ? (
              <div className="flex w-full">
                {isEditing ? (
                  <div className="flex w-full flex-col">
                    <textarea
                      ref={textareaRef}
                      className="w-full resize-none whitespace-pre-wrap border-none outline-none dark:bg-[#343541]"
                      value={messageContent}
                      style={{
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        lineHeight: 'inherit',
                        padding: '0',
                        margin: '0',
                        overflow: 'hidden',
                      }}
                    />

                    <div className="mt-10 flex justify-center space-x-4">
                      <button
                        className="h-[40px] rounded-md bg-blue-500 px-4 py-1 text-sm font-medium text-white enabled:hover:bg-blue-600 disabled:opacity-50"
                        disabled={messageContent.trim().length <= 0}
                      >
                        {t('Save & Submit')}
                      </button>
                      <button
                        className="h-[40px] rounded-md border border-neutral-300 px-4 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        onClick={() => {
                          setMessageContent(message.content);
                          setIsEditing(false);
                        }}
                      >
                        {t('Cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="prose whitespace-pre-wrap dark:prose-invert">
                    {message.content}
                  </div>
                )}

                {(isHovering || window.innerWidth < 640) && !isEditing && (
                  <button
                    className={`absolute ${
                      window.innerWidth < 640
                        ? 'right-3 bottom-1'
                        : 'right-0 top-[26px]'
                    }`}
                  >
                    <IconEdit
                      size={20}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    />
                  </button>
                )}
              </div>
            ) : (
              <>
                <MemoizedReactMarkdown
                  className="prose dark:prose-invert"
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeMathjax]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');

                      return !inline && match ? (
                        <CodeBlock
                          key={Math.random()}
                          language={match[1]}
                          value={String(children).replace(/\n$/, '')}
                          {...props}
                        />
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    table({ children }) {
                      return (
                        <table className="border-collapse border border-black py-1 px-3 dark:border-white">
                          {children}
                        </table>
                      );
                    },
                    th({ children }) {
                      return (
                        <th className="break-words border border-black bg-gray-500 py-1 px-3 text-white dark:border-white">
                          {children}
                        </th>
                      );
                    },
                    td({ children }) {
                      return (
                        <td className="break-words border border-black py-1 px-3 dark:border-white">
                          {children}
                        </td>
                      );
                    },
                  }}
                >
                  {message.content}
                </MemoizedReactMarkdown>
              </>
            )}
          </div>
        </div> */}
        </Box>
    );
  },
);
ChatMessage.displayName = 'ChatMessage';
