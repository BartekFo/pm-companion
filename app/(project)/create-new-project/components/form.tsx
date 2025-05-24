'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TeamMembersInput } from './team-members-input';
import { FileUpload } from './file-upload';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { useFormState } from 'react-dom';
import { createProjectAction } from '../actions';

export function CreateNewProjectForm() {
  const [state, formAction] = useFormState(createProjectAction, {
    status: 'idle',
  });

  return (
    <form action={formAction} className="max-w-150 w-full space-y-4">
      <div>
        <Label>What is the project name?</Label>
        <Input placeholder="Name" />
      </div>
      <TeamMembersInput />
      <FileUpload />
      {state.errors && (
        <div className="text-red-500 text-sm space-y-1">
          {state.errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}
      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href={ROUTES.PROJECT.ROOT}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={state.status === 'in_progress'}>
          {state.status === 'in_progress' ? 'Creating...' : 'Create project'}
        </Button>
      </div>
    </form>
  );
}
