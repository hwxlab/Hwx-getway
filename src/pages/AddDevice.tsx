/**
 * HWX Gateway - Add Device Pairing Portal
 * QR Code & Manual Pairing Code workflow with cryptographically secure single-use tokens
 */
import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { api } from '../lib/api';
import { NavTab } from '../components/Sidebar';
import {
  Smartphone,
  QrCode,
  KeyRound,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  PlayCircle,
} from 'lucide-react';

interface AddDeviceProps {
  onNavigate: (tab: NavTab) => void;
}

export const AddDevice: React.FC<AddDeviceProps> = ({ onNavigate }) => {
  const [deviceName, setDeviceName] = useState('Samsung Galaxy Gateway 01');
  const [pairingSession, setPairingSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [simulating, setSimulating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleInitiatePairing = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!deviceName.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.initiatePairing(deviceName.trim());
      if (data?.session) {
        setPairingSession(data.session);
        setTimeLeft(300);
      }
    } catch (err: any) {
      console.error('Pairing initiation error:', err);
      setErrorMsg(err.message || 'Failed to start pairing session.');
    } finally {
      setLoading(false);
    }
  };

  // Render QR Code on canvas
  useEffect(() => {
    if (pairingSession?.qr_payload && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, pairingSession.qr_payload, {
        width: 220,
        margin: 2,
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
      }).catch((err) => console.error('QR code render error:', err));
    }
  }, [pairingSession]);

  // Countdown timer
  useEffect(() => {
    if (!pairingSession) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPairingSession(null);
          setErrorMsg('Pairing code expired. Please initiate a new session.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pairingSession]);

  const copyCode = () => {
    if (pairingSession?.pairing_code) {
      navigator.clipboard.writeText(pairingSession.pairing_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Simulator helper: lets user test pairing immediate without Android app
  const simulateAndroidPairing = async () => {
    if (!pairingSession) return;
    setSimulating(true);
    try {
      await api.verifyPairing(pairingSession.pairing_code, pairingSession.pairing_token, {
        model: 'Android Test Phone (Simulated)',
        android_version: '14.0 (API 34)',
        app_version: '1.0.0-phase1',
        sim_count: 2,
        sims: [
          {
            sim_slot: 1,
            carrier_name: 'Jio 5G',
            phone_number: '+91 98765 43210',
            availability: 'Available',
            network_status: '5G SA',
            sms_permission: true,
          },
          {
            sim_slot: 2,
            carrier_name: 'Airtel',
            phone_number: '+91 91234 56789',
            availability: 'Available',
            network_status: 'LTE',
            sms_permission: true,
          },
        ],
      });
      alert(`Success! Device "${pairingSession.device_name}" is now paired and online!`);
      onNavigate('devices');
    } catch (err: any) {
      alert(err.message || 'Simulation verification failed');
    } finally {
      setSimulating(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Add New Android Gateway Device</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Pair physical Android hardware securely using either QR Code scanning or manual 6-digit code.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step 1: Initiate Pairing */}
      {!pairingSession ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleInitiatePairing} className="max-w-lg space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Device Display Name / Identifier
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="e.g. Office Samsung Galaxy S23"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                A memorable label for this cellular gateway inside your dashboard.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !deviceName.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <span>{loading ? 'Generating Session...' : 'Generate Secure Pairing Codes'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security details */}
          <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-200 block">Single-Use Security</span>
              <span className="text-[11px]">Tokens are cryptographically generated and expire in 5 minutes.</span>
            </div>
            <div>
              <span className="font-semibold text-slate-200 block">No App Account Needed</span>
              <span className="text-[11px]">The future Android Gateway app connects without separate login.</span>
            </div>
            <div>
              <span className="font-semibold text-slate-200 block">Multi-SIM Auto Detect</span>
              <span className="text-[11px]">Reports SIM carriers, numbers, and health upon connection.</span>
            </div>
          </div>
        </div>
      ) : (
        /* Step 2: Display QR Code & Manual Pairing Code */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8">
          {/* Top Session Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-3">
            <div>
              <div className="text-xs text-slate-400">Pairing target:</div>
              <div className="text-sm font-bold text-slate-100">{pairingSession.device_name}</div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300">Code expires in:</span>
              <span className="text-amber-400 font-bold tabular-nums">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Method 1: QR Code */}
            <div className="flex flex-col items-center text-center p-6 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-4">
                <QrCode className="w-4 h-4 text-indigo-400" />
                <span>Method 1: Scan QR Code</span>
              </div>

              <div className="p-3 bg-white rounded-xl shadow-lg inline-block">
                <canvas ref={canvasRef} />
              </div>

              <p className="text-[11px] text-slate-400 mt-4 max-w-xs">
                Open HWX Gateway on your Android device and scan this QR code to automatically register.
              </p>
            </div>

            {/* Method 2: Manual Pairing Code */}
            <div className="flex flex-col justify-center p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <KeyRound className="w-4 h-4 text-indigo-400" />
                <span>Method 2: Manual 6-Digit Pairing Code</span>
              </div>

              <p className="text-xs text-slate-400">
                If the phone camera is unavailable, enter this single-use code directly in the Android app:
              </p>

              <div className="flex items-center gap-3">
                <div className="flex-1 py-3 px-4 bg-slate-900 border border-slate-700 rounded-lg text-center font-mono text-2xl font-bold tracking-widest text-indigo-300">
                  {pairingSession.pairing_code}
                </div>
                <button
                  type="button"
                  onClick={copyCode}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                  title="Copy Pairing Code"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1 font-mono text-[11px]">
                <div>Session ID: {pairingSession.session_id}</div>
                <div>Server URL: {window.location.origin}</div>
              </div>
            </div>
          </div>

          {/* Test Pairing simulator banner */}
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-indigo-200 flex items-center gap-1.5">
                <PlayCircle className="w-4 h-4 text-indigo-400" />
                <span>Simulator / Immediate Testing Mode</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Simulate an Android device responding with SIM details to test the dashboard immediately.
              </div>
            </div>

            <button
              type="button"
              onClick={simulateAndroidPairing}
              disabled={simulating}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors"
            >
              {simulating ? 'Connecting...' : 'Simulate Device Pairing'}
            </button>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setPairingSession(null)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              ← Cancel and start new session
            </button>

            <button
              type="button"
              onClick={() => onNavigate('devices')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View Connected Devices →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
