import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, isDemoMode } from './config';
import { User, EmergencyContact, UserSettings } from '../../types';

const DEFAULT_SETTINGS: UserSettings = {
  shareLocation: true,
  allowCheckIns: true,
  autoEscalate: false,
  darkMode: true,
};

// Demo user for hackathon testing
const DEMO_USER: User = {
  id: 'demo-user-123',
  email: 'demo@safenight.app',
  displayName: 'Demo User',
  weight: 140,
  gender: 'female',
  emergencyContacts: [
    {
      id: 'ec-1',
      name: 'Mom',
      phone: '+1234567890',
      relationship: 'mother',
    },
    {
      id: 'ec-2',
      name: 'Best Friend',
      phone: '+1987654321',
      relationship: 'friend',
    },
  ],
  sosCodeWord: 'pineapple',
  settings: DEFAULT_SETTINGS,
  createdAt: new Date(),
};

export const signUp = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  if (isDemoMode) {
    // Demo mode - return mock user
    return { ...DEMO_USER, email, displayName };
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // Update display name
  await updateProfile(firebaseUser, { displayName });

  // Create user document in Firestore
  const user: User = {
    id: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName,
    emergencyContacts: [],
    settings: DEFAULT_SETTINGS,
    createdAt: new Date(),
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), user);

  return user;
};

export const signIn = async (email: string, password: string): Promise<User> => {
  if (isDemoMode) {
    // Demo mode - return mock user
    return { ...DEMO_USER, email };
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // Fetch user document
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  if (userDoc.exists()) {
    return userDoc.data() as User;
  }

  // If no user document exists, create one
  const user: User = {
    id: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName || 'User',
    emergencyContacts: [],
    settings: DEFAULT_SETTINGS,
    createdAt: new Date(),
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), user);
  return user;
};

export const signOut = async (): Promise<void> => {
  if (isDemoMode) {
    return;
  }
  await firebaseSignOut(auth);
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const subscribeToAuthChanges = (
  callback: (user: FirebaseUser | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<User>
): Promise<void> => {
  if (isDemoMode) {
    return;
  }
  await setDoc(doc(db, 'users', userId), updates, { merge: true });
};

export const addEmergencyContact = async (
  userId: string,
  contact: EmergencyContact
): Promise<void> => {
  if (isDemoMode) {
    return;
  }

  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    const userData = userDoc.data() as User;
    const contacts = [...userData.emergencyContacts, contact];
    await setDoc(doc(db, 'users', userId), { emergencyContacts: contacts }, { merge: true });
  }
};

export const getDemoUser = (): User => DEMO_USER;
