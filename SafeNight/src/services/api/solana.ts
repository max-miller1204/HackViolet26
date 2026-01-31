import { SOSEvent } from '../../types';

// Demo mode for hackathon - simulates Solana blockchain logging
// In production, this would use actual Solana Web3.js

interface BlockchainLogResult {
  hash: string;
  signature: string;
  timestamp: number;
  slot: number;
}

interface VerificationResult {
  verified: boolean;
  event?: {
    type: string;
    timestamp: number;
    data: Record<string, unknown>;
  };
}

/**
 * Generate a mock Solana-like hash
 */
const generateMockHash = (): string => {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let hash = '';
  for (let i = 0; i < 44; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
};

/**
 * Generate a mock Solana signature
 */
const generateMockSignature = (): string => {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let sig = '';
  for (let i = 0; i < 88; i++) {
    sig += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return sig;
};

/**
 * Log an SOS event to the blockchain (demo mode)
 * In production, this would create an actual Solana transaction
 */
export const logSOSEvent = async (event: Omit<SOSEvent, 'blockchainHash' | 'blockchainSignature'>): Promise<BlockchainLogResult> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const result: BlockchainLogResult = {
    hash: generateMockHash(),
    signature: generateMockSignature(),
    timestamp: Date.now(),
    slot: Math.floor(Math.random() * 1000000) + 200000000, // Mock slot number
  };

  // In demo mode, we store the event locally for verification
  // In production, this would be stored on-chain
  const eventLog = {
    ...event,
    blockchainHash: result.hash,
    blockchainSignature: result.signature,
    loggedAt: result.timestamp,
  };

  // Store in local storage for demo purposes
  try {
    const existingLogs = await getStoredLogs();
    existingLogs.push(eventLog);
    await storeLogsLocally(existingLogs);
  } catch (error) {
    console.error('Failed to store event log:', error);
  }

  console.log('[Solana Demo] SOS Event logged:', {
    eventId: event.id,
    hash: result.hash,
    signature: result.signature,
  });

  return result;
};

/**
 * Verify an event was logged on the blockchain (demo mode)
 */
export const verifyEvent = async (signature: string): Promise<VerificationResult> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // In demo mode, check local storage
  const logs = await getStoredLogs();
  const foundLog = logs.find((log: any) => log.blockchainSignature === signature);

  if (foundLog) {
    return {
      verified: true,
      event: {
        type: 'SOS_EVENT',
        timestamp: foundLog.loggedAt,
        data: {
          id: foundLog.id,
          trigger: foundLog.trigger,
          status: foundLog.status,
        },
      },
    };
  }

  return { verified: false };
};

/**
 * Get all logged SOS events (demo mode)
 */
export const getEventHistory = async (userId: string): Promise<any[]> => {
  const logs = await getStoredLogs();
  return logs.filter((log: any) => log.userId === userId);
};

/**
 * Get blockchain explorer URL for an event (demo mode)
 * In production, this would link to Solana Explorer
 */
export const getExplorerUrl = (signature: string): string => {
  // For demo, we create a fake but realistic-looking URL
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
};

// Local storage helpers for demo mode
const STORAGE_KEY = 'safenight_blockchain_logs';

const getStoredLogs = async (): Promise<any[]> => {
  try {
    // Using a simple in-memory store for React Native
    // In production, this would use SecureStore or AsyncStorage
    if (typeof global !== 'undefined' && (global as any).__sosLogs) {
      return (global as any).__sosLogs;
    }
    return [];
  } catch {
    return [];
  }
};

const storeLogsLocally = async (logs: any[]): Promise<void> => {
  try {
    if (typeof global !== 'undefined') {
      (global as any).__sosLogs = logs;
    }
  } catch (error) {
    console.error('Failed to store logs:', error);
  }
};

/**
 * Format blockchain info for display
 */
export const formatBlockchainInfo = (result: BlockchainLogResult): string => {
  return `
Transaction Hash: ${result.hash.substring(0, 8)}...${result.hash.substring(result.hash.length - 8)}
Signature: ${result.signature.substring(0, 8)}...${result.signature.substring(result.signature.length - 8)}
Slot: ${result.slot.toLocaleString()}
Time: ${new Date(result.timestamp).toLocaleString()}
  `.trim();
};
