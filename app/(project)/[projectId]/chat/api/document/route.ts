import { auth } from '@/app/(auth)/auth';
import {
  getDocumentsById,
  saveDocument,
  getProjectById,
} from '@/lib/db/queries';
import type { ArtifactKind } from '@/components/artifact';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const session = await auth();

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { projectId } = await params;

  const project = await getProjectById(projectId);
  if (!project) {
    return new Response('Project not found', { status: 404 });
  }

  const documents = await getDocumentsById({ id });

  if (documents.length > 0) {
    const [document] = documents;

    if (document.userId !== session.user.id) {
      return new Response('Forbidden', { status: 403 });
    }
  }

  return Response.json(documents, { status: 200 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const session = await auth();

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { projectId } = await params;

  const project = await getProjectById(projectId);
  if (!project) {
    return new Response('Project not found', { status: 404 });
  }

  const {
    content,
    title,
    kind,
  }: { content: string; title: string; kind: ArtifactKind } =
    await request.json();

  const documents = await getDocumentsById({ id });

  if (documents.length > 0) {
    const [document] = documents;

    if (document.userId !== session.user.id) {
      return new Response('Forbidden', { status: 403 });
    }
  }

  const document = await saveDocument({
    id,
    content,
    title,
    kind,
    userId: session.user.id,
  });

  return Response.json(document, { status: 200 });
}
