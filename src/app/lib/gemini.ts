import { GoogleGenAI } from '@google/genai';

// Initialize Google Gen AI SDK
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
});

// Helper for embeddings with correct property mapping
export async function getEmbedding(text: string) {
  try {
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: text,
    });
    // Use response.embeddings or fallback safely
    return (response as any).embeddings?.[0]?.values || (response as any).embedding?.values || [];
  } catch (error) {
    console.error('Embedding error:', error);
    return [];
  }
}