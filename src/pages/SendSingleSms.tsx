/**
 * HWX Gateway - Send Single SMS Portal
 * High priority transactional SMS dispatch with dynamic SIM selection and live tracking
 */
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Device, SimCard } from '../types';
import { NavTab } from '../components/Sidebar';
import {
  Send,
  Smartphone,
  CreditCard,
  Phone,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface SendSingleSmsProps {
  onNavigate: (tab: NavTab) => void;
  onViewJob?: (jobId: string) => void;
}

export const SendSingleSms: React.FC<SendSingleSmsProps> = ({ onNavigate, onViewJob }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [selectedSimSlot, setSelectedSimSlot] = useState<number>(1);
  const [recipient, setRecipient] = useState('+919876543210');
  const [message, setMessage] = useState('Hello from HWX Gateway! Your OTP code is 482910.');
  const [loading, setLoading] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [dispatchedJob, setDispatchedJob] = useState<any | null>(null);
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
      } finally {
        setLoadingDevices(false);
      }
    }
    loadDevices();
  }, []);

  const selectedDevice = devices.find((d) => d.deviceId === selectedDeviceId);
  const sims = selectedDevice?.sims || [];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeviceId) {
      setErrorMsg('Please select or pair an Android gateway device first.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await api.sendSingleSms({
        device_id: selectedDeviceId,
        sim_slot: selectedSimSlot,
        to: recipient.trim(),
        message: message.trim(),
      });

      if (res?.success) {
        setDispatchedJob(res);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch SMS job.');
    } finally {
      setLoading(false);
    }
  };

  const charCount = message.length;
  const segments = Math.ceil(charCount / 160) || 1;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Send Single SMS</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          High-priority transactional message routing directly to the selected Android hardware SIM slot.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Dispatched Result Banner */}
      {dispatchedJob && (
        <div className="p-5 rounded-2xl bg-indigo-950/50 border border-indigo-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>SMS Dispatched to Gateway Queue!</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-indigo-900/60 text-indigo-300 rounded border border-indigo-700">
              High Priority FIFO
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px]">JOB ID</span>
              <span className="text-indigo-400 font-bold">{dispatchedJob.job_id}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">INITIAL STATUS</span>
              <span className="text-amber-400">{dispatchedJob.status}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">RECIPIENT</span>
              <span className="text-slate-200">{recipient}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">DEVICE / SIM</span>
              <span className="text-slate-200">{selectedDevice?.name?.substring(0, 10)} (S{selectedSimSlot})</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              Android gateway will execute SMS broadcast upon next sync / FCM pulse.
            </span>
            <button
              type="button"
              onClick={() => onNavigate('jobs')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Track in SMS Jobs →
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        {loadingDevices ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading connected devices...</div>
        ) : devices.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-xs text-slate-400">No Android devices are connected to your account.</p>
            <button
              type="button"
              onClick={() => onNavigate('add-device')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg"
            >
              Pair Android Device First
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-6">
            {/* Device Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Select Android Gateway Device
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

              {/* SIM Slot Selector */}
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
                      <>
                        <option value={1}>SIM Slot 1 (Primary)</option>
                        <option value={2}>SIM Slot 2 (Secondary)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Recipient Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Recipient Phone Number (E.164 Format)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="+91XXXXXXXXXX"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Include country code without spaces (e.g., +919876543210 or +12025550143).
              </p>
            </div>

            {/* Message Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-200">SMS Message Text</label>
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  {charCount} chars · {segments} segment{segments > 1 ? 's' : ''}
                </span>
              </div>
              <div className="relative">
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Asynchronous dispatch (non-blocking API response)</span>
              </span>

              <button
                type="submit"
                disabled={loading || !recipient.trim() || !message.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <span>{loading ? 'Queuing SMS...' : 'Queue Outbound SMS'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
