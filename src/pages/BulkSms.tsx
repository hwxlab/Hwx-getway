/**
 * HWX Gateway - Bulk SMS Dispatcher
 * Parent Batch creation with Child Job tracking, bounded concurrency, and fair scheduling
 */
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Device } from '../types';
import { NavTab } from '../components/Sidebar';
import {
  Layers,
  Smartphone,
  CreditCard,
  UploadCloud,
  Users,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface BulkSmsProps {
  onNavigate: (tab: NavTab) => void;
  onSelectBulkJob: (bulkJobId: string) => void;
}

export const BulkSms: React.FC<BulkSmsProps> = ({ onNavigate, onSelectBulkJob }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [selectedSimSlot, setSelectedSimSlot] = useState(1);
  const [rawRecipients, setRawRecipients] = useState(
    '+919876543210\n+919876543211\n+919876543212\n+919876543213\n+919876543214'
  );
  const [message, setMessage] = useState(
    'Notice: Scheduled system maintenance on Sunday at 02:00 AM. Service will experience minimal downtime.'
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadDevices() {
      try {
        const data = await api.getDevices();
        if (data?.devices && data.devices.length > 0) {
          setDevices(data.devices);
          setSelectedDeviceId(data.devices[0].deviceId);
        }
      } catch (err) {
        console.error('Failed to load devices:', err);
      }
    }
    loadDevices();
  }, []);

  const selectedDevice = devices.find((d) => d.deviceId === selectedDeviceId);
  const sims = selectedDevice?.sims || [];

  // Parse and deduplicate recipients
  const parsedRecipients = Array.from(
    new Set(
      rawRecipients
        .split(/[\n,;\s]+/)
        .map((r) => r.trim())
        .filter((r) => r.length >= 4)
    )
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawRecipients(content);
      }
    };
    reader.readAsText(file);
  };

  const handleSendBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeviceId) {
      setErrorMsg('Please select a connected Android gateway device.');
      return;
    }
    if (parsedRecipients.length === 0) {
      setErrorMsg('Please enter at least one valid recipient phone number.');
      return;
    }
    if (parsedRecipients.length > 1000) {
      setErrorMsg('Maximum 1,000 recipients per bulk job.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await api.sendBulkSms({
        device_id: selectedDeviceId,
        sim_slot: selectedSimSlot,
        recipients: parsedRecipients,
        message: message.trim(),
      });

      if (res?.success && res.bulk_job_id) {
        onSelectBulkJob(res.bulk_job_id);
        onNavigate('bulk-details');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Bulk batch creation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Bulk SMS Dispatcher</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Creates one Parent Bulk Job ID with individual Child Job tracking and fair queue scheduling.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Compliance Notice */}
      <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-xl text-xs text-amber-300/90 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-amber-200 block">Consent & Anti-Abuse Compliance</span>
          <p className="text-[11px] leading-relaxed">
            Ensure all recipients have given lawful, verifiable consent to receive SMS notifications. Bulk messages are throttled per operator carrier policies to protect SIM delivery integrity.
          </p>
        </div>
      </div>

      {/* Bulk Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        {devices.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-xs text-slate-400">No Android devices connected.</p>
            <button
              type="button"
              onClick={() => onNavigate('add-device')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg"
            >
              Pair Android Device First
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendBulk} className="space-y-6">
            {/* Device & SIM Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Select Android Gateway
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {devices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.name} ({d.isOnline ? 'Online' : 'Offline'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Select Outbound SIM Slot
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <select
                    value={selectedSimSlot}
                    onChange={(e) => setSelectedSimSlot(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {sims.length > 0 ? (
                      sims.map((sim) => (
                        <option key={sim.simId} value={sim.simSlot}>
                          Slot {sim.simSlot} - {sim.carrierName} ({sim.availability})
                        </option>
                      ))
                    ) : (
                      <option value={1}>SIM Slot 1</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Recipients Input & CSV Upload */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Recipients List ({parsedRecipients.length} valid detected)</span>
                </label>

                <label className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload CSV / TXT</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                required
                rows={5}
                value={rawRecipients}
                onChange={(e) => setRawRecipients(e.target.value)}
                placeholder="+919876543210&#10;+919876543211&#10;+919876543212"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Enter phone numbers separated by newlines or commas. Up to 1,000 per bulk batch.
              </p>
            </div>

            {/* Message Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-200">Broadcast Message</label>
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  {message.length} chars
                </span>
              </div>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-between">
              <div className="text-[11px] text-slate-400 font-mono">
                Batch: {parsedRecipients.length} Child Tasks
              </div>

              <button
                type="submit"
                disabled={loading || parsedRecipients.length === 0 || !message.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <span>{loading ? 'Submitting Batch...' : `Dispatch Bulk Batch (${parsedRecipients.length})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
