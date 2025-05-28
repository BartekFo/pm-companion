import { auth } from '@/app/(auth)/auth';
import { getProjectMemberships } from '@/lib/db/queries';
import { defineAbilityFor } from './abilities';
import type { RawRuleOf } from '@casl/ability';
import type { AppAbility } from './abilities';

export async function getUserRules(
  userId: string,
  userRole: string,
): Promise<RawRuleOf<AppAbility>[]> {
  const projectMemberships = await getProjectMemberships(userId);

  const user = {
    id: userId,
    role: userRole as 'member' | 'pm',
  };

  const ability = defineAbilityFor(user, projectMemberships);
  return ability.rules;
}

export async function getCurrentUserAbility() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const ability = defineAbilityFor(
    { id: session.user.id, role: session.user.role },
    await getProjectMemberships(session.user.id),
  );

  return ability;
}

export async function getCurrentUserRules(): Promise<RawRuleOf<AppAbility>[]> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  return await getUserRules(session.user.id, session.user.role);
}
