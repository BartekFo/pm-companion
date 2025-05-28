import { auth } from '@/app/(auth)/auth';
import { getUserProjects } from '@/lib/db/queries';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projects = await getUserProjects(session.user.id);
    return Response.json(projects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return Response.json(
      { error: 'Failed to fetch projects' },
      { status: 500 },
    );
  }
}
