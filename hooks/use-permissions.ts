'use client';

import { useAbility } from '@/lib/auth/ability-context';

export function usePermissions() {
  const ability = useAbility();

  return {
    canCreateProject: ability.can('create', 'Project'),
    canManageProject: (projectId: string, userId?: string) =>
      ability.can('manage', 'Project', { id: projectId, userId } as any),
    canInviteMembers: (projectId: string) =>
      ability.can('invite', 'ProjectMember', { projectId } as any),
    canUploadFiles: (projectId: string) =>
      ability.can('upload', 'ProjectFile', { projectId } as any),
    canAccessProject: (projectId: string) =>
      ability.can('read', 'Project', { id: projectId } as any),
  };
}
