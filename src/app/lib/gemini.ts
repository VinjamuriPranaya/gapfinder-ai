import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

// Initialize the official Google Gen AI SDK client
export const ai = new GoogleGenAI({ apiKey });

/**
 * Generates vector embeddings for a chunk of text using Gemini's text-embedding-004 model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: text,
    });
    
    if (response.embedding?.values) {
      return response.embedding.values;
    }
    throw new Error('Failed to generate embedding values.');
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}