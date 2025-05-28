import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
  type ForcedSubject,
} from '@casl/ability';
import type { User, ProjectMember } from '@/lib/db/schema';

type Actions =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'invite'
  | 'upload'
  | 'download';

type Subjects =
  | 'Project'
  | 'ProjectMember'
  | 'ProjectFile'
  | 'Chat'
  | 'User'
  | 'all'
  | ForcedSubject<'Project'>
  | ForcedSubject<'ProjectMember'>
  | ForcedSubject<'ProjectFile'>
  | ForcedSubject<'Chat'>
  | ForcedSubject<'User'>;

export type AppAbility = MongoAbility<[Actions, Subjects]>;

export function defineAbilityFor(
  user: Pick<User, 'id' | 'role'>,
  projectMemberships: ProjectMember[] = [],
): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    createMongoAbility,
  );

  if (user.role === 'pm') {
    can('create', 'Project');

    can('manage', 'Project', { userId: user.id } as any);

    can('invite', 'ProjectMember', {
      projectId: { $in: getOwnedProjectIds(projectMemberships, user.id) },
    } as any);
  }

  const accessibleProjectIds = getAccessibleProjectIds(
    projectMemberships,
    user.id,
  );

  can('read', 'Project', { id: { $in: accessibleProjectIds } } as any);
  can('read', 'ProjectFile', {
    projectId: { $in: accessibleProjectIds },
  } as any);
  can('create', 'Chat', { projectId: { $in: accessibleProjectIds } } as any);
  can('read', 'Chat', { projectId: { $in: accessibleProjectIds } } as any);

  can('upload', 'ProjectFile', {
    projectId: { $in: accessibleProjectIds },
  } as any);

  can('update', 'User', { id: user.id } as any);

  return build();
}

function getOwnedProjectIds(
  memberships: ProjectMember[],
  userId: string,
): string[] {
  return memberships
    .filter((m) => m.userId === userId && m.role === 'pm')
    .map((m) => m.projectId);
}

function getAccessibleProjectIds(
  memberships: ProjectMember[],
  userId: string,
): string[] {
  return memberships
    .filter((m) => m.userId === userId && m.status === 'accepted')
    .map((m) => m.projectId);
}
