import { generateEmbedding } from './embeddings';
import { getProjectFiles, getProjectFileEmbeddings } from '@/lib/db/queries';
import { cosineSimilarity } from 'ai';

export interface RetrievedContext {
  relevantChunks: Array<{
    content: string;
    fileName: string;
    similarity: number;
    chunkIndex?: string;
  }>;
  projectSummary: {
    totalFiles: number;
    fileTypes: string[];
  };
}

export async function retrieveProjectContext(
  projectId: string,
  userQuery: string,
  options: {
    maxChunks?: number;
    similarityThreshold?: number;
  } = {},
): Promise<RetrievedContext> {
  const { similarityThreshold = 0.5 } = options;

  try {
    const queryEmbedding = await generateEmbedding(userQuery);

    const projectFiles = await getProjectFiles(projectId);

    const allEmbeddings: Array<{
      id: string;
      fileId: string;
      chunkContent: string;
      chunkIndex?: string;
      fileName: string;
      embedding: number[];
    }> = [];

    for (const file of projectFiles) {
      try {
        const fileEmbeddings = await getProjectFileEmbeddings(file.id);
        for (const embedding of fileEmbeddings) {
          allEmbeddings.push({
            id: embedding.id,
            fileId: embedding.fileId,
            chunkContent: embedding.chunkContent,
            chunkIndex: embedding.chunkIndex || undefined,
            fileName: file.fileName,
            embedding: embedding.embedding,
          });
        }
      } catch (error) {
        console.error(
          `Failed to get embeddings for file ${file.fileName}:`,
          error,
        );
      }
    }

    const similarities = allEmbeddings.map((item) => ({
      ...item,
      similarity: cosineSimilarity(queryEmbedding, item.embedding),
    }));

    const relevantChunks = similarities
      .filter((item) => item.similarity >= similarityThreshold)
      .sort((a, b) => b.similarity - a.similarity)
      .map((chunk) => ({
        content: chunk.chunkContent,
        fileName: chunk.fileName,
        similarity: chunk.similarity,
        chunkIndex: chunk.chunkIndex,
      }));

    const fileTypes = [
      ...new Set(projectFiles.map((file) => file.contentType)),
    ];

    return {
      relevantChunks,
      projectSummary: {
        totalFiles: projectFiles.length,
        fileTypes,
      },
    };
  } catch (error) {
    console.error('Failed to retrieve project context:', error);
    return {
      relevantChunks: [],
      projectSummary: {
        totalFiles: 0,
        fileTypes: [],
      },
    };
  }
}

export function formatContextForPrompt(context: RetrievedContext): string {
  if (context.relevantChunks.length === 0) {
    return 'No relevant project files found for this query.';
  }

  let prompt = '## Project Context\n\n';
  prompt += `Project has ${context.projectSummary.totalFiles} files of types: ${context.projectSummary.fileTypes.join(', ')}\n\n`;

  prompt += '### Relevant File Excerpts:\n\n';

  context.relevantChunks.forEach((chunk, index) => {
    prompt += `**${chunk.fileName}** (similarity: ${(chunk.similarity * 100).toFixed(1)}%)\n`;
    prompt += `\`\`\`\n${chunk.content}\n\`\`\`\n\n`;
  });

  return prompt;
}
