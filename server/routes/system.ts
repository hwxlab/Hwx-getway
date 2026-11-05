/**
 * HWX Gateway - System Health, Usage, and Audit Logging Endpoints
 */
import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { isInitialized as adminInitialized, initializationError } from '../firebaseAdmin';
import { localDevices, localApiKeys } from '../middleware/auth';
import { localJobs, localBulkJobs } from '../queue';
import crypto from 'crypto';

const router = Router();

// In-memory audit logs store
export const localAuditLogs: Array<{
  logId: string;
  accountId: string;
  action: string;
  actor: string;
  details: string;
  timestamp: string;
}> = [];

/**
 * GET /v1/health
 * Public health check and diagnostic status
 */
router.get('/health', (req: Request, res: Response) => {
  const activeDevices = Array.from(localDevices.values()).filter(d => {
    return Date.now() - new Date(d.lastSeenAt).getTime() < 3 * 60 * 1000;
  }).length;

  let queuedJobs = 0;
  let processingJobs = 0;
  for (const job of localJobs.values()) {
    if (job.status === 'queued') queuedJobs++;
    if (job.status === 'processing') processingJobs++;
  }

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    platform: 'HWX Gateway Web Core',
    firebase: {
      projectId: adminInitialized ? (process.env.FIREBASE_PROJECT_ID || 'configured') : null,
      adminSdkConfigured: adminInitialized,
      error: initializationError,
    },
    metrics: {
      totalDevices: localDevices.size,
      activeDevices,
      queuedJobs,
      processingJobs,
      totalKeys: localApiKeys.size,
    },
  });
});

/**
 * GET /v1/usage
 * Aggregated usage limits and statistics for user account
 */
router.get('/usage', requireAuth, (req: Request, res: Response) => {
  const accountId = req.user!.uid;

  let singleSmsCount = 0;
  let bulkSmsCount = 0;
  let sentCount = 0;
  let failedCount = 0;
  let queuedCount = 0;

  for (const job of localJobs.values()) {
    if (job.accountId === accountId) {
      if (job.parentBulkJobId) {
        bulkSmsCount++;
      } else {
        singleSmsCount++;
      }

      if (job.status === 'sent') sentCount++;
      else if (job.status === 'failed') failedCount++;
      else if (job.status === 'queued') queuedCount++;
    }
  }

  res.json({
    success: true,
    limits: {
      dailyLimit: 5000,
      monthlyLimit: 150000,
      rateLimitPerMinute: 120,
      maxRecipientsPerBulk: 1000,
    },
    usage: {
      totalDispatched: localJobs.size,
      singleSmsCount,
      bulkSmsCount,
      sentCount,
      failedCount,
      queuedCount,
      todayDispatched: sentCount + failedCount,
    },
  });
});

/**
 * GET /v1/audit-logs
 * Security and administrative audit trail
 */
router.get('/audit-logs', requireAuth, (req: Request, res: Response) => {
  const accountId = req.user!.uid;
  const filtered = localAuditLogs.filter(l => l.accountId === accountId);

  res.json({
    success: true,
    logs: filtered.slice(0, 100),
  });
});

/**
 * Helper to record audit events
 */
export function recordAuditEvent(accountId: string, action: string, actor: string, details: string) {
  localAuditLogs.unshift({
    logId: 'audit_' + crypto.randomBytes(8).toString('hex'),
    accountId,
    action,
    actor,
    details,
    timestamp: new Date().toISOString(),
  });
  if (localAuditLogs.length > 500) localAuditLogs.pop();
}

export default router;
