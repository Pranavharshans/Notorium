import { EnhanceMode, geminiService, LectureCategory } from "./gemini-service";
import { groqService } from "./groq-service";

export type AIProvider = 'gemini' | 'groq';

export class AIProviderService {
  private static instance: AIProviderService;
  private currentProvider: AIProvider = 'gemini';

  private constructor() {}

  static getInstance(): AIProviderService {
    if (!AIProviderService.instance) {
      AIProviderService.instance = new AIProviderService();
    }
    return AIProviderService.instance;
  }

  setProvider(provider: AIProvider) {
    this.currentProvider = provider;
  }

  getCurrentProvider(): AIProvider {
    return this.currentProvider;
  }

  async generateNotesFromTranscript(transcript: string, category: LectureCategory = 'general'): Promise<{ title: string; content: string }> {
    const notes = await (this.currentProvider === 'gemini'
      ? geminiService.generateNotesFromTranscript(transcript, category)
      : groqService.generateNotesFromTranscript(transcript));

    // Extract title from the first heading
    const match = notes.match(/^#\s*[📌]?\s*(.+)$/m);
    const title = match ? match[1].trim() : 'Untitled Note';
    const content = notes.replace(/^#\s*[📌]?\s*.+\n/, '').trim();

    return { title, content };
  }

  async enhanceNotes(notes: string, mode: EnhanceMode): Promise<string> {
    return this.currentProvider === 'gemini'
      ? geminiService.enhanceNotes(notes, mode)
      : groqService.enhanceNotes(notes, mode);
  }
}

export const aiProviderService = AIProviderService.getInstance();