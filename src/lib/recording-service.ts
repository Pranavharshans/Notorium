import { quotaService } from './quota-service';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirebaseInstance, type FirebaseInstances } from './firebase';

export interface RecordingData {
  blob: Blob;
  duration: number;
  downloadURL?: string;
}

export class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private quotaCheckInterval: ReturnType<typeof setInterval> | null = null;
  private onQuotaWarning: ((type: 'warning' | 'limit') => void) | null = null;
  private userId: string | null = null;
  private onUploadProgress: ((progress: number) => void) | null = null;
  private isUploading: boolean = false;

  public setUploadProgressCallback(callback: (progress: number) => void): void {
    this.onUploadProgress = callback;
  }

  public getIsUploading(): boolean {
    return this.isUploading;
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  setQuotaWarningCallback(callback: (type: 'warning' | 'limit') => void): void {
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

      this.quotaCheckInterval = setInterval(async () => {
        const hasQuota = await this.checkQuota();
        if (!hasQuota) {
          await this.stopRecording();
        }
      }, 60000);
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

    const hasQuota = await this.checkQuota();
    if (!hasQuota) {
      throw new Error('Recording quota exceeded');
    }

    if (this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.isPaused = false;

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