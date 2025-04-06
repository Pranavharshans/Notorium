import { EnhanceMode, geminiService } from "./gemini-service";
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

  async generateNotesFromTranscript(transcript: string): Promise<string> {
    return this.currentProvider === 'gemini' 
      ? geminiService.generateNotesFromTranscript(transcript)
      : groqService.generateNotesFromTranscript(transcript);
  }

  async enhanceNotes(notes: string, mode: EnhanceMode): Promise<string> {
    return this.currentProvider === 'gemini'
      ? geminiService.enhanceNotes(notes, mode)
      : groqService.enhanceNotes(notes, mode);
  }
}

export const aiProviderService = AIProviderService.getInstance();