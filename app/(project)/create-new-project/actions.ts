'use server';

import { z } from 'zod';
import { createProject, createProjectMembers } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/lib/constants/routes';
import { redirect } from 'next/navigation';
import { uploadFilesWithEmbeddings } from '@/lib/files-upload';
import { MAX_FILES_PER_PROJECT } from '@/lib/constants';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  teamMembers: z.string().optional(),
});

export interface CreateProjectState {
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

export async function createProjectAction(
  _prevState: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: 'failed', errors: ['Authentication required'] };
  }

  const rawData = {
    name: formData.get('name') as string,
    teamMembers: formData.get('teamMembers') as string,
  };

  const files = formData.getAll('files') as File[];
  const validFiles = files
    .filter((file) => FileSchema.safeParse({ file }).success)
    .slice(0, MAX_FILES_PER_PROJECT);

  const result = createProjectSchema.safeParse(rawData);
  if (!result.success) {
    return {
      status: 'invalid_data',
      errors: result.error.issues.map((issue) => issue.message),
    };
  }

  const { name, teamMembers } = result.data;
  const memberEmails = teamMembers
    ? teamMembers
        .split(',')
        .map((email) => email.trim())
        .filter(Boolean)
    : [];

  let projectId: string;

  try {
    const project = await createProject({
      name,
      userId: session.user.id,
    });

    projectId = project.id;

    if (memberEmails.length > 0) {
      await createProjectMembers({
        projectId: project.id,
        emails: memberEmails,
      });
    }

    if (validFiles.length > 0) {
      await uploadFilesWithEmbeddings(validFiles, project.id, session.user.id);
    }
  } catch (error) {
    console.error('Failed to create project:', error);
    return {
      status: 'failed',
      errors: ['Failed to create project. Please try again.'],
    };
  }

  revalidatePath(ROUTES.PROJECT.ROOT);
  redirect(ROUTES.PROJECT.CHAT(projectId));
}
