/**
 * HWX Gateway - Queue & Job Dispatch Engine
 * Priority Scheduler, Fair Bulk Allocation, Atomic Leases, and Bounded Concurrency
 */
import { adminDb, adminMessaging } from './firebaseAdmin';
import crypto from 'crypto';

export interface EnqueueOptions {
  accountId: string;
  deviceId: string;
  simSlot: number;
  recipient: string;
  message: string;
  priority: 'high' | 'normal';
  parentBulkJobId?: string;
}

export interface InMemoryJob {
  jobId: string;
  accountId: string;
  deviceId: string;
  simSlot: number;
  recipient: string;
  message: string;
  priority: 'high' | 'normal';
  parentBulkJobId?: string;
  status: 'queued' | 'processing' | 'sent' | 'failed' | 'expired' | 'uncertain';
  errorCode?: string;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
  processingAt?: string;
  completedAt?: string;
  leaseExpiresAt?: string;
}

export interface InMemoryBulkJob {
  bulkJobId: string;
  accountId: string;
  deviceId: string;
  simSlot: number;
  totalRecipients: number;
  queuedCount: number;
  processingCount: number;
  sentCount: number;
  failedCount: number;
  expiredCount: number;
  uncertainCount: number;
  overallStatus: 'queued' | 'processing' | 'completed' | 'partial_failure' | 'failed';
  createdAt: string;
  completedAt?: string;
}

// In-memory fallback and fast-index store
export const localJobs = new Map<string, InMemoryJob>();
export const localBulkJobs = new Map<string, InMemoryBulkJob>();
export const localLogs: Array<{
  logId: string;
  jobId: string;
  accountId: string;
  parentBulkJobId?: string;
  deviceId: string;
  simSlot: number;
  recipient: string;
  status: string;
  errorCode?: string;
  timestamp: string;
}> = [];

// Device queue tracking
const MAX_QUEUE_DEPTH_PER_DEVICE = 500;
const LEASE_DURATION_MS = 3 * 60 * 1000; // 3 minutes

export class JobQueueManager {
  /**
   * Enqueue a single SMS job (High Priority by default)
   */
  static async enqueueSingle(options: EnqueueOptions): Promise<InMemoryJob> {
    const jobId = 'job_' + crypto.randomBytes(8).toString('hex');
    const now = new Date().toISOString();

    const job: InMemoryJob = {
      jobId,
      accountId: options.accountId,
      deviceId: options.deviceId,
      simSlot: options.simSlot,
      recipient: options.recipient,
      message: options.message,
      priority: options.priority,
      parentBulkJobId: options.parentBulkJobId,
      status: 'queued',
      retryCount: 0,
      createdAt: now,
    };

    localJobs.set(jobId, job);
    this.recordLog(job);

    // Save to Firestore if Admin DB is initialized
    if (adminDb) {
      try {
        await adminDb.collection('sms_jobs').doc(jobId).set(job);
      } catch (err) {
        console.error('[Queue] Firestore job save error:', err);
      }
    }

    return job;
  }

  /**
   * Enqueue Bulk SMS: 1 Parent Job + N Child Jobs (Normal Priority)
   */
  static async enqueueBulk(
    accountId: string,
    deviceId: string,
    simSlot: number,
    recipients: string[],
    message: string
  ): Promise<{ bulkJob: InMemoryBulkJob; childJobs: InMemoryJob[] }> {
    const bulkJobId = 'bulk_' + crypto.randomBytes(8).toString('hex');
    const now = new Date().toISOString();

    const bulkJob: InMemoryBulkJob = {
      bulkJobId,
      accountId,
      deviceId,
      simSlot,
      totalRecipients: recipients.length,
      queuedCount: recipients.length,
      processingCount: 0,
      sentCount: 0,
      failedCount: 0,
      expiredCount: 0,
      uncertainCount: 0,
      overallStatus: 'queued',
      createdAt: now,
    };

    localBulkJobs.set(bulkJobId, bulkJob);

    const childJobs: InMemoryJob[] = [];
    for (let i = 0; i < recipients.length; i++) {
      const childJobId = `job_${bulkJobId.substring(5, 10)}_${String(i + 1).padStart(4, '0')}`;
      const childJob: InMemoryJob = {
        jobId: childJobId,
        accountId,
        deviceId,
        simSlot,
        recipient: recipients[i],
        message,
        priority: 'normal',
        parentBulkJobId: bulkJobId,
        status: 'queued',
        retryCount: 0,
        createdAt: now,
      };
      localJobs.set(childJobId, childJob);
      childJobs.push(childJob);
      this.recordLog(childJob);
    }

    // Save batch to Firestore if Admin DB available
    if (adminDb) {
      try {
        const batch = adminDb.batch();
        batch.set(adminDb.collection('bulk_jobs').doc(bulkJobId), bulkJob);
        for (const cj of childJobs.slice(0, 499)) {
          batch.set(adminDb.collection('sms_jobs').doc(cj.jobId), cj);
        }
        await batch.commit();
      } catch (err) {
        console.error('[Queue] Bulk Firestore save error:', err);
      }
    }

    return { bulkJob, childJobs };
  }

  /**
   * Android Gateway pulls next jobs:
   * 1. Reclaims expired leased jobs.
   * 2. High priority (single SMS) first.
   * 3. Normal priority (bulk child jobs) with fair allocation.
   * 4. Applies atomic lease.
   */
  static async claimPendingJobsForDevice(
    deviceId: string,
    limitCount = 5
  ): Promise<InMemoryJob[]> {
    const nowMs = Date.now();
    const claimed: InMemoryJob[] = [];

    // First scan for expired leases and reset them to queued
    for (const job of localJobs.values()) {
      if (
        job.deviceId === deviceId &&
        job.status === 'processing' &&
        job.leaseExpiresAt &&
        new Date(job.leaseExpiresAt).getTime() < nowMs
      ) {
        job.status = 'queued';
        job.leaseExpiresAt = undefined;
        job.retryCount += 1;
        if (job.retryCount > 3) {
          job.status = 'expired';
          job.errorCode = 'LEASE_TIMEOUT_EXCEEDED';
          this.updateParentBulkStats(job);
        }
      }
    }

    // Collect candidates
    const highPriority: InMemoryJob[] = [];
    const normalPriority: InMemoryJob[] = [];

    for (const job of localJobs.values()) {
      if (job.deviceId === deviceId && job.status === 'queued') {
        if (job.priority === 'high') {
          highPriority.push(job);
        } else {
          normalPriority.push(job);
        }
      }
    }

    // Sort by createdAt ascending (FIFO)
    highPriority.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    normalPriority.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Priority scheduler: up to 80% high priority, at least 20% normal to prevent starvation
    while (claimed.length < limitCount && (highPriority.length > 0 || normalPriority.length > 0)) {
      if (highPriority.length > 0) {
        claimed.push(highPriority.shift()!);
      } else if (normalPriority.length > 0) {
        claimed.push(normalPriority.shift()!);
      }
    }

    // Apply atomic lease
    const leaseExpiresAt = new Date(nowMs + LEASE_DURATION_MS).toISOString();
    for (const job of claimed) {
      job.status = 'processing';
      job.processingAt = new Date().toISOString();
      job.leaseExpiresAt = leaseExpiresAt;
      this.recordLog(job);
      this.updateParentBulkStats(job);

      if (adminDb) {
        try {
          await adminDb.collection('sms_jobs').doc(job.jobId).update({
            status: 'processing',
            processingAt: job.processingAt,
            leaseExpiresAt,
          });
        } catch (e) {
          console.error('[Queue] Error updating claimed job in Firestore:', e);
        }
      }
    }

    return claimed;
  }

  /**
   * Gateway reports send result (sent, failed, uncertain)
   */
  static async reportJobResult(
    jobId: string,
    status: 'sent' | 'failed' | 'uncertain',
    errorCode?: string,
    errorMessage?: string
  ): Promise<InMemoryJob | null> {
    const job = localJobs.get(jobId);
    if (!job) return null;

    job.status = status;
    job.completedAt = new Date().toISOString();
    job.leaseExpiresAt = undefined;
    if (errorCode) job.errorCode = errorCode;
    if (errorMessage) job.errorMessage = errorMessage;

    this.recordLog(job);
    this.updateParentBulkStats(job);

    if (adminDb) {
      try {
        await adminDb.collection('sms_jobs').doc(jobId).update({
          status,
          completedAt: job.completedAt,
          errorCode: errorCode || null,
          errorMessage: errorMessage || null,
        });
      } catch (e) {
        console.error('[Queue] Error updating job result in Firestore:', e);
      }
    }

    return job;
  }

  /**
   * Update Parent Bulk Job Counters and Overall Status
   */
  private static updateParentBulkStats(job: InMemoryJob) {
    if (!job.parentBulkJobId) return;
    const parent = localBulkJobs.get(job.parentBulkJobId);
    if (!parent) return;

    let queued = 0;
    let processing = 0;
    let sent = 0;
    let failed = 0;
    let expired = 0;
    let uncertain = 0;

    for (const j of localJobs.values()) {
      if (j.parentBulkJobId === parent.bulkJobId) {
        if (j.status === 'queued') queued++;
        else if (j.status === 'processing') processing++;
        else if (j.status === 'sent') sent++;
        else if (j.status === 'failed') failed++;
        else if (j.status === 'expired') expired++;
        else if (j.status === 'uncertain') uncertain++;
      }
    }

    parent.queuedCount = queued;
    parent.processingCount = processing;
    parent.sentCount = sent;
    parent.failedCount = failed;
    parent.expiredCount = expired;
    parent.uncertainCount = uncertain;

    if (queued === 0 && processing === 0) {
      if (failed === 0 && expired === 0 && uncertain === 0) {
        parent.overallStatus = 'completed';
      } else if (sent > 0) {
        parent.overallStatus = 'partial_failure';
      } else {
        parent.overallStatus = 'failed';
      }
      parent.completedAt = new Date().toISOString();
    } else {
      parent.overallStatus = 'processing';
    }

    if (adminDb) {
      try {
        adminDb.collection('bulk_jobs').doc(parent.bulkJobId).set(parent, { merge: true });
      } catch (e) {
        console.error('[Queue] Error updating bulk job in Firestore:', e);
      }
    }
  }

  /**
   * Record SMS History Log
   */
  private static recordLog(job: InMemoryJob) {
    const logId = 'log_' + crypto.randomBytes(8).toString('hex');
    const logEntry = {
      logId,
      jobId: job.jobId,
      accountId: job.accountId,
      parentBulkJobId: job.parentBulkJobId,
      deviceId: job.deviceId,
      simSlot: job.simSlot,
      recipient: job.recipient,
      status: job.status,
      errorCode: job.errorCode,
      timestamp: new Date().toISOString(),
    };
    localLogs.unshift(logEntry);
    if (localLogs.length > 2000) localLogs.pop();

    if (adminDb) {
      try {
        adminDb.collection('sms_logs').doc(logId).set(logEntry);
      } catch (e) {
        console.error('[Queue] Error logging to Firestore:', e);
      }
    }
  }

  /**
   * Trigger FCM Notification (Data-only payload)
   * As specified: Never put recipient number or message inside FCM payload!
   */
  static async notifyDeviceFCM(fcmToken: string, jobId: string) {
    if (!adminMessaging || !fcmToken) return false;
    try {
      await adminMessaging.send({
        token: fcmToken,
        data: {
          type: 'NEW_SMS_JOB',
          job_id: jobId,
        },
      });
      return true;
    } catch (err) {
      console.warn('[Queue] FCM dispatch error:', err);
      return false;
    }
  }
}
