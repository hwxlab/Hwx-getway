/**
 * HWX Gateway - Account Settings & Firebase Configuration Portal
 */
import React, { useState } from 'react';
import { auth, sendResetEmail } from '../lib/firebase';
import {
  User,
  Mail,
  Shield,
  Key,
  Server,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

export const AccountSettings: React.FC = () => {
  const currentUser = auth.currentUser;
  const [resetSent, setResetSent] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    setLoadingReset(true);
    try {
      await sendResetEmail(currentUser.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (e) {
      alert('Failed to send password reset email.');
    } finally {
      setLoadingReset(false);
    }
  };

  const envTemplate = `# Add your own Firebase Admin service account JSON in Vercel
FIREBASE_SERVICE_ACCOUNT_JSON=YOUR_SERVICE_ACCOUNT_JSON`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envTemplate);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Account & Infrastructure Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your developer profile, authentication credentials, and Firebase cloud linkages.
        </p>
      </div>

      {resetSent && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Password reset email dispatched to {currentUser?.email}.</span>
        </div>
      )}

      {/* User Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <User className="w-4 h-4 text-indigo-400" />
          <span>Developer Account Profile</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] font-sans">Email Address</span>
            <span className="text-slate-200">{currentUser?.email || 'user@hwxgateway.internal'}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] font-sans">Firebase Account UID</span>
            <span className="text-slate-200 truncate block">{currentUser?.uid || 'user_demo_001'}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] font-sans">Account Role</span>
            <span className="text-emerald-400 font-bold">Project Administrator</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] font-sans">Email Verified</span>
            <span className={currentUser?.emailVerified ? 'text-emerald-400' : 'text-amber-400'}>
              {currentUser?.emailVerified ? 'Verified' : 'Pending Verification'}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={loadingReset || !currentUser?.email}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
          >
            {loadingReset ? 'Sending...' : 'Send Password Reset Email'}
          </button>
        </div>
      </div>

      {/* Firebase Cloud Connection Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <Database className="w-4 h-4 text-indigo-400" />
          <span>Firebase Cloud Configuration</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] font-sans">Project ID</span>
            <span className="text-indigo-400 font-bold" >YOUR_PROJECT_ID</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] font-sans">Auth Domain</span>
            <span className="text-slate-300">YOUR_PROJECT_ID.firebaseapp.com</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] font-sans">Storage Bucket</span>
            <span className="text-slate-300">YOUR_PROJECT_ID.firebasestorage.app</span>
          </div>
        </div>

        {/* Single Service Account JSON guide */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">
              Firebase Admin SDK Variable (Single Env Variable)
            </span>
            <button
              type="button"
              onClick={copyEnv}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Variable Name</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            As requested by project requirements, the entire Service Account JSON is kept in a single server-only environment variable: <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded font-mono">FIREBASE_SERVICE_ACCOUNT_JSON</code>. Keep this server-side variable private. Never expose a Firebase service account JSON in browser code or a public repository.
          </p>
        </div>
      </div>
    </div>
  );
};
