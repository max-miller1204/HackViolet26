import axios from 'axios';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

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
 */
export const transcribeAudio = async (audioUri: string): Promise<TranscriptionResult> => {
  if (isDemoMode) {
    return {
      text: 'I just had a margarita',
      confidence: 0.95,
    };
  }

  try {
    const formData = new FormData();

    if (Platform.OS === 'web') {
      // On web, we need to fetch the blob from the blob: URI
      console.log('Fetching blob from URI:', audioUri);
      const response = await fetch(audioUri);
      const blob = await response.blob();
      console.log('Audio Blob Size:', blob.size, 'Type:', blob.type);

      // If blob is too small, it's likely empty/failed
      if (blob.size < 100) {
        console.warn('Audio blob is too small, mostly likely recording failed or is empty.');
      }

      formData.append('file', blob, 'audio.webm'); // Web usually records as webm
      formData.append('model_id', 'scribble_1');
    } else {
      // Expo handles FormData differently on native - we need to pass an object with uri, type, and name
      // @ts-ignore
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a', // Expo High Quality preset uses m4a
        name: 'audio.m4a',
      });
      formData.append('model_id', 'scribble_1');
    }

    const response = await axios.post(
      `${ELEVENLABS_API_URL}/speech-to-text`,
      formData,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('Transcription success:', response.data);

    return {
      text: response.data.text,
      confidence: 0.9, // ElevenLabs doesn't always return confidence, defaulting to high
    };
  } catch (error) {
    console.error('ElevenLabs transcription error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Headers:', JSON.stringify(error.response?.headers, null, 2));
    }
    // Fallback to empty
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
    console.log('TTS Demo Mode - would speak:', text);
    return null;
  }

  try {
    const response = await axios.post(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        responseType: 'arraybuffer', // Crucial for receiving audio data
      }
    );

    // Save the audio file locally
    const fileUri = `${FileSystem.documentDirectory}speech_${Date.now()}.mp3`;
    const base64Audio = Buffer.from(response.data, 'binary').toString('base64');

    await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
      encoding: "base64",
    });

    return fileUri;
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
    // If the URI is null (demo mode or error), do nothing
    if (!audioUri) return;

    const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
    await sound.playAsync();

    // Clean up after playing
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        // Optional: Delete file after playing to save space
        // FileSystem.deleteAsync(audioUri, { idempotent: true });
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

// Web recorder storage
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

/**
 * Start voice recording for drink logging or SOS detection
 */
export const startRecording = async (): Promise<any> => {
  if (Platform.OS === 'web') {
    try {
      console.log('Requesting web microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.start();
      console.log('Web recording started');
      return mediaRecorder;
    } catch (err) {
      console.error('Failed to start web recording:', err);
      throw err;
    }
  }

  // Native (iOS/Android)
  try {
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    console.log('Native recording started');
    return recording;
  } catch (err) {
    console.error('Failed to start native recording:', err);
    throw err;
  }
};

/**
 * Stop recording and get the audio URI
 */
export const stopRecording = async (recording: any): Promise<string> => {
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      if (!mediaRecorder) {
        resolve('');
        return;
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('Web recording stopped, Blob URL:', audioUrl);
        resolve(audioUrl);
      };

      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      mediaRecorder = null;
    });
  }

  // Native
  try {
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    return recording.getURI() || '';
  } catch (err) {
    console.error('Failed to stop native recording:', err);
    return '';
  }
};
