// import { quotaService, RecordingQuotaExhaustedError } from './quota-service'; // Commented out RecordingQuotaExhaustedError - @typescript-eslint/no-unused-vars
import { quotaService } from './quota-service';
// import { notesService } from './notes-service'; // Commented out - @typescript-eslint/no-unused-vars
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirebaseInstance } from './firebase';
// import { groqService } from './groq-service'; // Commented out - @typescript-eslint/no-unused-vars
// import { aiProviderService } from './ai-provider-service'; // Commented out - @typescript-eslint/no-unused-vars

export interface RecordingData {
  blob: Blob;
  duration: number;
  downloadURL?: string;
}

// Maximum duration for a single recording session (30 minutes)
const MAX_RECORDING_DURATION_SECONDS = 1800; // 30 minutes * 60 seconds

export class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private quotaCheckInterval: ReturnType<typeof setInterval> | null = null;
  private onQuotaWarning: ((type: 'warning' | 'limit' | 'duration') => void) | null = null;
  private userId: string | null = null;
  private onUploadProgress: ((progress: number) => void) | null = null;
  private isUploading: boolean = false;
  private onNoteCreated: ((noteId: string) => void) | null = null;
  private isPaused: boolean = false;

  setOnNoteCreated(callback: (noteId: string) => void): void {
    this.onNoteCreated = callback;
  }

  public setUploadProgressCallback(callback: (progress: number) => void): void {
    this.onUploadProgress = callback;
  }

  public getIsUploading(): boolean {
    return this.isUploading;
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  setQuotaWarningCallback(callback: (type: 'warning' | 'limit' | 'duration') => void): void {
    this.onQuotaWarning = callback;
  }

  private async checkQuota(): Promise<boolean> {
    if (!this.userId) {
      throw new Error('User ID not set');
    }

    const currentDuration = this.getCurrentDuration();
    const minutesUsed = Math.ceil(currentDuration / 60);
    
    const quotaStatus = await quotaService.silentCheckRecordingQuota(this.userId);
    const remainingMinutes = quotaStatus.minutesRemaining - minutesUsed;

    if (quotaStatus.isExhausted || remainingMinutes <= 0) {
      this.onQuotaWarning?.('limit');
      return false;
    } else if (remainingMinutes <= 1) {
      this.onQuotaWarning?.('warning');
    }

    return true;
  }

  async startRecording(): Promise<void> {
    if (!this.userId) {
      throw new Error('User ID not set');
    }

    try {
      const quotaStatus = await quotaService.silentCheckRecordingQuota(this.userId);
      if (quotaStatus.isExhausted || !quotaStatus.hasQuota) {
        this.onQuotaWarning?.('limit');
        return; // Return instead of throwing an error
      }
      
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

      this.quotaCheckInterval = setInterval(async () => {
        // Check recording duration
        const currentDuration = this.getCurrentDuration();
        const warningThreshold = 1740; // 29 minutes * 60 seconds
        
        if (currentDuration >= MAX_RECORDING_DURATION_SECONDS) {
          console.log('Maximum recording duration reached, stopping...');
          this.onQuotaWarning?.('duration');
          await this.stopRecording();
          return;
        } else if (currentDuration >= warningThreshold) {
          console.log('Recording duration warning - approaching 30 minute limit...');
          this.onQuotaWarning?.('duration');
        }

        // Check quota silently
        try {
          const quotaStatus = await quotaService.silentCheckRecordingQuota(this.userId!);
          const minutesUsed = Math.ceil(currentDuration / 60);
          const remainingMinutes = quotaStatus.minutesRemaining - minutesUsed;
          
          if (quotaStatus.isExhausted || remainingMinutes <= 0) {
            console.log('Quota exhausted, stopping recording...');
            this.onQuotaWarning?.('limit');
            await this.stopRecording(true); // Pass true to indicate quota exhaustion
          } else if (remainingMinutes <= 1) {
            this.onQuotaWarning?.('warning');
          }
        } catch (error) {
          console.error('Error checking quota:', error);
        }
      }, 5000); // Check every 5 seconds
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to start recording');
    }
  }

  private async uploadAudioToFirebase(audioBlob: Blob, userId: string): Promise<string> {
    this.isUploading = true;
    
    try {
      const { app } = await getFirebaseInstance();
      const storage = getStorage(app);
      const storageRef = ref(storage, `audio/${userId}/${Date.now()}.webm`);
      const uploadTask = uploadBytesResumable(storageRef, audioBlob);

      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            this.onUploadProgress?.(progress);
          },
          (error) => {
            this.isUploading = false;
            console.error("Upload failed", error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('File available at', downloadURL);
              this.isUploading = false;
              this.onUploadProgress?.(100);
              resolve(downloadURL);
            } catch (error) {
              this.isUploading = false;
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      this.isUploading = false;
      throw error;
    }
  }

  async stopRecording(/* isQuotaExhausted: boolean = false */): Promise<RecordingData> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recording not started'));
        return;
      }

      if (this.quotaCheckInterval) {
        clearInterval(this.quotaCheckInterval);
        this.quotaCheckInterval = null;
      }

      const duration = (Date.now() - this.startTime) / 1000;

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const tracks = this.mediaRecorder?.stream.getTracks();
          tracks?.forEach(track => track.stop());

          if (!this.userId) {
            throw new Error('User ID not set');
          }

          try {
            const downloadURL = await this.uploadAudioToFirebase(audioBlob, this.userId);
            await quotaService.incrementRecordingUsage(this.userId, Math.ceil(duration / 60));

            // Remove auto-generation logic, let NewLectureView handle it

            resolve({
              blob: audioBlob,
              duration,
              downloadURL,
            });
          } catch (uploadError) {
            reject(uploadError);
          }
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

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

    const hasQuota = await this.checkQuota();
    if (!hasQuota) {
      throw new Error('Recording quota exceeded');
    }

    if (this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.isPaused = false;

      this.quotaCheckInterval = setInterval(async () => {
        // Check recording duration
        const currentDuration = this.getCurrentDuration();
        const warningThreshold = 1740; // 29 minutes * 60 seconds
        
        if (currentDuration >= MAX_RECORDING_DURATION_SECONDS) {
          console.log('Maximum recording duration reached, stopping...');
          this.onQuotaWarning?.('duration');
          await this.stopRecording();
          return;
        } else if (currentDuration >= warningThreshold) {
          console.log('Recording duration warning - approaching 30 minute limit...');
          this.onQuotaWarning?.('duration');
        }

        // Check quota
        const hasQuota = await this.checkQuota();
        if (!hasQuota) {
          console.log('Quota exhausted, stopping recording...');
          await this.stopRecording(true); // Pass true to indicate quota exhaustion
        }
      }, 5000); // Check every 5 seconds
    }
  }
}

export const recordingService = new RecordingService();