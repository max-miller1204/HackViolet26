import axios from 'axios';
import { Audio } from 'expo-av';

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

const isDemoMode = !ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === 'your_elevenlabs_api_key_here';

// Default voice ID (Rachel - warm, friendly female voice)
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

export interface TranscriptionResult {
  text: string;
  confidence: number;
}

export interface SOSCodeWordResult {
  detected: boolean;
  confidence: number;
  matchedWord?: string;
}

/**
 * Transcribe audio to text using ElevenLabs Speech-to-Text
 * Note: For hackathon, we'll use a simpler approach with demo mode
 */
export const transcribeAudio = async (audioUri: string): Promise<TranscriptionResult> => {
  if (isDemoMode) {
    // Demo mode - return mock transcription
    return {
      text: 'I just had a margarita',
      confidence: 0.95,
    };
  }

  try {
    // For hackathon demo, we return mock data
    // In production, this would use actual ElevenLabs API
    console.log('ElevenLabs: Would transcribe audio from:', audioUri);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      text: 'I just had a margarita',
      confidence: 0.9,
    };
  } catch (error) {
    console.error('ElevenLabs transcription error:', error);
    return { text: '', confidence: 0 };
  }
};

/**
 * Synthesize speech from text using ElevenLabs TTS
 */
export const synthesizeSpeech = async (
  text: string,
  voiceId: string = DEFAULT_VOICE_ID
): Promise<string | null> => {
  if (isDemoMode) {
    // Demo mode - return null (no audio)
    console.log('TTS Demo Mode - would speak:', text);
    return null;
  }

  try {
    // For hackathon demo, we log the text that would be spoken
    // In production, this would use actual ElevenLabs TTS API
    console.log('ElevenLabs TTS: Would speak:', text);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Return null since we don't have actual audio in demo mode
    return null;
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    return null;
  }
};

/**
 * Play synthesized speech
 */
export const playSpeech = async (audioUri: string): Promise<void> => {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
    await sound.playAsync();

    // Clean up after playing
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.error('Audio playback error:', error);
  }
};

/**
 * Detect SOS code word in transcription
 */
export const detectSOSCodeWord = (
  transcription: string,
  codeWord: string
): SOSCodeWordResult => {
  const normalizedTranscription = transcription.toLowerCase().trim();
  const normalizedCodeWord = codeWord.toLowerCase().trim();

  // Exact match
  if (normalizedTranscription.includes(normalizedCodeWord)) {
    return {
      detected: true,
      confidence: 1.0,
      matchedWord: codeWord,
    };
  }

  // Fuzzy match - check for similar sounding words
  // This is a simple implementation; could use Levenshtein distance for better matching
  const words = normalizedTranscription.split(/\s+/);
  for (const word of words) {
    const similarity = calculateSimilarity(word, normalizedCodeWord);
    if (similarity > 0.8) {
      return {
        detected: true,
        confidence: similarity,
        matchedWord: word,
      };
    }
  }

  return {
    detected: false,
    confidence: 0,
  };
};

/**
 * Simple string similarity calculation (Dice coefficient)
 */
const calculateSimilarity = (str1: string, str2: string): number => {
  if (str1 === str2) return 1;
  if (str1.length < 2 || str2.length < 2) return 0;

  const bigrams1 = new Set<string>();
  const bigrams2 = new Set<string>();

  for (let i = 0; i < str1.length - 1; i++) {
    bigrams1.add(str1.substring(i, i + 2));
  }

  for (let i = 0; i < str2.length - 1; i++) {
    bigrams2.add(str2.substring(i, i + 2));
  }

  let intersection = 0;
  bigrams1.forEach((bigram) => {
    if (bigrams2.has(bigram)) intersection++;
  });

  return (2 * intersection) / (bigrams1.size + bigrams2.size);
};

/**
 * Start voice recording for drink logging or SOS detection
 */
export const startRecording = async (): Promise<Audio.Recording> => {
  await Audio.requestPermissionsAsync();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );

  return recording;
};

/**
 * Stop recording and get the audio URI
 */
export const stopRecording = async (recording: Audio.Recording): Promise<string> => {
  await recording.stopAndUnloadAsync();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
  });

  return recording.getURI() || '';
};
