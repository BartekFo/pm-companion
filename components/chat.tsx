'use client';

import type { UIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { cn, fetcher, generateUUID } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from './sidebar-history';
import { toast } from './toast';
import type { Session } from 'next-auth';
import { useSearchParams } from 'next/navigation';
import { useAutoResume } from '@/hooks/use-auto-resume';

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  isReadonly,
  session,
  autoResume,
  projectId,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  initialChatModel: string;
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
  projectId?: string;
}) {
  const { mutate } = useSWRConfig();

  const apiEndpoint = projectId
    ? `/${projectId}/chat/api/chat`
    : '/chat/api/chat';
  const voteEndpoint = projectId
    ? `/${projectId}/chat/api/vote`
    : '/chat/api/vote';
  const chatUrlBase = projectId ? `/${projectId}/chat` : '/chat';

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
    experimental_resume,
    data,
  } = useChat({
    id,
    api: apiEndpoint,
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    experimental_prepareRequestBody: (body) => ({
      id,
      message: body.messages.at(-1),
      selectedChatModel: initialChatModel,
    }),
    onFinish: () => {
      mutate(
        unstable_serialize((index, previousPageData) =>
          getChatHistoryPaginationKey(index, previousPageData, projectId || ''),
        ),
      );
    },
    onError: (error) => {
      toast({
        type: 'error',
        description: error.message,
      });
    },
  });

  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      append({
        role: 'user',
        content: query,
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, '', `${chatUrlBase}/${id}`);
    }
  }, [query, append, hasAppendedQuery, id, chatUrlBase]);

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `${voteEndpoint}?chatId=${id}` : null,
    fetcher,
  );

  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    experimental_resume,
    data,
    setMessages,
  });

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh">
        <ChatHeader
          projectId={projectId || ''}
          chatId={id}
          selectedModelId={initialChatModel}
          isReadonly={isReadonly}
          session={session}
        />

        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
        />

        <form
          className={cn(
            'flex mx-auto px-4 pb-4 md:pb-6 gap-2 w-full md:max-w-3xl',
            messages.length === 0 &&
              'absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2',
            messages.length === 1 && 'animate-slide-to-bottom',
          )}
        >
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              status={status}
              stop={stop}
              setMessages={setMessages}
              projectId={projectId}
            />
          )}
        </form>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        status={status}
        stop={stop}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
        projectId={projectId}
      />
    </>
  );
}
