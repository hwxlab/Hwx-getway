/**
 * HWX Gateway - API Key Management Routes
 * Cryptographically secure key generation, SHA-256 hashing, and zero-raw-storage
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { requireAuth, localApiKeys } from '../middleware/auth';
import { adminDb } from '../firebaseAdmin';

const router = Router();

const createKeySchema = z.object({
  name: z.string().min(1, 'Key name is required').max(100),
  scopes: z.array(z.string()).optional().default(['sms:send', 'sms:bulk', 'sms:read']),
});

/**
 * GET /v1/keys
 * List active & revoked API keys (Metadata only, never raw keys or hashes)
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const accountId = req.user!.uid;

  const keys = Array.from(localApiKeys.values())
    .filter(k => k.accountId === accountId)
    .map(k => ({
      key_id: k.keyId,
      name: k.name,
      key_prefix: k.keyPrefix,
      scopes: k.scopes,
      status: k.status,
      created_at: k.createdAt,
      last_used_at: k.lastUsedAt || null,
      total_requests: k.totalRequests || 0,
    }));

  return res.json({
    success: true,
    keys,
  });
});

/**
 * POST /v1/keys
 * Generate cryptographically secure API key
 * Returns the raw plaintext key ONCE. Only SHA-256 hash is saved.
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const accountId = req.user!.uid;
  const parseResult = createKeySchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: parseResult.error.issues[0]?.message || 'Invalid key creation payload',
      },
    });
  }

  const { name, scopes } = parseResult.data;

  // Generate 32 bytes of secure random bytes
  const secret = crypto.randomBytes(24).toString('base64url');
  const rawApiKey = `hwx_live_${secret}`;
  const keyPrefix = `hwx_live_${secret.substring(0, 6)}...`;
  const keyHash = crypto.createHash('sha256').update(rawApiKey).digest('hex');
  const keyId = 'key_' + crypto.randomBytes(8).toString('hex');
  const now = new Date().toISOString();

  const keyRecord = {
    keyId,
    accountId,
    name,
    keyPrefix,
    keyHash,
    scopes,
    status: 'active' as const,
    createdAt: now,
    totalRequests: 0,
  };

  localApiKeys.set(keyId, keyRecord);

  // Firestore sync if available
  if (adminDb) {
    try {
      await adminDb.collection('api_keys').doc(keyId).set(keyRecord);
    } catch (e) {
      console.error('[API Keys] Firestore error:', e);
    }
  }

  return res.status(201).json({
    success: true,
    key_id: keyId,
    name,
    key_prefix: keyPrefix,
    api_key: rawApiKey, // DISPLAYED ONCE ONLY TO USER
    created_at: now,
    warning: 'Save this API key now. You will not be able to view it again.',
  });
});

/**
 * DELETE /v1/keys/:key_id
 * Revoke an API key
 */
router.delete('/:key_id', requireAuth, async (req: Request, res: Response) => {
  const accountId = req.user!.uid;
  const { key_id } = req.params;

  const keyRecord = localApiKeys.get(key_id);
  if (!keyRecord || keyRecord.accountId !== accountId) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'API_KEY_INVALID',
        message: 'API Key not found or access denied.',
      },
    });
  }

  keyRecord.status = 'revoked';

  if (adminDb) {
    try {
      await adminDb.collection('api_keys').doc(key_id).update({ status: 'revoked' });
    } catch (e) {
      console.error('[API Keys] Firestore error revoking key:', e);
    }
  }

  return res.json({
    success: true,
    message: `API Key '${keyRecord.name}' has been permanently revoked.`,
  });
});

export default router;
