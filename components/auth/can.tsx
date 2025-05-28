'use client';

import type { ReactNode } from 'react';
import { useAbility } from '@/lib/auth/ability-context';

// Define actions type locally to avoid importing from abilities
type Actions =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'invite'
  | 'upload'
  | 'download';

// Define subjects type locally to avoid importing from abilities
type Subjects =
  | 'Project'
  | 'ProjectMember'
  | 'ProjectFile'
  | 'Chat'
  | 'User'
  | 'all';

interface CanProps {
  action: Actions;
  subject: Subjects;
  conditions?: Record<string, any>;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({
  action,
  subject,
  conditions,
  children,
  fallback = null,
}: CanProps) {
  const ability = useAbility();

  if (
    conditions
      ? ability.can(action, subject, conditions as any)
      : ability.can(action, subject)
  ) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
