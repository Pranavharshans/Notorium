import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  async processTask(data: any): Promise<any> {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`Failed to process Gemini task: ${errorDetail}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Gemini Service error:", error);
      throw error;
    }
  }

  async generateNotesFromTranscript(transcript: string): Promise<string> {
    try {
      console.log("Gemini API Key:", process.env.NEXT_PUBLIC_GEMINI_API_KEY);
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: transcript,
        config: {
          systemInstruction: "Generate comprehensive notes from the transcript."
        }
      });
      return response.text ?? '';
    } catch (error) {
      console.error("Generate notes error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();