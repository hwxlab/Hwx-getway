import 'dotenv/config';
import { getApps, initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

let isInitialized = false;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;
let adminMessaging: Messaging | null = null;
let initializationError: string | null = null;

export function initFirebaseAdmin() {
  if (isInitialized) {
    return { adminDb, adminAuth, adminMessaging, isInitialized: true, error: null };
  }

  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();

  if (!rawJson) {
    initializationError = 'FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not defined.';
    return { adminDb: null, adminAuth: null, adminMessaging: null, isInitialized: false, error: initializationError };
  }

  try {
    let cleaned = rawJson;
    if (
      (cleaned.startsWith("'") && cleaned.endsWith("'")) ||
      (cleaned.startsWith('"') && cleaned.endsWith('"'))
    ) {
      cleaned = cleaned.slice(1, -1);
    }

    let serviceAccount: any;
    if (cleaned.startsWith('{')) {
      serviceAccount = JSON.parse(cleaned);
    } else {
      const decoded = Buffer.from(cleaned, 'base64').toString('utf-8');
      serviceAccount = JSON.parse(decoded);
    }

    // Ensure private_key has actual newlines
    if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id || serviceAccount.projectId,
      });
    }

    adminDb = getFirestore();
    adminAuth = getAuth();
    adminMessaging = getMessaging();
    isInitialized = true;
    initializationError = null;
    console.log('[Firebase Admin] Successfully initialized with project:', serviceAccount.project_id || 'configured-project');
  } catch (err) {
    initializationError = err instanceof Error ? err.message : String(err);
    console.error('[Firebase Admin] Initialization failed:', initializationError);
  }

  return { adminDb, adminAuth, adminMessaging, isInitialized, error: initializationError };
}

// Auto-run initialization on module load
export const adminServices = initFirebaseAdmin();
export { adminDb, adminAuth, adminMessaging, isInitialized, initializationError };
