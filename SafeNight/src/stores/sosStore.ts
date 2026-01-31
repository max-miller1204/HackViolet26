import { create } from 'zustand';
import { SOSEvent, SOSTrigger, EmergencyContact } from '../types';
import { logSOSEvent, verifyEvent, formatBlockchainInfo } from '../services/api/solana';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';

interface SOSState {
  isSOSActive: boolean;
  currentSOS: SOSEvent | null;
  sosHistory: SOSEvent[];
  isLoading: boolean;
  error: string | null;

  // Actions
  triggerSOS: (
    trigger: SOSTrigger,
    userId: string,
    emergencyContacts: EmergencyContact[]
  ) => Promise<SOSEvent>;
  resolveSOS: (sosId: string, resolution: 'resolved' | 'false_alarm') => Promise<void>;
  cancelSOS: () => void;
  getSOSHistory: (userId: string) => SOSEvent[];
  clearError: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useSOSStore = create<SOSState>((set, get) => ({
  isSOSActive: false,
  currentSOS: null,
  sosHistory: [],
  isLoading: false,
  error: null,

  triggerSOS: async (trigger, userId, emergencyContacts) => {
    set({ isLoading: true, error: null });

    try {
      // Get current location
      let location: SOSEvent['location'] | undefined;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          // Try to get address
          let address: string | undefined;
          try {
            const [geocoded] = await Location.reverseGeocodeAsync({
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            });
            if (geocoded) {
              address = `${geocoded.street || ''} ${geocoded.city || ''}, ${geocoded.region || ''}`.trim();
            }
          } catch {
            // Address lookup failed, continue without it
          }

          location = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            address,
          };
        }
      } catch {
        // Location failed, continue without it
        console.warn('Could not get location for SOS');
      }

      // Create SOS event
      const sosEvent: Omit<SOSEvent, 'blockchainHash' | 'blockchainSignature'> = {
        id: generateId(),
        userId,
        trigger,
        location,
        status: 'active',
        contactsNotified: emergencyContacts.map((c) => c.id),
        createdAt: new Date(),
      };

      // Log to blockchain (demo)
      const blockchainResult = await logSOSEvent(sosEvent);

      const fullSOS: SOSEvent = {
        ...sosEvent,
        blockchainHash: blockchainResult.hash,
        blockchainSignature: blockchainResult.signature,
      };

      set({
        isSOSActive: true,
        currentSOS: fullSOS,
        sosHistory: [...get().sosHistory, fullSOS],
        isLoading: false,
      });

      // Notify emergency contacts (via SMS link)
      await notifyContacts(emergencyContacts, location);

      return fullSOS;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to trigger SOS',
        isLoading: false,
      });
      throw error;
    }
  },

  resolveSOS: async (sosId, resolution) => {
    set({ isLoading: true });

    try {
      const updateSOS = (sos: SOSEvent): SOSEvent => ({
        ...sos,
        status: resolution,
        resolvedAt: new Date(),
      });

      set((state) => ({
        isSOSActive: false,
        currentSOS: null,
        sosHistory: state.sosHistory.map((s) =>
          s.id === sosId ? updateSOS(s) : s
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to resolve SOS',
        isLoading: false,
      });
    }
  },

  cancelSOS: () => {
    const { currentSOS } = get();
    if (currentSOS) {
      set((state) => ({
        isSOSActive: false,
        currentSOS: null,
        sosHistory: state.sosHistory.map((s) =>
          s.id === currentSOS.id
            ? { ...s, status: 'false_alarm', resolvedAt: new Date() }
            : s
        ),
      }));
    }
  },

  getSOSHistory: (userId) => {
    return get().sosHistory.filter((s) => s.userId === userId);
  },

  clearError: () => set({ error: null }),
}));

// Helper to notify contacts via SMS
async function notifyContacts(
  contacts: EmergencyContact[],
  location?: SOSEvent['location']
): Promise<void> {
  const locationText = location
    ? `\n\nLocation: ${location.address || `${location.latitude}, ${location.longitude}`}\n\nGoogle Maps: https://maps.google.com/?q=${location.latitude},${location.longitude}`
    : '';

  const message = `EMERGENCY ALERT from SafeNight!\n\nYour contact has triggered an SOS alert and may need help.${locationText}\n\nPlease try to reach them immediately.`;

  // Open SMS to first contact (in production would send to all)
  if (contacts.length > 0) {
    const smsUrl = `sms:${contacts[0].phone}?body=${encodeURIComponent(message)}`;

    try {
      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
      }
    } catch {
      console.warn('Could not open SMS');
    }
  }
}

// Export helper for getting blockchain verification
export const verifySOSEvent = async (signature: string) => {
  return await verifyEvent(signature);
};

export const getSOSBlockchainInfo = (sos: SOSEvent): string => {
  if (!sos.blockchainHash || !sos.blockchainSignature) {
    return 'Not logged to blockchain';
  }

  return formatBlockchainInfo({
    hash: sos.blockchainHash,
    signature: sos.blockchainSignature,
    timestamp: sos.createdAt.getTime(),
    slot: 0, // Would be stored with the event in production
  });
};
