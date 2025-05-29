import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import {
  getChatById,
  getMessagesByChatId,
  getProjectById,
} from '@/lib/db/queries';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import type { DBMessage } from '@/lib/db/schema';
import type { Attachment, UIMessage } from 'ai';

interface ProjectChatIdPageProps {
  params: Promise<{ projectId: string; id: string }>;
}

export default async function ProjectChatIdPage({
  params,
}: ProjectChatIdPageProps) {
  const { projectId, id } = await params;

  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const project = await getProjectById(projectId);
  if (!project) {
    redirect('/');
  }

  const chat = await getChatById({ id });
  if (!chat) {
    notFound();
  }

  const messagesFromDb = await getMessagesByChatId({ id });

  function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
    return messages.map((message) => ({
      id: message.id,
      parts: message.parts as UIMessage['parts'],
      role: message.role as UIMessage['role'],
      content: '',
      createdAt: message.createdAt,
      experimental_attachments:
        (message.attachments as Array<Attachment>) ?? [],
    }));
  }

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        initialChatModel={chatModelFromCookie?.value || DEFAULT_CHAT_MODEL}
        isReadonly={session?.user?.id !== chat.userId}
        session={session}
        autoResume={true}
        projectId={projectId}
      />
    </>
  );
}
