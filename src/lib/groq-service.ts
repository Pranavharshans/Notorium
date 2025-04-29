import { EnhanceMode, LectureCategory } from './openrouter-service';
import { RecordingData } from './recording-service';

interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
}

interface TranscriptionResponse {
  text: string;
  segments?: TranscriptionSegment[];
}

export interface TranscriptionResult {
  text: string;
  segments?: {
    text: string;
    start: number;
    end: number;
  }[];
}

export class GroqService {
  async transcribeAudio(recordingData: RecordingData): Promise<TranscriptionResult> {
    try {
      if (!recordingData.downloadURL) {
        throw new Error('No audio URL available');
      }

      console.log('Sending transcription request with URL:', recordingData.downloadURL);
      
      const requestBody = {
        audioUrl: recordingData.downloadURL
      };
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        try {
          const error = JSON.parse(errorText);
          throw new Error(error.error || 'Failed to transcribe audio');
        } catch (parseError) {
          throw new Error(`Failed to transcribe audio: ${errorText}`);
        }
      }

      const transcription: TranscriptionResponse = await response.json();

      if (!transcription.text) {
        throw new Error('No transcription text received');
      }

      return {
        text: transcription.text,
        segments: transcription.segments?.map(segment => ({
          text: segment.text,
          start: segment.start,
          end: segment.end
        }))
      };
    } catch (error) {
      console.error("Transcription error:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to transcribe audio: ${error.message}`);
      } else {
        throw new Error("Failed to transcribe audio: Unknown error");
      }
    }
  }

  async generateNotesFromTranscript(transcript: string, category: LectureCategory = 'general'): Promise<string> {
    try {
      const response = await fetch('/api/ai/groq', {
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
      const response = await fetch('/api/ai/groq', {
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

export const groqService = new GroqService();