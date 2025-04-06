declare module 'groq-sdk' {
  export interface Message {
    role: string;
    content: string;
  }

  export interface ChatCompletionResponse {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  }

  export interface CompletionOptions {
    messages: Message[];
    model: string;
    temperature?: number;
    max_completion_tokens?: number;
    top_p?: number;
    stream?: boolean;
    stop?: string | null;
  }

  export interface TranscriptionSegment {
    text: string;
    start: number;
    end: number;
  }

  export interface Transcription {
    text: string;
    segments?: TranscriptionSegment[];
  }

  export interface TranscriptionOptions {
    file: File | Blob | ArrayBuffer;
    model: string;
    response_format?: string;
    timestamp_granularities?: string[];
    language?: string;
    temperature?: number;
  }

  export interface GroqConfig {
    apiKey?: string;
    dangerouslyAllowBrowser?: boolean;
  }

  export class AudioService {
    transcriptions: {
      create(options: TranscriptionOptions): Promise<Transcription>;
    };
  }

  export class ChatService {
    completions: {
      create(options: CompletionOptions): Promise<ChatCompletionResponse>;
    };
  }

  export default class Groq {
    constructor(config?: GroqConfig);
    audio: AudioService;
    chat: ChatService;
  }
}