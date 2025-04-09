export interface RecordingData {
  blob: Blob;
  duration: number;
}

export class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.startTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to start recording');
    }
  }

  async stopRecording(): Promise<RecordingData> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recording not started'));
        return;
      }

      const duration = (Date.now() - this.startTime) / 1000; // Duration in seconds

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          // Removed MP3 conversion call
          
          // Stop all audio tracks
          const tracks = this.mediaRecorder?.stream.getTracks();
          tracks?.forEach(track => track.stop());

          resolve({
            blob: audioBlob, // Return the original webm blob
            duration
          });
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  // Removed convertToMp3 function

  private isPaused: boolean = false;

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording' && !this.isPaused;
  }

  getCurrentDuration(): number {
    if (!this.startTime || !this.isRecording()) return 0;
    return (Date.now() - this.startTime) / 1000;
  }

  async pauseRecording(): Promise<void> {
    if (!this.mediaRecorder) {
      throw new Error('Recording not started');
    }

    if (this.isPaused) {
      return;
    }

    if (this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.isPaused = true;
    }
  }

  async resumeRecording(): Promise<void> {
    if (!this.mediaRecorder) {
      throw new Error('Recording not started');
    }

    if (!this.isPaused) {
      return;
    }

    if (this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.isPaused = false;
    }
  }
}

export const recordingService = new RecordingService();