import { auth } from '@/app/(auth)/auth';
import {
  getChatById,
  getVotesByChatId,
  voteMessage,
  getProjectById,
} from '@/lib/db/queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('chatId is required', { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { projectId } = await params;

  const project = await getProjectById(projectId);
  if (!project) {
    return new Response('Project not found', { status: 404 });
  }

  const chat = await getChatById({ id: chatId });

  if (!chat) {
    return new Response('Chat not found', { status: 404 });
  }

  if (chat.userId !== session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const votes = await getVotesByChatId({ id: chatId });
  return Response.json(votes, { status: 200 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const {
    chatId,
    messageId,
    type,
  }: { chatId: string; messageId: string; type: 'up' | 'down' } =
    await request.json();

  if (!chatId || !messageId || !type) {
    return new Response('messageId and type are required', { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { projectId } = await params;

  const project = await getProjectById(projectId);
  if (!project) {
    return new Response('Project not found', { status: 404 });
  }

  const chat = await getChatById({ id: chatId });

  if (!chat) {
    return new Response('Chat not found', { status: 404 });
  }

  if (chat.userId !== session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  await voteMessage({
    chatId,
    messageId,
    type: type,
  });

  return new Response('Message voted', { status: 200 });
}
