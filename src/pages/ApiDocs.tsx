/**
 * HWX Gateway - API Documentation Portal
 * Complete REST API contracts, Android Gateway Phase 2 protocol, and Error Codes
 */
import React, { useState } from 'react';
import { BookOpen, Terminal, Key, Shield, Smartphone, Copy, Check } from 'lucide-react';

export const ApiDocs: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyCode = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://api.hwxgateway.com';

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">API Documentation & Gateway Protocol</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Standard REST API reference for developers and Phase 2 Android Gateway integration contracts.
        </p>
      </div>

      {/* 1. Authentication */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
          <Key className="w-4 h-4 text-indigo-400" />
          <span>1. Authentication</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          All API requests must authenticate with an API Key generated in your dashboard. Pass the key in the <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded">X-API-Key</code> header or as a Bearer token in the <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded">Authorization</code> header.
        </p>
        <div className="relative bg-slate-950 rounded-lg p-3.5 border border-slate-800 font-mono text-xs text-slate-300">
          <pre>X-API-Key: hwx_live_YOUR_API_KEY</pre>
          <pre className="text-slate-400 mt-1"># or: Authorization: Bearer hwx_live_YOUR_API_KEY</pre>
        </div>
      </section>

      {/* 2. Single SMS API */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-800">
              POST
            </span>
            <span>/v1/sms/send</span>
          </div>
          <span className="text-[11px] font-mono text-indigo-400">High Priority FIFO</span>
        </div>
        <p className="text-xs text-slate-300">
          Queues a single SMS message. The request returns immediately with a unique <code className="text-indigo-300">job_id</code>.
        </p>

        <div>
          <div className="text-[11px] font-semibold text-slate-400 mb-1">Request Body (JSON)</div>
          <div className="relative bg-slate-950 rounded-lg p-3.5 border border-slate-800 font-mono text-xs text-slate-300">
            <button
              type="button"
              onClick={() => copyCode('single_req', JSON.stringify({
                device_id: "dev_001",
                sim_slot: 1,
                to: "+919876543210",
                message: "Your OTP code is 984120"
              }, null, 2))}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
            >
              {copiedSection === 'single_req' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <pre>{`{
  "device_id": "dev_001",
  "sim_slot": 1,
  "to": "+919876543210",
  "message": "Your OTP code is 984120"
}`}</pre>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-slate-400 mb-1">Response (202 Accepted)</div>
          <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800 font-mono text-xs text-emerald-400">
            <pre>{`{
  "success": true,
  "job_id": "job_a1b2c3d4",
  "status": "queued",
  "created_at": "2026-11-02T08:00:00.000Z"
}`}</pre>
          </div>
        </div>
      </section>

      {/* 3. Bulk SMS API */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-800">
              POST
            </span>
            <span>/v1/sms/bulk</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Normal Priority Batch</span>
        </div>
        <p className="text-xs text-slate-300">
          Dispatches bulk broadcasts. Creates ONE Parent Bulk Job ID and ONE Child Job ID per recipient.
        </p>

        <div>
          <div className="text-[11px] font-semibold text-slate-400 mb-1">Request Body (JSON)</div>
          <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800 font-mono text-xs text-slate-300">
            <pre>{`{
  "device_id": "dev_001",
  "sim_slot": 1,
  "recipients": [
    "+919876543210",
    "+919876543211",
    "+919876543212"
  ],
  "message": "System upgrade will take place on Sunday at 2 AM."
}`}</pre>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-slate-400 mb-1">Response (202 Accepted)</div>
          <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800 font-mono text-xs text-emerald-400">
            <pre>{`{
  "success": true,
  "bulk_job_id": "bulk_90f23b12",
  "total_recipients": 3,
  "queued_count": 3,
  "status": "queued",
  "created_at": "2026-11-02T08:00:00.000Z"
}`}</pre>
          </div>
        </div>
      </section>

      {/* 4. Status Endpoints */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="text-sm font-bold text-slate-100">4. Status Tracking APIs</div>

        <div className="space-y-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="font-mono text-indigo-400 font-semibold mb-1">GET /v1/sms/status/:job_id</div>
            <div className="text-slate-400">Retrieves real-time status of a single SMS or child bulk job.</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="font-mono text-indigo-400 font-semibold mb-1">GET /v1/sms/bulk/:bulk_job_id</div>
            <div className="text-slate-400">Returns aggregated parent progress, sent counts, and failure counts.</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="font-mono text-indigo-400 font-semibold mb-1">GET /v1/sms/bulk/:bulk_job_id/jobs?page=1&limit=20</div>
            <div className="text-slate-400">Paginated list of individual child tasks for a parent bulk job.</div>
          </div>
        </div>
      </section>

      {/* 5. Phase 2 Android Gateway Protocol */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>5. Future Android Gateway Protocol (Phase 2 Contracts)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          These endpoints are dedicated to the Android Gateway app. The Android app authenticates via <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded">X-Device-Id</code> and <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded">X-Device-Token</code>.
        </p>

        <div className="space-y-2.5 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-emerald-400 font-semibold">POST /v1/devices/pairing/verify</div>
            <div className="text-slate-400 text-[11px] mt-0.5 font-sans">
              Gateway submits 6-digit pairing code & token upon QR scan. Backend issues permanent device token.
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-emerald-400 font-semibold">POST /v1/devices/:device_id/heartbeat</div>
            <div className="text-slate-400 text-[11px] mt-0.5 font-sans">
              Gateway reports online status, battery level, network type, and available SIM card info.
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-emerald-400 font-semibold">GET /v1/devices/:device_id/jobs/pending?limit=5</div>
            <div className="text-slate-400 text-[11px] mt-0.5 font-sans">
              Gateway claims next pending jobs with atomic 3-minute lease (FIFO high priority single SMS first).
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-emerald-400 font-semibold">POST /v1/devices/:device_id/jobs/:job_id/result</div>
            <div className="text-slate-400 text-[11px] mt-0.5 font-sans">
              Gateway reports actual send status (sent, failed, uncertain) and carrier error codes.
            </div>
          </div>
        </div>
      </section>

      {/* 6. Standard Error Codes */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="text-sm font-bold text-slate-100">6. Standard Error Codes</div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">HTTP Status</th>
                <th className="py-2.5 px-3 font-sans">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px]">
              <tr>
                <td className="py-2.5 px-3 text-red-400 font-bold">AUTH_REQUIRED</td>
                <td className="py-2.5 px-3 text-slate-400">401</td>
                <td className="py-2.5 px-3 text-slate-300 font-sans">Missing Authorization header or invalid ID token</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-red-400 font-bold">API_KEY_INVALID</td>
                <td className="py-2.5 px-3 text-slate-400">401</td>
                <td className="py-2.5 px-3 text-slate-300 font-sans">The API key hash does not match an active key</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-red-400 font-bold">DEVICE_NOT_FOUND</td>
                <td className="py-2.5 px-3 text-slate-400">404</td>
                <td className="py-2.5 px-3 text-slate-300 font-sans">Specified device_id does not exist in your account</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-red-400 font-bold">DEVICE_OFFLINE</td>
                <td className="py-2.5 px-3 text-slate-400">400</td>
                <td className="py-2.5 px-3 text-slate-300 font-sans">Device is suspended or has not sent heartbeat recently</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-red-400 font-bold">SIM_NOT_AVAILABLE</td>
                <td className="py-2.5 px-3 text-slate-400">400</td>
                <td className="py-2.5 px-3 text-slate-300 font-sans">SIM is reported as No Network or SIM Not Available</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-red-400 font-bold">RATE_LIMIT_EXCEEDED</td>
                <td className="py-2.5 px-3 text-slate-400">429</td>
                <td className="py-2.5 px-3 text-slate-300 font-sans">Account or API Key exceeded 120 requests/minute</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-red-400 font-bold">QUEUE_OVERLOADED</td>
                <td className="py-2.5 px-3 text-slate-400">500</td>
                <td className="py-2.5 px-3 text-slate-300 font-sans">Queue depth exceeded capacity; backpressure applied</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
