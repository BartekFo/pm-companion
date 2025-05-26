import { google } from '@ai-sdk/google';
import { embed } from 'ai';

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const { embedding } = await embed({
      model: google.textEmbeddingModel('text-embedding-004'),
      value: text,
    });

    return embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    throw error;
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const embeddings = await Promise.all(
      texts.map((text) => generateEmbedding(text)),
    );

    return embeddings;
  } catch (error) {
    console.error('Failed to generate embeddings:', error);
    throw error;
  }
}
