# Role-Based Access Control Implementation Plan

## Overview

This document outlines the implementation plan for adding role-based access control (RBAC) to the PM Companion application using the CASL library. The system will support two primary roles:
- **Member**: Can access projects and use chat functionality
- **PM (Project Manager)**: Can create/edit projects, manage team members, and do everything a member can do

## Current State Analysis

### Database Schema
- **User table**: Basic user information (id, email, password)
- **Project table**: Projects with creator userId
- **ProjectMember table**: Already has a `role` field (defaults to 'member')
- **Auth system**: NextAuth with custom session/JWT handling

### Current Authentication
- NextAuth implementation with credentials provider
- Session includes user ID and type ('guest' | 'regular')
- Basic middleware for route protection

## Implementation Plan

### Phase 1: Dependencies and Core Setup

#### 1.1 Install CASL Dependencies
```bash
pnpm add @casl/ability @casl/react
```

#### 1.2 Database Schema Updates

**Migration: Add role to User table**
```sql
-- Add role column to User table
ALTER TABLE "User" ADD COLUMN "role" VARCHAR DEFAULT 'member';

-- Update existing users to have 'member' role by default
UPDATE "User" SET "role" = 'member' WHERE "role" IS NULL;

-- Make role column NOT NULL
ALTER TABLE "User" ALTER COLUMN "role" SET NOT NULL;
```

**Schema Changes:**
- Update `user` table schema to include role field
- Update TypeScript types for User
- Ensure ProjectMember role field uses consistent values

#### 1.3 CASL Ability Definition

**File: `lib/auth/abilities.ts`**
```typescript
import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability';
import { User, Project, ProjectMember, ProjectFile } from '@/lib/db/schema';

// Define all possible actions
type Actions = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'manage' 
  | 'invite'
  | 'upload'
  | 'download';

// Define all subjects (resources)
type Subjects = 
  | 'Project'
  | 'ProjectMember' 
  | 'ProjectFile'
  | 'Chat'
  | 'all'
  | typeof Project
  | typeof ProjectMember
  | typeof ProjectFile;

export type AppAbility = MongoAbility<[Actions, Subjects]>;

export function defineAbilityFor(user: User, projectMemberships: ProjectMember[] = []): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (user.role === 'pm') {
    // PM can create new projects
    can('create', 'Project');
    
    // PM can manage projects they created
    can('manage', 'Project', { userId: user.id });
    
    // PM can invite members to projects they created
    can('invite', 'ProjectMember', { 
      projectId: { $in: getOwnedProjectIds(projectMemberships, user.id) }
    });
  }

  // Both PM and members can access projects they're members of
  const accessibleProjectIds = getAccessibleProjectIds(projectMemberships, user.id);
  
  can('read', 'Project', { id: { $in: accessibleProjectIds } });
  can('read', 'ProjectFile', { projectId: { $in: accessibleProjectIds } });
  can('create', 'Chat', { projectId: { $in: accessibleProjectIds } });
  can('read', 'Chat', { projectId: { $in: accessibleProjectIds } });
  
  // Members can upload files to projects they're members of
  can('upload', 'ProjectFile', { projectId: { $in: accessibleProjectIds } });
  
  // Users can only update their own profile
  can('update', 'User', { id: user.id });

  return build();
}

function getOwnedProjectIds(memberships: ProjectMember[], userId: string): string[] {
  return memberships
    .filter(m => m.userId === userId && m.role === 'pm')
    .map(m => m.projectId);
}

function getAccessibleProjectIds(memberships: ProjectMember[], userId: string): string[] {
  return memberships
    .filter(m => m.userId === userId && m.status === 'accepted')
    .map(m => m.projectId);
}
```

### Phase 2: Authentication System Updates

#### 2.1 Update NextAuth Configuration

**File: `app/(auth)/auth.ts`**
```typescript
// Add role to session and JWT types
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
      role: 'member' | 'pm'; // Add role
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
    role: 'member' | 'pm'; // Add role
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
    role: 'member' | 'pm'; // Add role
  }
}

// Update callbacks to include role
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id as string;
      token.type = user.type;
      token.role = user.role; // Add role to token
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id;
      session.user.type = token.type;
      session.user.role = token.role; // Add role to session
    }
    return session;
  },
}
```

#### 2.2 Create Ability Context Provider

**File: `lib/auth/ability-context.tsx`**
```typescript
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { AppAbility } from './abilities';

const AbilityContext = createContext<AppAbility | undefined>(undefined);

interface AbilityProviderProps {
  ability: AppAbility;
  children: ReactNode;
}

export function AbilityProvider({ ability, children }: AbilityProviderProps) {
  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

export function useAbility(): AppAbility {
  const ability = useAbility();
  if (!ability) {
    throw new Error('useAbility must be used within AbilityProvider');
  }
  return ability;
}
```

#### 2.3 Server-Side Ability Factory

**File: `lib/auth/get-ability.ts`**
```typescript
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
```

### Phase 3: Database Queries Updates

#### 3.1 Add Role-Aware Query Functions

**File: `lib/db/queries.ts` (additions)**
```typescript
// Add role-aware project fetching
export async function getUserProjectsWithRoles(userId: string) {
  return await db
    .select({
      project: project,
      membership: projectMember,
    })
    .from(project)
    .leftJoin(projectMember, eq(projectMember.projectId, project.id))
    .where(
      or(
        eq(project.userId, userId), // Projects created by user
        and(
          eq(projectMember.userId, userId),
          eq(projectMember.status, 'accepted')
        ) // Projects user is member of
      )
    );
}

// Add function to check if user can access project
export async function canUserAccessProject(userId: string, projectId: string): Promise<boolean> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(project)
    .leftJoin(projectMember, eq(projectMember.projectId, project.id))
    .where(
      and(
        eq(project.id, projectId),
        or(
          eq(project.userId, userId),
          and(
            eq(projectMember.userId, userId),
            eq(projectMember.status, 'accepted')
          )
        )
      )
    );
    
  return result[0]?.count > 0;
}

// Add function to check if user is PM of project
export async function isUserProjectPM(userId: string, projectId: string): Promise<boolean> {
  const result = await db
    .select({ userId: project.userId })
    .from(project)
    .where(
      and(
        eq(project.id, projectId),
        eq(project.userId, userId)
      )
    );
    
  return result.length > 0;
}
```

### Phase 4: Middleware and Route Protection

#### 4.1 Enhanced Middleware

**File: `middleware.ts`**
```typescript
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isDevelopmentEnvironment } from './lib/constants';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth routes
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/ping')) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  // Redirect authenticated users from auth pages
  if (token && ['/login', '/register'].includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect authenticated routes
  if (!token && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based route protection
  if (token) {
    // Only PMs can access create project route
    if (pathname.startsWith('/create-project') && token.role !== 'pm') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Only PMs can access edit project routes (additional check in component)
    if (pathname.includes('/edit-project') && token.role !== 'pm') {
      // Note: We'll do more granular checks in the component to verify ownership
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}
```

#### 4.2 Permission Check Utilities

**File: `lib/auth/permission-checks.ts`**
```typescript
import { ForbiddenError } from '@casl/ability';
import { getCurrentUserAbility } from './get-ability';

export async function checkProjectAccess(projectId: string) {
  const ability = await getCurrentUserAbility();
  
  ForbiddenError.from(ability).throwUnlessCan('read', 'Project', { id: projectId });
}

export async function checkProjectManagement(projectId: string) {
  const ability = await getCurrentUserAbility();
  
  ForbiddenError.from(ability).throwUnlessCan('manage', 'Project', { id: projectId });
}

export async function checkFileUpload(projectId: string) {
  const ability = await getCurrentUserAbility();
  
  ForbiddenError.from(ability).throwUnlessCan('upload', 'ProjectFile', { projectId });
}
```

### Phase 5: UI Components and Hooks

#### 5.1 Permission-Based UI Components

**File: `components/auth/can.tsx`**
```typescript
'use client';

import { ReactNode } from 'react';
import { useAbility } from '@/lib/auth/ability-context';

interface CanProps {
  action: string;
  subject: string;
  conditions?: Record<string, any>;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ action, subject, conditions, children, fallback = null }: CanProps) {
  const ability = useAbility();
  
  if (ability.can(action, subject, conditions)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}
```

#### 5.2 Permission Hooks

**File: `hooks/use-permissions.ts`**
```typescript
'use client';

import { useAbility } from '@/lib/auth/ability-context';

export function usePermissions() {
  const ability = useAbility();
  
  return {
    canCreateProject: ability.can('create', 'Project'),
    canManageProject: (projectId: string, userId?: string) => 
      ability.can('manage', 'Project', { id: projectId, userId }),
    canInviteMembers: (projectId: string) => 
      ability.can('invite', 'ProjectMember', { projectId }),
    canUploadFiles: (projectId: string) => 
      ability.can('upload', 'ProjectFile', { projectId }),
    canAccessProject: (projectId: string) => 
      ability.can('read', 'Project', { id: projectId }),
  };
}
```

### Phase 6: Action and Route Updates

#### 6.1 Update Server Actions with Permission Checks

**File: `app/(project)/[projectId]/edit-project/actions.ts`**
```typescript
import { checkProjectManagement } from '@/lib/auth/permission-checks';

export async function updateProjectAction(
  _prevState: UpdateProjectState,
  formData: FormData,
): Promise<UpdateProjectState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: 'failed', errors: ['Authentication required'] };
  }

  const projectId = formData.get('projectId') as string;
  
  // Check permissions before proceeding
  try {
    await checkProjectManagement(projectId);
  } catch (error) {
    return { 
      status: 'failed', 
      errors: ['You do not have permission to edit this project'] 
    };
  }

  // ... rest of the existing logic
}
```

#### 6.2 Update UI Components

**File: `app/(project)/components/project-list.tsx`**
```typescript
'use client';

import { Can } from '@/components/auth/can';
import { usePermissions } from '@/hooks/use-permissions';

export function ProjectList({ projects }: { projects: Project[] }) {
  const { canCreateProject } = usePermissions();
  
  return (
    <div>
      <Can action="create" subject="Project">
        <Button href="/create-project">
          Create New Project
        </Button>
      </Can>
      
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project}
        />
      ))}
    </div>
  );
}
```

### Phase 7: Testing Strategy

#### 7.1 Unit Tests for Abilities

**File: `__tests__/lib/auth/abilities.test.ts`**
```typescript
import { defineAbilityFor } from '@/lib/auth/abilities';

describe('User Abilities', () => {
  describe('Member Role', () => {
    const memberUser = { id: '1', role: 'member' as const, email: 'member@test.com' };
    
    it('cannot create projects', () => {
      const ability = defineAbilityFor(memberUser);
      expect(ability.can('create', 'Project')).toBe(false);
    });
    
    it('can read projects they are members of', () => {
      const memberships = [{ 
        userId: '1', 
        projectId: 'proj1', 
        status: 'accepted' as const,
        role: 'member' as const 
      }];
      const ability = defineAbilityFor(memberUser, memberships);
      expect(ability.can('read', 'Project', { id: 'proj1' })).toBe(true);
    });
  });

  describe('PM Role', () => {
    const pmUser = { id: '1', role: 'pm' as const, email: 'pm@test.com' };
    
    it('can create projects', () => {
      const ability = defineAbilityFor(pmUser);
      expect(ability.can('create', 'Project')).toBe(true);
    });
    
    it('can manage projects they created', () => {
      const ability = defineAbilityFor(pmUser);
      expect(ability.can('manage', 'Project', { userId: '1' })).toBe(true);
    });
  });
});
```

#### 7.2 Integration Tests

**File: `__tests__/auth/permissions.test.ts`**
```typescript
// Test API endpoints with different user roles
// Test middleware protection
// Test UI component rendering based on permissions
```

### Phase 8: Migration and Deployment

#### 8.1 Data Migration Script

**File: `scripts/migrate-user-roles.ts`**
```typescript
// Script to:
// 1. Add role column to existing users
// 2. Set appropriate roles based on existing project ownership
// 3. Update ProjectMember roles to be consistent
```

#### 8.2 Feature Flags (Optional)

**File: `lib/feature-flags.ts`**
```typescript
// Enable gradual rollout of role-based features
export const FEATURES = {
  ROLE_BASED_ACCESS: process.env.ENABLE_RBAC === 'true',
} as const;
```

## Implementation Checklist

### Phase 1: Foundation
- [ ] Install CASL dependencies
- [ ] Create database migration for user roles
- [ ] Update database schema types
- [ ] Implement core ability definitions
- [ ] Create ability context and provider

### Phase 2: Authentication Updates
- [ ] Update NextAuth configuration
- [ ] Modify session and JWT types
- [ ] Create server-side ability factory
- [ ] Update auth callbacks

### Phase 3: Database Layer
- [ ] Add role-aware query functions
- [ ] Create permission check utilities
- [ ] Update existing queries for role support
- [ ] Add database indexes for performance

### Phase 4: Middleware and Protection
- [ ] Enhance middleware with role checks
- [ ] Create permission check utilities
- [ ] Add route-specific protection
- [ ] Implement error handling

### Phase 5: UI and Components
- [ ] Create permission-based UI components
- [ ] Implement permission hooks
- [ ] Update existing components
- [ ] Add conditional rendering

### Phase 6: Actions and Routes
- [ ] Update server actions with permission checks
- [ ] Modify API routes for role-based access
- [ ] Implement proper error responses
- [ ] Add audit logging

### Phase 7: Testing
- [ ] Write unit tests for abilities
- [ ] Create integration tests
- [ ] Test permission edge cases
- [ ] Performance testing

### Phase 8: Deployment
- [ ] Run database migrations
- [ ] Deploy with feature flags
- [ ] Monitor for issues
- [ ] Gradual rollout

## Security Considerations

1. **Principle of Least Privilege**: Users get minimum permissions needed
2. **Defense in Depth**: Check permissions at multiple layers (middleware, server actions, UI)
3. **Input Validation**: Validate all user inputs and project IDs
4. **Audit Logging**: Log permission changes and access attempts
5. **Error Handling**: Don't leak sensitive information in error messages

## Performance Considerations

1. **Caching**: Cache user abilities and project memberships
2. **Database Indexes**: Add indexes on role and membership columns
3. **Lazy Loading**: Load permissions only when needed
4. **Batch Operations**: Batch permission checks where possible

## Maintenance and Monitoring

1. **Metrics**: Track permission denials and access patterns
2. **Alerts**: Monitor for unusual permission grant/deny patterns
3. **Regular Audits**: Review and audit role assignments
4. **Documentation**: Keep permission matrix updated

## Future Enhancements

1. **More Granular Roles**: Add additional roles (viewer, admin, etc.)
2. **Project-Level Permissions**: More fine-grained project permissions
3. **Resource-Level Permissions**: File-specific permissions
4. **Permission Inheritance**: Hierarchical permission structure
5. **API Keys**: Role-based API access tokens 