'use client';

import { useAbility } from '@/lib/auth/ability-context';
import { useMemo } from 'react';

export function usePermissions() {
  const ability = useAbility();

  return useMemo(
    () => ({
      canCreateProject: ability.can('create', 'Project'),
      canManageProject: () => ability.can('manage', 'Project'),
      canInviteMembers: () => ability.can('invite', 'ProjectMember'),
      canUploadFiles: () => ability.can('upload', 'ProjectFile'),
      canAccessProject: () => ability.can('read', 'Project'),

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
