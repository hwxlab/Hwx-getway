/**
 * HWX Gateway - SMS Routing API (Single, Bulk, Status & Logs)
 * Strict validation with Zod, priority queue dispatch, and status tracking
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';
import { JobQueueManager, localJobs, localBulkJobs, localLogs } from '../queue';
import { localDevices, localSims } from '../middleware/auth';

const router = Router();

// Zod schemas
const singleSmsSchema = z.object({
  device_id: z.string().min(1, 'device_id is required'),
  sim_slot: z.number().int().min(1).max(2, 'sim_slot must be 1 or 2'),
  to: z.string().min(4, 'Recipient phone number is too short').max(20, 'Recipient phone number is too long'),
  message: z.string().min(1, 'Message cannot be empty').max(1600, 'Message cannot exceed 1600 characters'),
});

const bulkSmsSchema = z.object({
  device_id: z.string().min(1, 'device_id is required'),
  sim_slot: z.number().int().min(1).max(2, 'sim_slot must be 1 or 2'),
  recipients: z.array(z.string().min(4).max(20)).min(1, 'At least 1 recipient is required').max(1000, 'Maximum 1000 recipients per bulk request'),
  message: z.string().min(1, 'Message cannot be empty').max(1600, 'Message cannot exceed 1600 characters'),
});

const bulkStatusQuerySchema = z.object({
  job_ids: z.array(z.string()).min(1).max(100),
});

/**
 * POST /v1/sms/send
 * Dispatches a high-priority single SMS
 */
router.post('/send', requireAuth, rateLimiter(120), async (req: Request, res: Response) => {
  const accountId = req.user!.uid;

  // 1. Validate payload
  const parseResult = singleSmsSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: parseResult.error.issues[0]?.message || 'Invalid SMS payload',
        details: parseResult.error.format(),
      },
    });
  }

  const { device_id, sim_slot, to, message } = parseResult.data;

  // 2. Verify device existence and account ownership
  const device = localDevices.get(device_id);
  if (!device || device.accountId !== accountId) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'DEVICE_NOT_FOUND',
        message: `Device '${device_id}' was not found in your account.`,
      },
    });
  }

  // 3. Verify device status
  if (device.status !== 'active') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'DEVICE_OFFLINE',
        message: `Device '${device.name}' is currently revoked or suspended.`,
      },
    });
  }

  // 4. Verify SIM slot
  const sim = Array.from(localSims.values()).find(
    s => s.deviceId === device_id && s.simSlot === sim_slot && s.accountId === accountId
  );
  if (sim && (sim.availability === 'SIM Not Available' || sim.availability === 'No Network')) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'SIM_NOT_AVAILABLE',
        message: `SIM in slot ${sim_slot} is reported as '${sim.availability}'.`,
      },
    });
  }

  // 5. Enqueue single SMS into High Priority Queue
  try {
    const job = await JobQueueManager.enqueueSingle({
      accountId,
      deviceId: device_id,
      simSlot: sim_slot,
      recipient: to,
      message,
      priority: 'high',
    });

    // 6. Notify device via FCM if token exists
    if (device.fcmToken) {
      JobQueueManager.notifyDeviceFCM(device.fcmToken, job.jobId).catch(() => {});
    }

    return res.status(202).json({
      success: true,
      job_id: job.jobId,
      status: job.status,
      created_at: job.createdAt,
    });
  } catch (error) {
    console.error('[SMS API] Send failure:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'FIRESTORE_ERROR',
        message: 'Failed to queue SMS job. Please try again.',
      },
    });
  }
});

/**
 * POST /v1/sms/bulk
 * Dispatches a bulk SMS job (Parent Bulk Job + Child Jobs)
 */
router.post('/bulk', requireAuth, rateLimiter(30), async (req: Request, res: Response) => {
  const accountId = req.user!.uid;

  // 1. Validate payload
  const parseResult = bulkSmsSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: parseResult.error.issues[0]?.message || 'Invalid Bulk SMS payload',
        details: parseResult.error.format(),
      },
    });
  }

  const { device_id, sim_slot, recipients, message } = parseResult.data;

  // 2. Deduplicate recipients to avoid accidental duplicates
  const uniqueRecipients = Array.from(new Set(recipients));

  // 3. Verify device
  const device = localDevices.get(device_id);
  if (!device || device.accountId !== accountId) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'DEVICE_NOT_FOUND',
        message: `Device '${device_id}' was not found in your account.`,
      },
    });
  }

  // 4. Enqueue Bulk
  try {
    const { bulkJob, childJobs } = await JobQueueManager.enqueueBulk(
      accountId,
      device_id,
      sim_slot,
      uniqueRecipients,
      message
    );

    // Notify device via FCM
    if (device.fcmToken && childJobs[0]) {
      JobQueueManager.notifyDeviceFCM(device.fcmToken, childJobs[0].jobId).catch(() => {});
    }

    return res.status(202).json({
      success: true,
      bulk_job_id: bulkJob.bulkJobId,
      total_recipients: bulkJob.totalRecipients,
      queued_count: bulkJob.queuedCount,
      status: bulkJob.overallStatus,
      created_at: bulkJob.createdAt,
    });
  } catch (error) {
    console.error('[SMS API] Bulk dispatch failure:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'QUEUE_OVERLOADED',
        message: 'Could not process bulk batch. Backend queue is at capacity.',
      },
    });
  }
});

/**
 * GET /v1/sms/status/:job_id
 * Returns current status of single or child SMS job
 */
router.get('/status/:job_id', requireAuth, async (req: Request, res: Response) => {
  const accountId = req.user!.uid;
  const { job_id } = req.params;

  const job = localJobs.get(job_id);
  if (!job || job.accountId !== accountId) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'JOB_NOT_FOUND',
        message: `SMS job '${job_id}' does not exist or you do not have permission to view it.`,
      },
    });
  }

  return res.json({
    success: true,
    job: {
      job_id: job.jobId,
      parent_bulk_job_id: job.parentBulkJobId || null,
      device_id: job.deviceId,
      sim_slot: job.simSlot,
      recipient: job.recipient,
      status: job.status,
      priority: job.priority,
      error_code: job.errorCode || null,
      error_message: job.errorMessage || null,
      created_at: job.createdAt,
      processing_at: job.processingAt || null,
      completed_at: job.completedAt || null,
    },
  });
});

/**
 * POST /v1/sms/status/bulk
 * Query status for up to 100 job IDs at once
 */
router.post('/status/bulk', requireAuth, async (req: Request, res: Response) => {
  const accountId = req.user!.uid;
  const parseResult = bulkStatusQuerySchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'job_ids must be an array of 1 to 100 job IDs',
      },
    });
  }

  const { job_ids } = parseResult.data;
  const results = job_ids.map(id => {
    const job = localJobs.get(id);
    if (!job || job.accountId !== accountId) {
      return { job_id: id, status: 'not_found' };
    }
    return {
      job_id: job.jobId,
      status: job.status,
      error_code: job.errorCode || null,
      completed_at: job.completedAt || null,
    };
  });

  return res.json({
    success: true,
    statuses: results,
  });
});

/**
 * GET /v1/sms/bulk/:bulk_job_id
 * Returns Parent Bulk Job metadata and live aggregated counters
 */
router.get('/bulk/:bulk_job_id', requireAuth, async (req: Request, res: Response) => {
  const accountId = req.user!.uid;
  const { bulk_job_id } = req.params;

  const bulkJob = localBulkJobs.get(bulk_job_id);
  if (!bulkJob || bulkJob.accountId !== accountId) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'JOB_NOT_FOUND',
        message: `Bulk job '${bulk_job_id}' does not exist or access is denied.`,
      },
    });
  }

  return res.json({
    success: true,
    bulk_job: bulkJob,
  });
});

/**
 * GET /v1/sms/bulk/:bulk_job_id/jobs
 * Paginated child jobs for a given parent bulk job
 */
router.get('/bulk/:bulk_job_id/jobs', requireAuth, async (req: Request, res: Response) => {
  const accountId = req.user!.uid;
  const { bulk_job_id } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

  const bulkJob = localBulkJobs.get(bulk_job_id);
  if (!bulkJob || bulkJob.accountId !== accountId) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'JOB_NOT_FOUND',
        message: `Bulk job '${bulk_job_id}' does not exist.`,
      },
    });
  }

  const allChildJobs: any[] = [];
  for (const job of localJobs.values()) {
    if (job.parentBulkJobId === bulk_job_id && job.accountId === accountId) {
      allChildJobs.push(job);
    }
  }

  // Sort by createdAt ascending
  allChildJobs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const total = allChildJobs.length;
  const offset = (page - 1) * limit;
  const paginated = allChildJobs.slice(offset, offset + limit);

  return res.json({
    success: true,
    bulk_job_id,
    page,
    limit,
    total,
    total_pages: Math.ceil(total / limit) || 1,
    jobs: paginated,
  });
});

/**
 * GET /v1/sms/logs
 * Search and paginated history of SMS transmissions
 */
router.get('/logs', requireAuth, async (req: Request, res: Response) => {
  const accountId = req.user!.uid;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 25));
  const status = req.query.status as string | undefined;
  const deviceId = req.query.device_id as string | undefined;
  const search = req.query.search as string | undefined;

  let filtered = localLogs.filter(log => log.accountId === accountId);

  if (status && status !== 'all') {
    filtered = filtered.filter(log => log.status === status);
  }
  if (deviceId && deviceId !== 'all') {
    filtered = filtered.filter(log => log.deviceId === deviceId);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      log =>
        log.recipient.toLowerCase().includes(q) ||
        log.jobId.toLowerCase().includes(q) ||
        (log.parentBulkJobId && log.parentBulkJobId.toLowerCase().includes(q))
    );
  }

  const total = filtered.length;
  const offset = (page - 1) * limit;
  const paginated = filtered.slice(offset, offset + limit);

  return res.json({
    success: true,
    page,
    limit,
    total,
    total_pages: Math.ceil(total / limit) || 1,
    logs: paginated,
  });
});

export default router;
