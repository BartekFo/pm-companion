import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { createProjectFileEmbedding } from '../db/queries';
import { put } from '@vercel/blob';
import 'server-only';
import { createProjectFile } from '../db/queries';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { embedMany } from 'ai';
import { google } from '@ai-sdk/google';

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const embeddingModel = google.textEmbeddingModel('text-embedding-004');

export async function uploadFilesWithEmbeddings(
  files: File[],
  projectId: string,
  userId: string,
) {
  const filePromises = files.map(async (file) => {
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
        projectId,
        userId,
      });

      const { embeddings } = await embedMany({
        model: embeddingModel,
        values: chunks.map((chunk) => chunk.pageContent),
      });

      const chunkPromises = chunks.map(async (chunk, index) => {
        await createProjectFileEmbedding({
          fileId: createdFile.id,
          embedding: embeddings[index],
          chunkContent: chunk.pageContent,
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

  return (await Promise.all(filePromises)).filter(Boolean);
}
