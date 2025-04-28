import { GoogleGenAI } from "@google/genai";

export type EnhanceMode = 'detailed' | 'shorter' | 'simpler' | 'complex';
export type LectureCategory = 'programming' | 'mathematics' | 'science' | 'humanities' | 'business' | 'law' | 'medicine' | 'engineering' | 'general';

export class GeminiService {
  async generateNotesFromTranscript(transcript: string, category: LectureCategory = 'general'): Promise<string> {
    try {
      const response = await fetch('/api/ai/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generateNotes',
          transcript,
          category,
        }),
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`Failed to generate notes: ${errorDetail}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error("Generate notes error:", error);
      throw error;
    }
  }

  async enhanceNotes(notes: string, mode: EnhanceMode): Promise<string> {
    try {
      const response = await fetch('/api/ai/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'enhanceNotes',
          notes,
          mode,
        }),
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`Failed to enhance notes: ${errorDetail}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error("Enhance notes error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
