'use server';

import { z } from 'zod';
import {
  createProject,
  createProjectFile,
  createProjectMembers,
  createProjectFileEmbedding,
} from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/lib/constants/routes';
import { put } from '@vercel/blob';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { google } from '@ai-sdk/google';
import { embedMany } from 'ai';
import { redirect } from 'next/navigation';

const embeddingModel = google.textEmbeddingModel('text-embedding-004');

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

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

const MAX_FILES = 10;

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

  console.log(rawData);
  const files = formData.getAll('files') as File[];
  const validFiles = files
    .filter((file) => FileSchema.safeParse({ file }).success)
    .slice(0, MAX_FILES);

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

  try {
    const project = await createProject({
      name,
      userId: session.user.id,
    });

    if (memberEmails.length > 0) {
      await createProjectMembers({
        projectId: project.id,
        emails: memberEmails,
      });
    }

    if (validFiles.length > 0) {
      const filePromises = validFiles.map(async (file) => {
        try {
          const filename = file.name;
          const fileBuffer = await file.arrayBuffer();
          const data = await put(`${filename}`, fileBuffer, {
            access: 'public',
            allowOverwrite: true,
          });

          const loader = new PDFLoader(file);
          const loadedDocuments = await loader.load();
          const chunks = await splitter.splitDocuments(loadedDocuments);

          const createdFile = await createProjectFile({
            fileName: data.pathname,
            contentType: data.contentType,
            url: data.url,
            content: loadedDocuments[0].pageContent,
            projectId: project.id,
            userId: session.user.id,
          });

          const { embeddings } = await embedMany({
            model: embeddingModel,
            values: chunks.map((chunk) => chunk.pageContent),
          });

          const chunkPromises = chunks.map(async (_, index) => {
            await createProjectFileEmbedding({
              fileId: createdFile.id,
              embedding: embeddings[index],
              chunkIndex: index.toString(),
            });

            return file;
          });

          return await Promise.all(chunkPromises);
        } catch (error) {
          console.error(`Failed to process file ${file.name}:`, error);
          return null;
        }
      });

      const uploadedFiles = (await Promise.all(filePromises)).filter(Boolean);
      console.log(
        `Successfully uploaded ${uploadedFiles.flat().length} file chunks`,
      );
    }
  } catch (error) {
    console.error('Failed to create project:', error);
    return {
      status: 'failed',
      errors: ['Failed to create project. Please try again.'],
    };
  }

  revalidatePath(ROUTES.PROJECT.ROOT);
  redirect(ROUTES.PROJECT.ROOT);
}
