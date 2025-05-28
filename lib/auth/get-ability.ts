import { auth } from '@/app/(auth)/auth';
import { getProjectMemberships } from '@/lib/db/queries';
import { defineAbilityFor } from './abilities';

export async function getCurrentUserAbility() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const user = {
    id: session.user.id,
    role: session.user.role,
    email: session.user.email,
  };

  const projectMemberships = await getProjectMemberships(session.user.id);

  return defineAbilityFor(user, projectMemberships);
}
