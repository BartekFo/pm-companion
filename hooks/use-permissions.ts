'use client';

import { useAbility } from '@/lib/auth/ability-context';
import { useMemo } from 'react';

export function usePermissions() {
  const ability = useAbility();

  return useMemo(
    () => ({
      canCreateProject: ability.can('create', 'Project'),
      canManageProject: (projectId: string, userId?: string) =>
        ability.can('manage', 'Project', { id: projectId, userId } as any),
      canInviteMembers: (projectId: string) =>
        ability.can('invite', 'ProjectMember', { projectId } as any),
      canUploadFiles: (projectId: string) =>
        ability.can('upload', 'ProjectFile', { projectId } as any),
      canAccessProject: (projectId: string) =>
        ability.can('read', 'Project', { id: projectId } as any),

      // Cached permission checks for common operations
      get isProjectManager() {
        return ability.can('create', 'Project');
      },

      get isMember() {
        return !ability.can('create', 'Project');
      },
    }),
    [ability],
  );
}
