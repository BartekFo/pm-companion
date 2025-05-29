import { task, logger, wait } from '@trigger.dev/sdk/v3';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { embedMany } from 'ai';
import { google } from '@ai-sdk/google';
import { createProjectFileEmbedding } from '../db/queries';
import { Document } from 'langchain/document';
import { head } from '@vercel/blob';

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const embeddingModel = google.textEmbeddingModel('text-embedding-004');

async function loadPDFContent(fileBuffer: ArrayBuffer, fileName: string) {
  try {
    const pdfParse = require('pdf-parse');
    const buffer = Buffer.from(fileBuffer);

    const pdfData = await pdfParse(buffer);

    return [
      new Document({
        pageContent: pdfData.text,
        metadata: {
          source: fileName,
          pdf: {
            info: pdfData.info,
            metadata: pdfData.metadata,
            version: pdfData.version,
          },
        },
      }),
    ];
  } catch (error) {
    logger.error('PDF parsing failed', {
      fileName,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error(
      `Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export const createEmbeddings = task({
  id: 'create-embeddings',
  queue: {
    concurrencyLimit: 10,
  },
  retry: {
    maxAttempts: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30000,
    factor: 2,
  },
  run: async (payload: {
    fileName: string;
    fileUrl: string;
    fileId: string;
    projectId: string;
    userId: string;
  }) => {
    const { fileName, fileUrl, fileId, projectId, userId } = payload;

    logger.info('Starting embeddings creation', {
      projectId,
      userId,
    });

    try {
      const blobDetails = await head(fileUrl);

      logger.info('Fetching file', {
        fileUrl,
      });
      const response = await fetch(blobDetails.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const fileBuffer = await response.arrayBuffer();

      const loadedDocuments = await loadPDFContent(fileBuffer, fileName);

      if (!loadedDocuments.length) {
        throw new Error('No content found in PDF');
      }

      logger.info('PDF loaded successfully', {
        documentCount: loadedDocuments.length,
      });

      const chunks = await splitter.splitDocuments(loadedDocuments);

      logger.info('Documents split into chunks', {
        chunkCount: chunks.length,
      });

      if (!chunks.length) {
        throw new Error('No chunks created from PDF content');
      }

      const allEmbeddings: number[][] = [];
      const BATCH_SIZE = 90;

      for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batchChunks = chunks.slice(i, i + BATCH_SIZE);
        const batchContent = batchChunks.map((chunk) => chunk.pageContent);

        logger.info(
          `Generating embeddings for batch ${Math.floor(i / BATCH_SIZE) + 1}`,
          {
            batchSize: batchContent.length,
            startIndex: i,
          },
        );

        const { embeddings: batchEmbeddings } = await embedMany({
          model: embeddingModel,
          values: batchContent,
        });

        allEmbeddings.push(...batchEmbeddings);
        await wait.for({ seconds: 5 });
      }

      logger.info('Embeddings generated', {
        embeddingCount: allEmbeddings.length,
      });

      const embeddingPromises = chunks.map(async (chunk, index) => {
        return await createProjectFileEmbedding({
          fileId,
          embedding: allEmbeddings[index],
          chunkContent: chunk.pageContent,
          chunkIndex: index.toString(),
        });
      });

      const results = await Promise.all(embeddingPromises);

      logger.info('Embeddings stored successfully', {
        fileId,
        storedCount: results.length,
      });

      return {
        success: true,
        fileId,
        chunkCount: chunks.length,
        embeddingCount: allEmbeddings.length,
      };
    } catch (error) {
      logger.error('Failed to create embeddings', {
        fileId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  },
});
