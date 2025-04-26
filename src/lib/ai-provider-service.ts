import { EnhanceMode, geminiService, LectureCategory } from "./gemini-service";
import { groqService } from "./groq-service";
import { quotaService, EnhanceQuotaExhaustedError } from "./quota-service"; // Import the error

export type AIProvider = 'gemini' | 'groq';

export class AIProviderService {
  private static instance: AIProviderService;
  private currentProvider: AIProvider = 'gemini';
  private userId: string | null = null;
  // Removed onQuotaWarning

  private constructor() {}

  static getInstance(): AIProviderService {
    if (!AIProviderService.instance) {
      AIProviderService.instance = new AIProviderService();
    }
    return AIProviderService.instance;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  // Removed setQuotaWarningCallback

  setProvider(provider: AIProvider) {
    this.currentProvider = provider;
  }

  getCurrentProvider(): AIProvider {
    return this.currentProvider;
  }

  // Removed checkEnhanceQuota method

  async generateNotesFromTranscript(transcript: string, category: LectureCategory = 'general'): Promise<{ title: string; content: string }> {
    if (!this.userId) {
      throw new Error('User ID not set');
    }

    // Check quota before proceeding
    try {
      await quotaService.checkEnhanceQuota(this.userId);
    } catch (error) {
      if (error instanceof EnhanceQuotaExhaustedError) {
        throw error; // Re-throw the specific error to be caught upstream
      }
      // Handle other potential errors from checkEnhanceQuota if necessary
      console.error("Unexpected error during enhance quota check:", error);
      throw new Error("Failed to check enhance quota.");
    }

    const notes = await (this.currentProvider === 'gemini'
      ? geminiService.generateNotesFromTranscript(transcript, category)
      : groqService.generateNotesFromTranscript(transcript));

    // After successful generation, increment usage
    await quotaService.incrementEnhanceUsage(this.userId);

    // Extract title from the first heading
    const match = notes.match(/^#\s*[📌]?\s*(.+)$/m);
    const title = match ? match[1].trim() : 'Untitled Note';
    const content = notes.replace(/^#\s*[📌]?\s*.+\n/, '').trim();

    return { title, content };
  }

  async enhanceNotes(notes: string, mode: EnhanceMode): Promise<string> {
    if (!this.userId) {
      throw new Error('User ID not set');
    }

    // Check quota before proceeding
    try {
      await quotaService.checkEnhanceQuota(this.userId);
    } catch (error) {
      if (error instanceof EnhanceQuotaExhaustedError) {
        throw error; // Re-throw the specific error to be caught upstream
      }
      // Handle other potential errors from checkEnhanceQuota if necessary
      console.error("Unexpected error during enhance quota check:", error);
      throw new Error("Failed to check enhance quota.");
    }

    const enhancedNotes = await (this.currentProvider === 'gemini'
      ? geminiService.enhanceNotes(notes, mode)
      : groqService.enhanceNotes(notes, mode));

    // After successful enhancement, increment usage
    await quotaService.incrementEnhanceUsage(this.userId);

    return enhancedNotes;
  }
}

export const aiProviderService = AIProviderService.getInstance();