import { auth } from '@/app/(auth)/auth';
import type { NextRequest } from 'next/server';
import { getChatsByUserIdAndProjectId, getProjectById } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { searchParams } = request.nextUrl;

  const limit = Number.parseInt(searchParams.get('limit') || '10');
  const startingAfter = searchParams.get('starting_after');
  const endingBefore = searchParams.get('ending_before');

  if (startingAfter && endingBefore) {
    return Response.json(
      'Only one of starting_after or ending_before can be provided!',
      { status: 400 },
    );
  }

  const session = await auth();

  if (!session?.user?.id) {
    return Response.json('Unauthorized!', { status: 401 });
  }

  const { projectId } = await params;

  const project = await getProjectById(projectId);
  if (!project) {
    return Response.json('Project not found!', { status: 404 });
  }

  try {
    const chats = await getChatsByUserIdAndProjectId({
      userId: session.user.id,
      projectId,
      limit,
      startingAfter,
      endingBefore,
    });

    return Response.json(chats);
  } catch (_) {
    return Response.json('Failed to fetch chats!', { status: 500 });
  }
}
