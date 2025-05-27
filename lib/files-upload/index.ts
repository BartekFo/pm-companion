import 'server-only';
import { createEmbeddings } from '../trigger/create-embeddings';
import { put } from '@vercel/blob';
import { createProjectFile } from '../db/queries';

export async function uploadFilesWithEmbeddings(
  files: File[],
  projectId: string,
  userId: string,
) {
  const filePromises = files.map(async (file) => {
    try {
      const filename = file.name;

      const data = await put(`${filename}`, file, {
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

      const handle = await createEmbeddings.trigger({
        fileId: createdFile.id,
        fileName: filename,
        fileUrl: data.url,
        projectId,
        userId,
      });

      return file;
    } catch (error) {
      console.error(`Failed to process file ${file.name}:`, error);
      throw error;
    }
  });

  return (await Promise.all(filePromises)).filter(Boolean);
}
