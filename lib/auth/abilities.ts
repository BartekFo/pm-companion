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
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  const ownedProjectIds = new Set<string>();
  const accessibleProjectIds = new Set<string>();

  for (const membership of projectMemberships) {
    if (membership.userId === user.id) {
      if (membership.status === 'accepted') {
        accessibleProjectIds.add(membership.projectId);
      }
      if (membership.role === 'pm') {
        ownedProjectIds.add(membership.projectId);
      }
    }
  }

  const ownedProjectIdsArray = Array.from(ownedProjectIds);
  const accessibleProjectIdsArray = Array.from(accessibleProjectIds);

  if (user.role === 'pm') {
    can('create', 'Project');
    can('manage', 'Project', { userId: user.id } as any);

    if (ownedProjectIdsArray.length > 0) {
      can('invite', 'ProjectMember', {
        projectId: { $in: ownedProjectIdsArray },
      } as any);
    }
  }

  if (accessibleProjectIdsArray.length > 0) {
    can('read', 'Project', { id: { $in: accessibleProjectIdsArray } } as any);
    can('read', 'ProjectFile', {
      projectId: { $in: accessibleProjectIdsArray },
    } as any);
    can('create', 'Chat', {
      projectId: { $in: accessibleProjectIdsArray },
    } as any);
    can('read', 'Chat', {
      projectId: { $in: accessibleProjectIdsArray },
    } as any);
    can('upload', 'ProjectFile', {
      projectId: { $in: accessibleProjectIdsArray },
    } as any);
  }

  can('update', 'User', { id: user.id } as any);

  return build();
}
