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
  async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
    try {
      // Create FormData with the audio blob
      const formData = new FormData();
      formData.append('audio', audioBlob);

      // Send to our API route
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to transcribe audio');
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
}

export const groqService = new GroqService();