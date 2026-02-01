import { useState, useEffect, useCallback, useRef } from 'react';
import { Vibration, AppState, AppStateStatus } from 'react-native';
import { Audio } from 'expo-av';
import { useSOSStore } from '../stores/sosStore';
import { useAuthStore } from '../stores/authStore';
import {
  transcribeAudio,
  detectSOSCodeWord,
  startRecording,
  stopRecording,
} from '../services/api/elevenlabs';
import { SOSTrigger, EmergencyContact } from '../types';

interface UseSOSModeOptions {
  enableVoiceDetection?: boolean;
  voiceDetectionInterval?: number; // ms
}

interface UseSOSModeReturn {
  isSOSActive: boolean;
  isListening: boolean;
  triggerSOS: (trigger?: SOSTrigger) => Promise<void>;
  cancelSOS: () => void;
  resolveSOS: () => Promise<void>;
  startVoiceDetection: () => Promise<void>;
  stopVoiceDetection: () => void;
  error: string | null;
}

export const useSOSMode = (options: UseSOSModeOptions = {}): UseSOSModeReturn => {
  const { enableVoiceDetection = false, voiceDetectionInterval = 5000 } = options;

  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const { isSOSActive, currentSOS, triggerSOS: storeTriggerSOS, resolveSOS: storeResolveSOS, cancelSOS: storeCancelSOS } = useSOSStore();
  const { user } = useAuthStore();

  // Handle app state changes (pause listening when app is in background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        // App going to background - stop listening
        if (isListening) {
          stopVoiceDetection();
        }
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  const triggerSOS = useCallback(
    async (trigger: SOSTrigger = 'button') => {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Haptic feedback - long vibration pattern
      Vibration.vibrate([0, 500, 200, 500]);

      try {
        await storeTriggerSOS(trigger, user.id, user.emergencyContacts);
      } catch (err: any) {
        setError(err.message || 'Failed to trigger SOS');
      }
    },
    [user, storeTriggerSOS]
  );

  const cancelSOS = useCallback(() => {
    storeCancelSOS();
    Vibration.cancel();
  }, [storeCancelSOS]);

  const resolveSOS = useCallback(async () => {
    if (!currentSOS) return;

    try {
      await storeResolveSOS(currentSOS.id, 'resolved');
      Vibration.cancel();
    } catch (err: any) {
      setError(err.message || 'Failed to resolve SOS');
    }
  }, [currentSOS, storeResolveSOS]);

  const processVoiceRecording = useCallback(async () => {
    console.log('[SOS] Processing Voice Recording. User:', !!user, 'CodeWord:', user?.sosCodeWord, 'RecordingRef:', !!recordingRef.current);
    if (!user?.sosCodeWord || !recordingRef.current) {
      console.log('[SOS] Skipping processing - missing requirements');
      return;
    }

    try {
      const uri = await stopRecording(recordingRef.current);
      recordingRef.current = null;

      // Transcribe audio
      const result = await transcribeAudio(uri);

      if (result.text) {
        // Check for code word
        const detection = detectSOSCodeWord(result.text, user.sosCodeWord);

        if (detection.detected) {
          console.log('[SOS] Code word detected:', detection.matchedWord);
          await triggerSOS('code_word');
          stopVoiceDetection();
        }
      }
    } catch (err: any) {
      console.error('[SOS] Voice processing error:', err);
    }
  }, [user, triggerSOS]);

  const startVoiceDetection = useCallback(async () => {
    if (!user?.sosCodeWord) {
      setError('No SOS code word set');
      return;
    }

    try {
      setIsListening(true);
      setError(null);

      // Start periodic recording
      const recordAndProcess = async () => {
        if (!isListening) return;

        try {
          // Start recording
          recordingRef.current = await startRecording();

          // Record for a short period
          await new Promise((resolve) => setTimeout(resolve, 3000));

          // Process the recording
          await processVoiceRecording();
        } catch (err) {
          console.error('[SOS] Recording error:', err);
        }
      };

      // Initial recording
      await recordAndProcess();

      // Set up interval for continuous listening
      intervalRef.current = setInterval(recordAndProcess, voiceDetectionInterval);
    } catch (err: any) {
      setError(err.message || 'Failed to start voice detection');
      setIsListening(false);
    }
  }, [user, voiceDetectionInterval, processVoiceRecording]);

  const stopVoiceDetection = useCallback(() => {
    setIsListening(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync().catch(console.error);
      recordingRef.current = null;
    }
  }, []);

  return {
    isSOSActive,
    isListening,
    triggerSOS,
    cancelSOS,
    resolveSOS,
    startVoiceDetection,
    stopVoiceDetection,
    error,
  };
};

// Hook for check-in based SOS escalation
export const useCheckInMonitor = () => {
  const { user } = useAuthStore();
  const { triggerSOS } = useSOSStore();

  const handleMissedCheckIn = useCallback(
    async (missedCount: number) => {
      if (!user) return;

      // Auto-escalate after 2 missed check-ins if enabled
      if (user.settings.autoEscalate && missedCount >= 2) {
        console.log('[SOS] Auto-escalating due to missed check-ins');
        await triggerSOS('missed_checkin', user.id, user.emergencyContacts);
      }
    },
    [user, triggerSOS]
  );

  return { handleMissedCheckIn };
};
