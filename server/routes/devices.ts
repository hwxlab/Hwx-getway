/**
 * HWX Gateway - Android Device Management & Gateway Protocol Routes
 * Pairing sessions, Heartbeats, SIM synchronizations, and Job Dispatch
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { requireAuth, requireDeviceAuth, localDevices, localSims, localPairingSessions } from '../middleware/auth';
import { JobQueueManager } from '../queue';
import { adminDb } from '../firebaseAdmin';

const router = Router();

// Validation Schemas
const initiatePairingSchema = z.object({
  device_name: z.string().min(1, 'Device name is required').max(100),
});

const verifyPairingSchema = z.object({
  pairing_code: z.string().min(6).max(12),
  pairing_token: z.string().min(16),
  model: z.string().optional().default('Android Gateway Device'),
  android_version: z.string().optional().default('14.0'),
  app_version: z.string().optional().default('1.0.0'),
  sim_count: z.number().int().min(1).max(4).default(2),
  sims: z.array(z.object({
    sim_slot: z.number().int().min(1).max(4),
    carrier_name: z.string().default('Carrier'),
    phone_number: z.string().optional(),
    availability: z.enum([
      'Available',
      'No Network',
      'SIM Not Available',
      'Permission Denied',
      'Unknown',
      'Insufficient Balance',
    ]).default('Available'),
    network_status: z.string().default('LTE'),
    sms_permission: z.boolean().default(true),
  })).optional(),
});

const heartbeatSchema = z.object({
  battery_level: z.number().min(0).max(100).optional(),
  is_charging: z.boolean().optional(),
  sims: z.array(z.object({
    sim_slot: z.number().int().min(1).max(4),
    carrier_name: z.string(),
    phone_number: z.string().optional(),
    availability: z.enum([
      'Available',
      'No Network',
      'SIM Not Available',
      'Permission Denied',
      'Unknown',
      'Insufficient Balance',
    ]),
    network_status: z.string(),
    sms_permission: z.boolean(),
  })).optional(),
});

const updateFcmTokenSchema = z.object({
  fcm_token: z.string().min(10, 'FCM token must be at least 10 characters'),
});

const renameDeviceSchema = z.object({
  name: z.string().min(1).max(100),
});

const reportJobResultSchema = z.object({
  status: z.enum(['sent', 'failed', 'uncertain']),
  error_code: z.string().optional(),
  error_message: z.string().optional(),
});

/**
 * GET /v1/devices
 * List all devices registered to the authenticated account
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const accountId = req.user!.uid;

  const devicesList = Array.from(localDevices.values())
    .filter(d => d.accountId === accountId)
    .map(d => {
      // Find SIMs for this device
      const sims = Array.from(localSims.values()).filter(s => s.deviceId === d.deviceId);
      // Check online status: active in last 3 minutes
      const lastSeenMs = new Date(d.lastSeenAt).getTime();
      const isOnline = Date.now() - lastSeenMs < 3 * 60 * 1000;

      return {
        ...d,
        isOnline,
        sims,
      };
    });

  return res.json({
    success: true,
    devices: devicesList,
  });
});

/**
 * POST /v1/devices/pairing/initiate
 * Initiate device pairing session (QR Code & manual pairing code)
 */
router.post('/pairing/initiate', requireAuth, async (req: Request, res: Response) => {
  const accountId = req.user!.uid;
  const parseResult = initiatePairingSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: parseResult.error.issues[0]?.message || 'Invalid pairing initiation request',
      },
    });
  }

  const { device_name } = parseResult.data;
  const sessionId = 'pair_' + crypto.randomBytes(8).toString('hex');
  const pairingCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  const pairingToken = crypto.randomBytes(24).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString(); // 5 minutes

  const session = {
    sessionId,
    accountId,
    deviceName: device_name,
    pairingCode,
    pairingToken,
    expiresAt,
    status: 'pending' as const,
    createdAt: now.toISOString(),
  };

  localPairingSessions.set(sessionId, session);

  // Firestore sync if available
  if (adminDb) {
    try {
      await adminDb.collection('pairing_sessions').doc(sessionId).set(session);
    } catch (e) {
      console.error('[Device Pairing] Firestore error:', e);
    }
  }

  // QR Code JSON payload that the future Android Gateway scans
  const qrPayload = JSON.stringify({
    version: '1.0',
    type: 'hwx_pairing',
    session_id: sessionId,
    code: pairingCode,
    token: pairingToken,
    server_url: req.protocol + '://' + req.get('host'),
  });

  return res.status(201).json({
    success: true,
    session: {
      session_id: sessionId,
      device_name,
      pairing_code: pairingCode,
      pairing_token: pairingToken,
      expires_at: expiresAt,
      qr_payload: qrPayload,
    },
  });
});

/**
 * POST /v1/devices/pairing/verify
 * Verifies pairing code or QR token and registers Android device
 */
router.post('/pairing/verify', async (req: Request, res: Response) => {
  const parseResult = verifyPairingSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: parseResult.error.issues[0]?.message || 'Invalid pairing verification data',
      },
    });
  }

  const { pairing_code, pairing_token, model, android_version, app_version, sim_count, sims } = parseResult.data;

  // Search matching session
  const session = Array.from(localPairingSessions.values()).find(
    s => s.pairingCode === pairing_code && s.pairingToken === pairing_token && s.status === 'pending'
  );

  if (!session) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'PAIRING_CODE_INVALID',
        message: 'Pairing code or token is incorrect or has already been used.',
      },
    });
  }

  // Check expiration
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    session.status = 'expired';
    return res.status(400).json({
      success: false,
      error: {
        code: 'PAIRING_CODE_EXPIRED',
        message: 'This pairing session has expired. Please initiate a new pairing session on the dashboard.',
      },
    });
  }

  // Mark session paired
  session.status = 'paired';

  // Generate unique device ID & token
  const deviceId = 'dev_' + crypto.randomBytes(6).toString('hex');
  const rawDeviceToken = 'hwx_dev_' + crypto.randomBytes(24).toString('hex');
  const deviceTokenHash = crypto.createHash('sha256').update(rawDeviceToken).digest('hex');
  const nowStr = new Date().toISOString();

  const newDevice = {
    deviceId,
    accountId: session.accountId,
    name: session.deviceName,
    model,
    androidVersion: android_version,
    deviceTokenHash,
    smsPermissionGranted: true,
    simCount: sim_count,
    isOnline: true,
    lastSeenAt: nowStr,
    pairedAt: nowStr,
    appVersion: app_version,
    status: 'active' as const,
  };

  localDevices.set(deviceId, newDevice);

  // Register SIMs reported
  const simList = (sims && sims.length > 0) ? sims : [
    {
      sim_slot: 1,
      carrier_name: 'Jio 5G',
      phone_number: '+91 98765 43210',
      availability: 'Available' as const,
      network_status: 'LTE 4G',
      sms_permission: true,
    },
    {
      sim_slot: 2,
      carrier_name: 'Airtel',
      phone_number: undefined,
      availability: 'Available' as const,
      network_status: '5G NSA',
      sms_permission: true,
    },
  ];

  for (const s of simList) {
    const simId = `sim_${deviceId}_slot${s.sim_slot}`;
    localSims.set(simId, {
      simId,
      deviceId,
      accountId: session.accountId,
      simSlot: s.sim_slot,
      carrierName: s.carrier_name,
      phoneNumber: s.phone_number,
      availability: s.availability,
      networkStatus: s.network_status,
      smsPermission: s.sms_permission,
      lastHealthUpdateAt: nowStr,
    });
  }

  // Save to Firestore if available
  if (adminDb) {
    try {
      await adminDb.collection('devices').doc(deviceId).set(newDevice);
      for (const s of simList) {
        const simId = `sim_${deviceId}_slot${s.sim_slot}`;
        await adminDb.collection('sims').doc(simId).set(localSims.get(simId)!);
      }
    } catch (e) {
      console.error('[Device Register] Firestore error:', e);
    }
  }

  return res.status(201).json({
    success: true,
    device_id: deviceId,
    device_token: rawDeviceToken, // Given only once to Android Gateway on pairing!
    account_id: session.accountId,
    device_name: session.deviceName,
    message: 'Device successfully paired and registered.',
  });
});

/**
 * POST /v1/devices/:device_id/heartbeat
 * Android Gateway periodic heartbeat with battery & SIM telemetry
 */
router.post('/:device_id/heartbeat', requireDeviceAuth, async (req: Request, res: Response) => {
  const { device_id } = req.params;
  const parseResult = heartbeatSchema.safeParse(req.body);
  const device = localDevices.get(device_id);

  if (!device) {
    return res.status(404).json({ success: false, error: { code: 'DEVICE_NOT_FOUND', message: 'Device not found' } });
  }

  device.lastSeenAt = new Date().toISOString();
  device.isOnline = true;

  if (parseResult.success) {
    const { battery_level, is_charging, sims } = parseResult.data;
    if (sims && sims.length > 0) {
      for (const s of sims) {
        const simId = `sim_${device_id}_slot${s.sim_slot}`;
        localSims.set(simId, {
          simId,
          deviceId: device_id,
          accountId: device.accountId,
          simSlot: s.sim_slot,
          carrierName: s.carrier_name,
          phoneNumber: s.phone_number,
          availability: s.availability,
          networkStatus: s.network_status,
          smsPermission: s.sms_permission,
          lastHealthUpdateAt: new Date().toISOString(),
        });
      }
    }
  }

  return res.json({
    success: true,
    acknowledged_at: new Date().toISOString(),
  });
});

/**
 * POST /v1/devices/:device_id/fcm-token
 * Update FCM Token for push job dispatches
 */
router.post('/:device_id/fcm-token', requireDeviceAuth, async (req: Request, res: Response) => {
  const { device_id } = req.params;
  const parseResult = updateFcmTokenSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parseResult.error.issues[0]?.message || 'Invalid FCM token' },
    });
  }

  const device = localDevices.get(device_id);
  if (!device) {
    return res.status(404).json({ success: false, error: { code: 'DEVICE_NOT_FOUND', message: 'Device not found' } });
  }

  device.fcmToken = parseResult.data.fcm_token;
  return res.json({ success: true, message: 'FCM token registered successfully.' });
});

/**
 * PATCH /v1/devices/:device_id
 * Rename device
 */
router.patch('/:device_id', requireAuth, async (req: Request, res: Response) => {
  const accountId = req.user!.uid;
  const { device_id } = req.params;
  const parseResult = renameDeviceSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Name must be between 1 and 100 characters' },
    });
  }

  const device = localDevices.get(device_id);
  if (!device || device.accountId !== accountId) {
    return res.status(404).json({ success: false, error: { code: 'DEVICE_NOT_FOUND', message: 'Device not found' } });
  }

  device.name = parseResult.data.name;
  return res.json({ success: true, device });
});

/**
 * DELETE /v1/devices/:device_id
 * Remove / Revoke device
 */
router.delete('/:device_id', requireAuth, async (req: Request, res: Response) => {
  const accountId = req.user!.uid;
  const { device_id } = req.params;

  const device = localDevices.get(device_id);
  if (!device || device.accountId !== accountId) {
    return res.status(404).json({ success: false, error: { code: 'DEVICE_NOT_FOUND', message: 'Device not found' } });
  }

  localDevices.delete(device_id);
  // Remove associated SIMs
  for (const [simId, s] of localSims.entries()) {
    if (s.deviceId === device_id) {
      localSims.delete(simId);
    }
  }

  return res.json({ success: true, message: `Device ${device_id} and its credentials have been revoked.` });
});

/**
 * GET /v1/devices/:device_id/jobs/pending
 * Used by Android Gateway to pull next pending jobs with atomic lease claim
 */
router.get('/:device_id/jobs/pending', requireDeviceAuth, async (req: Request, res: Response) => {
  const { device_id } = req.params;
  const limit = Math.min(10, Math.max(1, parseInt(req.query.limit as string) || 5));

  try {
    const jobs = await JobQueueManager.claimPendingJobsForDevice(device_id, limit);
    return res.json({
      success: true,
      jobs: jobs.map(j => ({
        job_id: j.jobId,
        parent_bulk_job_id: j.parentBulkJobId || null,
        sim_slot: j.simSlot,
        recipient: j.recipient,
        message: j.message,
        priority: j.priority,
        lease_expires_at: j.leaseExpiresAt,
      })),
    });
  } catch (error) {
    console.error('[Device Gateway] Pending jobs claim error:', error);
    return res.status(500).json({ success: false, error: { code: 'FIRESTORE_ERROR', message: 'Failed to claim pending jobs' } });
  }
});

/**
 * POST /v1/devices/:device_id/jobs/:job_id/result
 * Android Gateway reports actual hardware transmission outcome
 */
router.post('/:device_id/jobs/:job_id/result', requireDeviceAuth, async (req: Request, res: Response) => {
  const { job_id } = req.params;
  const parseResult = reportJobResultSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Status must be sent, failed, or uncertain' },
    });
  }

  const { status, error_code, error_message } = parseResult.data;
  const updated = await JobQueueManager.reportJobResult(job_id, status, error_code, error_message);

  if (!updated) {
    return res.status(404).json({ success: false, error: { code: 'JOB_NOT_FOUND', message: 'Job not found' } });
  }

  return res.json({
    success: true,
    job_id,
    status: updated.status,
    completed_at: updated.completedAt,
  });
});

export default router;
