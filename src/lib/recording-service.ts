import { quotaService } from './quota-service';

export interface RecordingData {
  blob: Blob;
  duration: number;
}

export class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private quotaCheckInterval: ReturnType<typeof setInterval> | null = null;
  private onQuotaWarning: ((type: 'warning' | 'limit') => void) | null = null;
  private userId: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
  }

  setQuotaWarningCallback(callback: (type: 'warning' | 'limit') => void) {
    this.onQuotaWarning = callback;
  }

  private async checkQuota(): Promise<boolean> {
    if (!this.userId) {
      throw new Error('User ID not set');
    }

    const quota = await quotaService.checkRecordingQuota(this.userId);

    if (quota.percentageUsed >= 80 && quota.percentageUsed < 100) {
      this.onQuotaWarning?.('warning');
    } else if (quota.percentageUsed >= 100) {
      this.onQuotaWarning?.('limit');
      return false;
    }

    return true;
  }

  async startRecording(): Promise<void> {
    if (!this.userId) {
      throw new Error('User ID not set');
    }

    // Check quota before starting
    const hasQuota = await this.checkQuota();
    if (!hasQuota) {
      throw new Error('Recording quota exceeded');
    }

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

      // Set up periodic quota checks
      this.quotaCheckInterval = setInterval(async () => {
        const hasQuota = await this.checkQuota();
        if (!hasQuota) {
          await this.stopRecording();
        }
      }, 60000); // Check every minute
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

      if (this.quotaCheckInterval) {
        clearInterval(this.quotaCheckInterval);
        this.quotaCheckInterval = null;
      }

      const duration = (Date.now() - this.startTime) / 1000; // Duration in seconds

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          
          // Stop all audio tracks
          const tracks = this.mediaRecorder?.stream.getTracks();
          tracks?.forEach(track => track.stop());

          // Update quota usage
          if (this.userId) {
            await quotaService.incrementRecordingUsage(this.userId, Math.ceil(duration / 60)); // Convert to minutes
          }

          resolve({
            blob: audioBlob,
            duration
          });
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

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

      if (this.quotaCheckInterval) {
        clearInterval(this.quotaCheckInterval);
        this.quotaCheckInterval = null;
      }
    }
  }

  async resumeRecording(): Promise<void> {
    if (!this.mediaRecorder) {
      throw new Error('Recording not started');
    }

    if (!this.isPaused) {
      return;
    }

    // Check quota before resuming
    const hasQuota = await this.checkQuota();
    if (!hasQuota) {
      throw new Error('Recording quota exceeded');
    }

    if (this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.isPaused = false;

      // Resume quota checks
      this.quotaCheckInterval = setInterval(async () => {
        const hasQuota = await this.checkQuota();
        if (!hasQuota) {
          await this.stopRecording();
        }
      }, 60000);
    }
  }
}

export const recordingService = new RecordingService();