'use server';

import { z } from 'zod';
import {} from '@/lib/db/queries';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  teamMembers: z.string().optional(),
});

export interface CreateProjectState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
  errors?: string[];
}

export async function createProjectAction(
  _prevState: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  // const session = await auth();
  // if (!session?.user?.id) {
  //   return { status: 'failed', errors: ['Authentication required'] };
  // }
  // const rawData = {
  //   name: formData.get('name') as string,
  //   teamMembers: formData.get('teamMembers') as string,
  // };
  // const files = formData.getAll('files') as File[];
  // const validFiles = files.filter((file) => file.size > 0);
  // const result = createProjectSchema.safeParse(rawData);
  // if (!result.success) {
  //   return {
  //     status: 'invalid_data',
  //     errors: result.error.issues.map((issue) => issue.message),
  //   };
  // }
  // const { name, teamMembers } = result.data;
  // const memberEmails = teamMembers
  //   ? teamMembers
  //       .split(',')
  //       .map((email) => email.trim())
  //       .filter(Boolean)
  //   : [];
  // try {
  //   const project = await createProject({
  //     name,
  //     userId: session.user.id,
  //   });
  //   if (memberEmails.length > 0) {
  //     await createProjectMembers({
  //       projectId: project.id,
  //       emails: memberEmails,
  //     });
  //   }
  //   if (validFiles.length > 0) {
  //     const uploadedFiles = await uploadFiles(validFiles);
  //     await createProjectDocuments({
  //       projectId: project.id,
  //       userId: session.user.id,
  //       files: uploadedFiles,
  //     });
  //   }
  //   revalidatePath(ROUTES.PROJECT.ROOT);
  //   redirect(`${ROUTES.PROJECT.ROOT}`);
  // } catch (error) {
  //   console.error('Failed to create project:', error);
  //   return {
  //     status: 'failed',
  //     errors: ['Failed to create project. Please try again.'],
  //   };
  // }
}
