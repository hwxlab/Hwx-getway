/**
 * HWX Gateway - Client API Helper
 */
import { auth } from './firebase';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  
  // Attach Firebase ID token if user is signed in
  if (auth.currentUser) {
    try {
      const idToken = await auth.currentUser.getIdToken();
      headers.set('Authorization', `Bearer ${idToken}`);
    } catch (e) {
      console.warn('Could not retrieve Firebase ID token:', e);
    }
  }

  if (!headers.has('Content-Type') && options.method && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error?.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  return data;
}

export const api = {
  getHealth: () => fetchWithAuth('/v1/health'),
  getDevices: () => fetchWithAuth('/v1/devices'),
  initiatePairing: (deviceName: string) =>
    fetchWithAuth('/v1/devices/pairing/initiate', {
      method: 'POST',
      body: JSON.stringify({ device_name: deviceName }),
    }),
  verifyPairing: (pairingCode: string, pairingToken: string, options?: any) =>
    fetchWithAuth('/v1/devices/pairing/verify', {
      method: 'POST',
      body: JSON.stringify({
        pairing_code: pairingCode,
        pairing_token: pairingToken,
        ...options,
      }),
    }),
  renameDevice: (deviceId: string, name: string) =>
    fetchWithAuth(`/v1/devices/${deviceId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),
  deleteDevice: (deviceId: string) =>
    fetchWithAuth(`/v1/devices/${deviceId}`, {
      method: 'DELETE',
    }),
  sendSingleSms: (payload: { device_id: string; sim_slot: number; to: string; message: string }) =>
    fetchWithAuth('/v1/sms/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  sendBulkSms: (payload: { device_id: string; sim_slot: number; recipients: string[]; message: string }) =>
    fetchWithAuth('/v1/sms/bulk', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getJobStatus: (jobId: string) => fetchWithAuth(`/v1/sms/status/${jobId}`),
  getBulkJob: (bulkJobId: string) => fetchWithAuth(`/v1/sms/bulk/${bulkJobId}`),
  getBulkJobChildJobs: (bulkJobId: string, page = 1, limit = 20) =>
    fetchWithAuth(`/v1/sms/bulk/${bulkJobId}/jobs?page=${page}&limit=${limit}`),
  getSmsLogs: (params: { page?: number; limit?: number; status?: string; device_id?: string; search?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.status) q.set('status', params.status);
    if (params.device_id) q.set('device_id', params.device_id);
    if (params.search) q.set('search', params.search);
    return fetchWithAuth(`/v1/sms/logs?${q.toString()}`);
  },
  getKeys: () => fetchWithAuth('/v1/keys'),
  createKey: (name: string, scopes?: string[]) =>
    fetchWithAuth('/v1/keys', {
      method: 'POST',
      body: JSON.stringify({ name, scopes }),
    }),
  revokeKey: (keyId: string) =>
    fetchWithAuth(`/v1/keys/${keyId}`, {
      method: 'DELETE',
    }),
  getUsage: () => fetchWithAuth('/v1/usage'),
  getAuditLogs: () => fetchWithAuth('/v1/audit-logs'),
};
