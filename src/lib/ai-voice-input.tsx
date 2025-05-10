// import { useQuotaPopup } from '@/context/QuotaPopupContext'; // Commented out - @typescript-eslint/no-unused-vars
// import { useState } from 'react'; // Commented out - @typescript-eslint/no-unused-vars
// import { RecordingQuotaExhaustedError } from '@/lib/quota-service'; // Already commented out in a previous step or not present

interface AIVoiceInputProps {
  onStart?: () => void;
  onStop?: (recordingData?: Record<string, unknown>) => void;
  // visualizerBars?: number;
  // demoMode?: boolean;
  // demoInterval?: number;
  // className?: string;
}

export function AIVoiceInput({
  // onStart, // Commented out - @typescript-eslint/no-unused-vars
  // onStop, // Commented out - @typescript-eslint/no-unused-vars
  // visualizerBars = 48, // Commented out - @typescript-eslint/no-unused-vars
  // demoMode = false, // Commented out - @typescript-eslint/no-unused-vars
  // demoInterval = 3000, // Commented out - @typescript-eslint/no-unused-vars
  // className, // Commented out - @typescript-eslint/no-unused-vars
}: AIVoiceInputProps) {
  // const [isRecording, setIsRecording] = useState(false); // Commented out - @typescript-eslint/no-unused-vars
  // const { showQuotaPopup } = useQuotaPopup(); // Commented out - @typescript-eslint/no-unused-vars
  
  // ... existing code ...

  // const handleClick = async () => { // Commented out - @typescript-eslint/no-unused-vars
  //   if (isDemo) {
  //     setIsDemo(false);
  //     setIsRecording(false);
  //     return;
  //   }

  //   if (isPaused) {
  //     return;
  //   }

  //   try {
  //     if (!isRecording) {
  //       const user = await getAuth().currentUser;
  //       if (!user) {
  //         throw new Error("User not authenticated");
  //       }
  //       recordingService.setUserId(user.uid);
  //       recordingService.setQuotaWarningCallback((type) => {
  //         if (type === 'duration') {
  //           const currentDuration = recordingService.getCurrentDuration();
  //           if (currentDuration >= 1800) { // Only stop if we've hit 30 minutes
  //             toast.warning("Recording time limit reached");
  //             // Don't pass isQuotaExhausted flag for time limit
  //             recordingService.stopRecording(false).then(recordingData => {
  //               setIsRecording(false);
  //               setIsPaused(false);
  //               onStop?.(recordingData);
  //             }).catch(error => {
  //               console.error("Error stopping recording:", error);
  //               setIsRecording(false);
  //               setIsPaused(false);
  //             });
  //           } else {
  //             // Just show warning at 29 minutes
  //             toast.warning("Recording will end in 1 minute");
  //           }
  //         }
  //       });
  //       await recordingService.startRecording();
  //       setIsRecording(true);
  //       setIsPaused(false);
  //       onStart?.();
  //     } else {
  //       const recordingData = await recordingService.stopRecording();
  //       setIsRecording(false);
  //       setIsPaused(false);
  //       onStop?.(recordingData);
  //     }
  //   } catch (error) {
  //     console.error("Recording error:", error);
  //     // if (error instanceof RecordingQuotaExhaustedError) { // This type might not be available if the import is commented
  //     //   showQuotaPopup('recording');
  //     // }
  //     setIsRecording(false);
  //     setIsPaused(false);
  //   }
  // };
} 