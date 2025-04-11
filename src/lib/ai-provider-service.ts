import { EnhanceMode, geminiService, LectureCategory } from "./gemini-service";
import { groqService } from "./groq-service";
import { quotaService } from "./quota-service";

export type AIProvider = 'gemini' | 'groq';

export class AIProviderService {
  private static instance: AIProviderService;
  private currentProvider: AIProvider = 'gemini';
  private userId: string | null = null;
  private onQuotaWarning: ((type: 'warning' | 'limit') => void) | null = null;

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

  setQuotaWarningCallback(callback: (type: 'warning' | 'limit') => void) {
    this.onQuotaWarning = callback;
  }

  setProvider(provider: AIProvider) {
    this.currentProvider = provider;
  }

  getCurrentProvider(): AIProvider {
    return this.currentProvider;
  }

  private async checkEnhanceQuota(): Promise<boolean> {
    if (!this.userId) {
      throw new Error('User ID not set');
    }

    const quota = await quotaService.checkEnhanceQuota(this.userId);

    if (quota.percentageUsed >= 80 && quota.percentageUsed < 100) {
      this.onQuotaWarning?.('warning');
    } else if (quota.percentageUsed >= 100) {
      this.onQuotaWarning?.('limit');
      return false;
    }

    return true;
  }

  async generateNotesFromTranscript(transcript: string, category: LectureCategory = 'general'): Promise<{ title: string; content: string }> {
    if (!this.userId) {
      throw new Error('User ID not set');
    }

    const hasQuota = await this.checkEnhanceQuota();
    if (!hasQuota) {
      throw new Error('Enhance notes quota exceeded');
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

    const hasQuota = await this.checkEnhanceQuota();
    if (!hasQuota) {
      throw new Error('Enhance notes quota exceeded');
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