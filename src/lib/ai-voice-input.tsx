import { useQuotaPopup } from '@/context/QuotaPopupContext';
import { RecordingQuotaExhaustedError } from '@/lib/quota-service';

export function AIVoiceInput({
  onStart,
  onStop,
  visualizerBars = 48,
  demoMode = false,
  demoInterval = 3000,
  className,
}: AIVoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const { showQuotaPopup } = useQuotaPopup();
  
  // ... existing code ...

  const handleClick = async () => {
    if (isDemo) {
      setIsDemo(false);
      setIsRecording(false);
      return;
    }

    if (isPaused) {
      return;
    }

    try {
      if (!isRecording) {
        const user = await getAuth().currentUser;
        if (!user) {
          throw new Error("User not authenticated");
        }
        recordingService.setUserId(user.uid);
        recordingService.setQuotaWarningCallback((type) => {
          if (type === 'duration') {
            const currentDuration = recordingService.getCurrentDuration();
            if (currentDuration >= 1800) { // Only stop if we've hit 30 minutes
              toast.warning("Recording time limit reached");
              // Don't pass isQuotaExhausted flag for time limit
              recordingService.stopRecording(false).then(recordingData => {
                setIsRecording(false);
                setIsPaused(false);
                onStop?.(recordingData);
              }).catch(error => {
                console.error("Error stopping recording:", error);
                setIsRecording(false);
                setIsPaused(false);
              });
            } else {
              // Just show warning at 29 minutes
              toast.warning("Recording will end in 1 minute");
            }
          }
        });
        await recordingService.startRecording();
        setIsRecording(true);
        setIsPaused(false);
        onStart?.();
      } else {
        const recordingData = await recordingService.stopRecording();
        setIsRecording(false);
        setIsPaused(false);
        onStop?.(recordingData);
      }
    } catch (error) {
      console.error("Recording error:", error);
      if (error instanceof RecordingQuotaExhaustedError) {
        showQuotaPopup('recording');
      }
      setIsRecording(false);
      setIsPaused(false);
    }
  };
} 