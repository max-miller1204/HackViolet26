import { useState, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import { useDrinkStore, quickLogDrink } from '../stores/drinkStore';
import { useAuthStore } from '../stores/authStore';
import { usePlanStore } from '../stores/planStore';
import { transcribeAudio, startRecording, stopRecording } from '../services/api/elevenlabs';
import { Drink, BACEstimate } from '../types';
import { STANDARD_DRINKS, formatBAC, formatTimeToSober, getBACColor } from '../utils/bac-calculator';

interface UseDrinkTrackerReturn {
  // State
  drinks: Drink[];
  todaysDrinks: Drink[];
  currentBAC: BACEstimate | null;
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;

  // Actions
  logDrinkByVoice: () => Promise<void>;
  logDrinkByText: (description: string) => Promise<Drink>;
  logQuickDrink: (type: keyof typeof STANDARD_DRINKS) => void;
  removeDrink: (drinkId: string) => void;
  clearAllDrinks: () => void;

  // Formatters
  formatBAC: (bac: number) => string;
  formatTimeToSober: (minutes: number) => string;
  getBACColor: (bac: number) => string;

  // Recording controls
  startVoiceRecording: () => Promise<void>;
  stopVoiceRecording: () => Promise<string>;
  cancelVoiceRecording: () => void;
}

export const useDrinkTracker = (): UseDrinkTrackerReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const {
    drinks,
    currentBAC,
    logDrinkFromText,
    logDrink,
    removeDrink: storeRemoveDrink,
    clearDrinks,
    getTodaysDrinks,
    recalculateBAC,
    setUserProfile,
  } = useDrinkStore();

  const { user } = useAuthStore();
  const { currentPlan } = usePlanStore();

  // Update user profile in drink store when it changes
  useEffect(() => {
    if (user) {
      setUserProfile(user.weight || 140, user.gender || 'female');
    }
  }, [user?.weight, user?.gender, setUserProfile]);

  // Recalculate BAC periodically (metabolism)
  useEffect(() => {
    const interval = setInterval(() => {
      recalculateBAC();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [recalculateBAC]);

  const startVoiceRecording = useCallback(async () => {
    try {
      setError(null);
      const newRecording = await startRecording();
      setRecording(newRecording);
      setIsRecording(true);
    } catch (err: any) {
      setError(err.message || 'Failed to start recording');
    }
  }, []);

  const stopVoiceRecording = useCallback(async (): Promise<string> => {
    if (!recording) return '';

    try {
      const uri = await stopRecording(recording);
      setRecording(null);
      setIsRecording(false);
      return uri;
    } catch (err: any) {
      setError(err.message || 'Failed to stop recording');
      setIsRecording(false);
      return '';
    }
  }, [recording]);

  const cancelVoiceRecording = useCallback(() => {
    if (recording) {
      recording.stopAndUnloadAsync().catch(console.error);
      setRecording(null);
    }
    setIsRecording(false);
  }, [recording]);

  const logDrinkByVoice = useCallback(async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Start recording
      await startVoiceRecording();

      // Record for 3 seconds
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Stop and get audio
      const audioUri = await stopVoiceRecording();
      if (!audioUri) {
        throw new Error('No audio recorded');
      }

      // Transcribe
      const transcription = await transcribeAudio(audioUri);
      if (!transcription.text) {
        throw new Error('Could not transcribe audio');
      }

      // Log the drink
      await logDrinkFromText(transcription.text, user.id, currentPlan?.id);
    } catch (err: any) {
      setError(err.message || 'Failed to log drink by voice');
    } finally {
      setIsProcessing(false);
    }
  }, [user, currentPlan, startVoiceRecording, stopVoiceRecording, logDrinkFromText]);

  const logDrinkByText = useCallback(
    async (description: string): Promise<Drink> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      setIsProcessing(true);
      setError(null);

      try {
        const drink = await logDrinkFromText(description, user.id, currentPlan?.id);
        return drink;
      } catch (err: any) {
        setError(err.message || 'Failed to log drink');
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [user, currentPlan, logDrinkFromText]
  );

  const logQuickDrink = useCallback(
    (type: keyof typeof STANDARD_DRINKS) => {
      if (!user) return;

      const drink = quickLogDrink(type, user.id, currentPlan?.id);
      logDrink(drink);
    },
    [user, currentPlan, logDrink]
  );

  const removeDrink = useCallback(
    (drinkId: string) => {
      storeRemoveDrink(drinkId);
    },
    [storeRemoveDrink]
  );

  const clearAllDrinks = useCallback(() => {
    clearDrinks();
  }, [clearDrinks]);

  return {
    drinks,
    todaysDrinks: getTodaysDrinks(),
    currentBAC,
    isRecording,
    isProcessing,
    error,

    logDrinkByVoice,
    logDrinkByText,
    logQuickDrink,
    removeDrink,
    clearAllDrinks,

    formatBAC,
    formatTimeToSober,
    getBACColor,

    startVoiceRecording,
    stopVoiceRecording,
    cancelVoiceRecording,
  };
};
