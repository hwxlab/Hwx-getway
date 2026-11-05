/**
 * HWX Gateway Core Data Types & Interfaces
 */

export type JobStatus =
  | 'queued'
  | 'processing'
  | 'sent'
  | 'failed'
  | 'expired'
  | 'uncertain'
  | 'delivered';

export type BulkJobStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'partial_failure'
  | 'failed';

export type JobPriority = 'high' | 'normal';

export type SimAvailability =
  | 'Available'
  | 'No Network'
  | 'SIM Not Available'
  | 'Permission Denied'
  | 'Unknown'
  | 'Insufficient Balance';

export interface UserProfile {
  userId: string;
  email: string;
  displayName?: string;
  createdAt: string;
  updatedAt?: string;
  role: 'user' | 'admin';
  dailyLimit: number;
  monthlyLimit: number;
  smsSentToday: number;
  smsSentThisMonth: number;
}

export interface SimCard {
  simId: string;
  deviceId: string;
  accountId: string;
  simSlot: number;
  carrierName: string;
  phoneNumber?: string;
  availability: SimAvailability;
  networkStatus: string;
  smsPermission: boolean;
  lastHealthUpdateAt: string;
}

export interface Device {
  deviceId: string;
  accountId: string;
  name: string;
  model: string;
  androidVersion: string;
  fcmToken?: string;
  smsPermissionGranted: boolean;
  simCount: number;
  sims?: SimCard[];
  isOnline: boolean;
  lastSeenAt: string;
  pairedAt: string;
  appVersion?: string;
  status: 'active' | 'revoked' | 'suspended';
  batteryLevel?: number;
  isCharging?: boolean;
}

export interface PairingSession {
  sessionId: string;
  accountId: string;
  deviceName: string;
  pairingCode: string;
  pairingToken: string;
  expiresAt: string;
  status: 'pending' | 'paired' | 'expired';
  createdAt: string;
  usedAt?: string;
}

export interface ApiKey {
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
}

export interface SmsJob {
  jobId: string;
  accountId: string;
  deviceId: string;
  simSlot: number;
  recipient: string;
  message: string;
  status: JobStatus;
  priority: JobPriority;
  parentBulkJobId?: string;
  errorCode?: string;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
  processingAt?: string;
  completedAt?: string;
  leaseExpiresAt?: string;
}

export interface BulkJob {
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
  overallStatus: BulkJobStatus;
  createdAt: string;
  completedAt?: string;
}

export interface SmsLog {
  logId: string;
  jobId: string;
  accountId: string;
  parentBulkJobId?: string;
  deviceId: string;
  simSlot: number;
  recipient: string;
  status: JobStatus;
  errorCode?: string;
  messageSnippet?: string;
  timestamp: string;
}

export interface AuditLog {
  logId: string;
  accountId: string;
  action: string;
  actor: string;
  details: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'offline';
  timestamp: string;
  version: string;
  firebase: {
    clientInitialized: boolean;
    adminSdkConfigured: boolean;
    projectId: string;
  };
  metrics: {
    activeDevicesCount: number;
    queuedJobsCount: number;
    processingJobsCount: number;
  };
}
