import { cookies } from 'next/headers';
import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { getProjectById } from '@/lib/db/queries';
import { FileProcess } from './components/FileProcess';

interface ProjectChatPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectChatPage({
  params,
}: ProjectChatPageProps) {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const { projectId } = await params;

  const project = await getProjectById(projectId);
  if (!project) {
    redirect('/');
  }

  const id = generateUUID();
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        initialChatModel={modelIdFromCookie?.value || DEFAULT_CHAT_MODEL}
        isReadonly={false}
        session={session}
        autoResume={false}
        projectId={projectId}
      />
      <DataStreamHandler id={id} />
      <FileProcess />
    </>
  );
}
