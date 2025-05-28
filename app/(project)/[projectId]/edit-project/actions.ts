'use server';

import { z } from 'zod';
import {
  updateProject,
  createProjectMembers,
  deleteProjectFile,
  deleteProjectMember,
  getProjectMembers,
} from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/lib/constants/routes';
import { del } from '@vercel/blob';
import { redirect } from 'next/navigation';
import { uploadFilesWithEmbeddings } from '@/lib/files-upload';
import { MAX_FILES_PER_PROJECT } from '@/lib/constants';
import { checkProjectManagement } from '@/lib/auth/permission-checks';
import { ForbiddenError } from '@casl/ability';

const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  teamMembers: z.string().optional(),
  projectId: z.string(),
});

export interface UpdateProjectState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
  errors?: string[];
}

const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'File size should be less than 5MB',
    })
    .refine((file) => ['application/pdf'].includes(file.type), {
      message: 'File type should be PDF',
    }),
});

export async function updateProjectAction(
  _prevState: UpdateProjectState,
  formData: FormData,
): Promise<UpdateProjectState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: 'failed', errors: ['Authentication required'] };
  }

  const rawData = {
    name: formData.get('name') as string,
    teamMembers: formData.get('teamMembers') as string,
    projectId: formData.get('projectId') as string,
  };

  const files = formData.getAll('files') as File[];
  const filesToDelete = formData.getAll('filesToDelete') as string[];

  const validFiles = files
    .filter((file) => FileSchema.safeParse({ file }).success)
    .slice(0, MAX_FILES_PER_PROJECT);

  const result = updateProjectSchema.safeParse(rawData);
  if (!result.success) {
    return {
      status: 'invalid_data',
      errors: result.error.issues.map((issue) => issue.message),
    };
  }

  const { name, teamMembers, projectId } = result.data;

  try {
    await checkProjectManagement(projectId);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return {
        status: 'failed',
        errors: ['You do not have permission to edit this project'],
      };
    }
    return {
      status: 'failed',
      errors: ['Permission check failed'],
    };
  }

  try {
    await updateProject(projectId, { name });

    const currentMembers = await getProjectMembers(projectId);
    const newMemberEmails = teamMembers
      ? teamMembers
          .split(',')
          .map((email) => email.trim())
          .filter(Boolean)
      : [];

    const membersToDelete = currentMembers.filter(
      (member) => !newMemberEmails.includes(member.email),
    );

    const currentEmails = currentMembers.map((member) => member.email);
    const emailsToAdd = newMemberEmails.filter(
      (email) => !currentEmails.includes(email),
    );

    for (const member of membersToDelete) {
      await deleteProjectMember(member.id);
    }

    if (emailsToAdd.length > 0) {
      await createProjectMembers({
        projectId,
        emails: emailsToAdd,
      });
    }

    if (filesToDelete.length > 0) {
      for (const fileId of filesToDelete) {
        try {
          const deletedFile = await deleteProjectFile(fileId);
          if (deletedFile) {
            await del(deletedFile.url);
          }
        } catch (error) {
          console.error(`Failed to delete file ${fileId}:`, error);
        }
      }
    }

    if (validFiles.length > 0) {
      await uploadFilesWithEmbeddings(validFiles, projectId, session.user.id);
    }
  } catch (error) {
    console.error('Failed to update project:', error);
    return {
      status: 'failed',
      errors: ['Failed to update project. Please try again.'],
    };
  }

  revalidatePath(ROUTES.PROJECT.EDIT_PROJECT(projectId));
  revalidatePath(ROUTES.PROJECT.CHAT(projectId));
  redirect(ROUTES.PROJECT.CHAT(projectId));
}
