declare module 'groq-sdk' {
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

  export default class Groq {
    constructor(config?: GroqConfig);
    audio: AudioService;
  }
}