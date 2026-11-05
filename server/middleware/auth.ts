/**
 * HWX Gateway - Authentication & Authorization Middleware
 * Supports Firebase ID Tokens, API Key Hashing, and Android Gateway Credentials
 */
import { Request, Response, NextFunction } from 'express';
import { adminAuth, adminDb } from '../firebaseAdmin';
import crypto from 'crypto';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  isApiKey?: boolean;
  apiKeyId?: string;
  scopes?: string[];
}

export interface AuthenticatedDevice {
  deviceId: string;
  accountId: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      device?: AuthenticatedDevice;
    }
  }
}

// In-memory API key hash cache
export const localApiKeys = new Map<string, {
  keyId: string;
  accountId: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  scopes: string[];
  status: 'active' | 'revoked';
  createdAt: string;
  lastUsedAt?: string;
  totalRequests: number;
}>();

// In-memory registered devices
export const localDevices = new Map<string, {
  deviceId: string;
  accountId: string;
  name: string;
  model: string;
  androidVersion: string;
  deviceTokenHash: string;
  fcmToken?: string;
  smsPermissionGranted: boolean;
  simCount: number;
  isOnline: boolean;
  lastSeenAt: string;
  pairedAt: string;
  status: 'active' | 'revoked' | 'suspended';
}>();

// In-memory SIMs
export const localSims = new Map<string, {
  simId: string;
  deviceId: string;
  accountId: string;
  simSlot: number;
  carrierName: string;
  phoneNumber?: string;
  availability: 'Available' | 'No Network' | 'SIM Not Available' | 'Permission Denied' | 'Unknown' | 'Insufficient Balance';
  networkStatus: string;
  smsPermission: boolean;
  lastHealthUpdateAt: string;
}>();

// In-memory Pairing Sessions
export const localPairingSessions = new Map<string, {
  sessionId: string;
  accountId: string;
  deviceName: string;
  pairingCode: string;
  pairingToken: string;
  expiresAt: string;
  status: 'pending' | 'paired' | 'expired';
  createdAt: string;
}>();

/**
 * Universal Auth: Accepts Firebase ID Token OR HWX API Key
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'] as string | undefined;

  // 1. Check API Key header
  const rawApiKey = apiKeyHeader || (authHeader?.startsWith('Bearer hwx_') ? authHeader.substring(7) : null);
  if (rawApiKey && rawApiKey.startsWith('hwx_')) {
    const keyHash = crypto.createHash('sha256').update(rawApiKey).digest('hex');
    
    // Look up in memory cache first
    let foundKey = Array.from(localApiKeys.values()).find(k => k.keyHash === keyHash && k.status === 'active');

    // Look up in Firestore if not in cache
    if (!foundKey && adminDb) {
      try {
        const snap = await adminDb.collection('api_keys').where('keyHash', '==', keyHash).where('status', '==', 'active').limit(1).get();
        if (!snap.empty) {
          foundKey = snap.docs[0].data() as any;
        }
      } catch (e) {
        console.error('[Auth] Firestore API key lookup error:', e);
      }
    }

    if (!foundKey) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'API_KEY_INVALID',
          message: 'The provided API key is invalid or has been revoked.',
        },
      });
    }

    // Update usage count and last used timestamp
    foundKey.totalRequests = (foundKey.totalRequests || 0) + 1;
    foundKey.lastUsedAt = new Date().toISOString();

    req.user = {
      uid: foundKey.accountId,
      isApiKey: true,
      apiKeyId: foundKey.keyId,
      scopes: foundKey.scopes,
    };
    return next();
  }

  // 2. Check Firebase ID Token
  if (authHeader?.startsWith('Bearer ')) {
    const idToken = authHeader.substring(7);
    if (!idToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Missing Bearer authentication token.',
        },
      });
    }

    if (adminAuth) {
      try {
        const decoded = await adminAuth.verifyIdToken(idToken);
        req.user = {
          uid: decoded.uid,
          email: decoded.email,
          isApiKey: false,
        };
        return next();
      } catch (err) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Firebase ID token is invalid or expired.',
          },
        });
      }
    } else {
      // Graceful fallback for preview if Admin SDK has not been linked with service account JSON
      try {
        const parts = idToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          req.user = {
            uid: payload.user_id || payload.sub || 'user_demo',
            email: payload.email,
            isApiKey: false,
          };
          return next();
        }
      } catch (e) {
        // Ignored
      }
      // Demo fallback user
      req.user = {
        uid: 'user_hwx_default',
        email: 'user@hwxgateway.internal',
        isApiKey: false,
      };
      return next();
    }
  }

  return res.status(401).json({
    success: false,
    error: {
      code: 'AUTH_REQUIRED',
      message: 'Authentication required. Provide an Authorization Bearer token or X-API-Key header.',
    },
  });
}

/**
 * Android Device Credential Authentication
 */
export async function requireDeviceAuth(req: Request, res: Response, next: NextFunction) {
  const deviceId = (req.headers['x-device-id'] || req.params.device_id) as string;
  const deviceToken = req.headers['x-device-token'] as string;

  if (!deviceId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'DEVICE_NOT_FOUND',
        message: 'Device ID must be provided in X-Device-Id header or URL parameter.',
      },
    });
  }

  const device = localDevices.get(deviceId);
  if (!device) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'DEVICE_NOT_FOUND',
        message: `Device ${deviceId} is not registered or was removed.`,
      },
    });
  }

  if (device.status !== 'active') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'PERMISSION_DENIED',
        message: 'This device credential has been revoked or suspended.',
      },
    });
  }

  // If token is provided, verify hash
  if (deviceToken && device.deviceTokenHash) {
    const tokenHash = crypto.createHash('sha256').update(deviceToken).digest('hex');
    if (tokenHash !== device.deviceTokenHash) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Device credential token verification failed.',
        },
      });
    }
  }

  // Update last seen
  device.lastSeenAt = new Date().toISOString();
  device.isOnline = true;

  req.device = {
    deviceId: device.deviceId,
    accountId: device.accountId,
  };

  return next();
}
