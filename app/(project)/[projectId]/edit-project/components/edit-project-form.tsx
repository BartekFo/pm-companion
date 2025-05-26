'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TeamMembersInput } from '../../../components/team-members-input';
import { FileUpload } from '../../../components/file-upload';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { updateProjectAction } from '../actions';
import { useActionState } from 'react';
import type { Project, ProjectMember, ProjectFile } from '@/lib/db/schema';
import { SubmitButton } from '@/components/submit-button';

interface EditProjectFormProps {
  project: Project;
  members: ProjectMember[];
  files: ProjectFile[];
}

export function EditProjectForm({
  project,
  members,
  files,
}: EditProjectFormProps) {
  const [state, formAction] = useActionState(updateProjectAction, {
    status: 'idle',
  });

  const currentMemberEmails = members.map((member) => member.email).join(', ');

  return (
    <div className="max-w-150 w-full space-y-6">
      <form className="space-y-4" action={formAction}>
        <input type="hidden" name="projectId" value={project.id} />

        <div>
          <Label>What is the project name?</Label>
          <Input name="name" placeholder="Name" defaultValue={project.name} />
        </div>

        <div className="space-y-4">
          <TeamMembersInput defaultValue={currentMemberEmails} />
        </div>

        <div className="space-y-4">
          <FileUpload defaultFiles={files} />
        </div>

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
          <SubmitButton isSuccessful={state.status === 'success'}>
            Update project
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
