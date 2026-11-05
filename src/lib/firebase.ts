/**
 * HWX Gateway - Client Firebase Integration
 * Real Firestore & Firebase Authentication
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_FIREBASE_WEB_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_FIREBASE_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_FIREBASE_WEB_APP_ID",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "YOUR_FIREBASE_MEASUREMENT_ID",
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Provider
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Standard Firestore error handler per Firebase Integration Skill specification
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate Firestore server connectivity on boot
 */
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore connection check: client is offline or network is throttled.");
    }
    return false;
  }
}

// Authentication Actions
export async function signInWithGoogle() {
  return await signInWithPopup(auth, googleProvider);
}

export async function loginWithEmail(email: string, pass: string) {
  return await signInWithEmailAndPassword(auth, email, pass);
}

export async function signupWithEmail(email: string, pass: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  try {
    await sendEmailVerification(cred.user);
  } catch (e) {
    console.warn("Could not send email verification immediately:", e);
  }
  return cred;
}

export async function sendResetEmail(email: string) {
  return await sendPasswordResetEmail(auth, email);
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  getIdToken: () => Promise<string>;
}

const LOCAL_DEMO_KEY = 'hwx_demo_user';

export function getLocalDemoUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_DEMO_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      ...data,
      getIdToken: async () => 'demo_bearer_token_' + data.uid,
    };
  } catch (e) {
    return null;
  }
}

export function setLocalDemoUser(user: { uid: string; email: string; displayName: string } | null) {
  if (!user) {
    localStorage.removeItem(LOCAL_DEMO_KEY);
  } else {
    localStorage.setItem(LOCAL_DEMO_KEY, JSON.stringify({
      ...user,
      emailVerified: true,
    }));
  }
}

export async function logoutUser() {
  setLocalDemoUser(null);
  return await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | AppUser | null) => void) {
  // Check local demo session first
  const demoUser = getLocalDemoUser();
  if (demoUser && !auth.currentUser) {
    callback(demoUser);
  }

  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      setLocalDemoUser(null);
      callback(firebaseUser);
    } else {
      const demo = getLocalDemoUser();
      callback(demo || null);
    }
  });
}
