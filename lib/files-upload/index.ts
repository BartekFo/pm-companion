import 'server-only';
import { put } from '@vercel/blob';
import { createProjectFile } from '../db/queries';
import { tasks } from '@trigger.dev/sdk/v3';
import type { createEmbeddings } from '../trigger/create-embeddings';

export async function uploadFilesWithEmbeddings(
  files: File[],
  projectId: string,
  userId: string,
) {
  const filePromises = files.map(async (file) => {
    try {
      const filename = file.name;

      const data = await put(`${projectId}/${filename}`, file, {
        access: 'public',
        allowOverwrite: true,
      });

      const createdFile = await createProjectFile({
        fileName: data.pathname,
        contentType: data.contentType,
        url: data.url,
        projectId,
        userId,
      });

      return {
        id: createdFile.id,
        filename,
        url: data.url,
      };
    } catch (error) {
      console.error(`Failed to process file ${file.name}:`, error);
      throw error;
    }
  });

  const filesWithData = (await Promise.all(filePromises)).filter(Boolean);

  const batchHandle = await tasks.batchTrigger<typeof createEmbeddings>(
    'create-embeddings',
    filesWithData.map((file) => ({
      payload: {
        fileId: file.id,
        fileName: file.filename,
        fileUrl: file.url,
        projectId,
        userId,
      },
    })),
  );

  return batchHandle;
}
