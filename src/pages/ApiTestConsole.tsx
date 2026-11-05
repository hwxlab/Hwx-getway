/**
 * HWX Gateway - API Test Console & cURL Generator
 * Live sandbox testing with dynamic cURL builder and real backend API execution
 */
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Device } from '../types';
import {
  Terminal,
  Smartphone,
  CreditCard,
  Phone,
  Copy,
  Check,
  Play,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const ApiTestConsole: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [selectedSimSlot, setSelectedSimSlot] = useState(1);
  const [recipient, setRecipient] = useState('+919876543210');
  const [message, setMessage] = useState('Test broadcast from HWX Gateway Test Console.');
  const [testApiKey, setTestApiKey] = useState('hwx_live_preview_token');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [devicesData, keysData] = await Promise.all([
          api.getDevices().catch(() => null),
          api.getKeys().catch(() => null),
        ]);
        if (devicesData?.devices && devicesData.devices.length > 0) {
          setDevices(devicesData.devices);
          setSelectedDeviceId(devicesData.devices[0].deviceId);
        }
        if (keysData?.keys && keysData.keys.length > 0) {
          setTestApiKey(keysData.keys[0].keyPrefix.replace('...', '_SECRET'));
        }
      } catch (err) {
        console.error('Failed to load test console data:', err);
      }
    }
    loadData();
  }, []);

  const selectedDevice = devices.find((d) => d.deviceId === selectedDeviceId);
  const sims = selectedDevice?.sims || [];

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://api.hwxgateway.com';

  // Automatically generate valid cURL command
  const generatedCurl = `curl -X POST "${baseUrl}/v1/sms/send" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${testApiKey}" \\
  -d '{
    "device_id": "${selectedDeviceId || 'dev_sample'}",
    "sim_slot": ${selectedSimSlot},
    "to": "${recipient}",
    "message": "${message.replace(/"/g, '\\"')}"
  }'`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(generatedCurl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = async () => {
    if (!selectedDeviceId) {
      alert('Please select or pair an Android device first.');
      return;
    }

    setLoading(true);
    setApiResponse(null);
    const start = performance.now();

    try {
      const res = await api.sendSingleSms({
        device_id: selectedDeviceId,
        sim_slot: selectedSimSlot,
        to: recipient.trim(),
        message: message.trim(),
      });
      const end = performance.now();
      setResponseStatus(202);
      setResponseTime(Math.round(end - start));
      setApiResponse(res);
    } catch (err: any) {
      const end = performance.now();
      setResponseStatus(400);
      setResponseTime(Math.round(end - start));
      setApiResponse({
        success: false,
        error: {
          message: err.message || 'API request failed',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">API Test Console & cURL Generator</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Execute live requests against your backend SMS queue and copy populated cURL snippets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Parameters */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Request Parameters
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Device</label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {devices.length === 0 ? (
                <option value="">No devices paired yet</option>
              ) : (
                devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.name} ({d.deviceId})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Outbound SIM Slot</label>
            <select
              value={selectedSimSlot}
              onChange={(e) => setSelectedSimSlot(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {sims.length > 0 ? (
                sims.map((sim) => (
                  <option key={sim.simId} value={sim.simSlot}>
                    SIM {sim.simSlot} · {sim.carrierName} ({sim.availability})
                  </option>
                ))
              ) : (
                <>
                  <option value={1}>SIM Slot 1</option>
                  <option value={2}>SIM Slot 2</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Recipient Number</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="+919876543210"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">SMS Message</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={handleExecute}
            disabled={loading || !selectedDeviceId}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{loading ? 'Submitting...' : 'Send Live Request'}</span>
          </button>
        </div>

        {/* Generated cURL & Live Output */}
        <div className="space-y-6">
          {/* Automatic cURL snippet */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Auto-Generated cURL</span>
              </span>
              <button
                type="button"
                onClick={handleCopyCurl}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
              <pre>{generatedCurl}</pre>
            </div>
          </div>

          {/* Response Inspector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Server Response Output
              </span>
              {responseStatus && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      responseStatus < 300
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-red-950 text-red-400 border border-red-800'
                    }`}
                  >
                    HTTP {responseStatus}
                  </span>
                  <span className="text-slate-400">{responseTime}ms</span>
                </div>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-slate-300 min-h-[140px] max-h-[220px] overflow-y-auto">
              {apiResponse ? (
                <pre
                  className={responseStatus && responseStatus < 300 ? 'text-emerald-400' : 'text-red-400'}
                >
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              ) : (
                <span className="text-slate-400">
                  Ready. Click "Send Live Request" above to test API dispatch and inspect headers.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
