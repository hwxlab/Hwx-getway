/**
 * HWX Gateway - API Key Management Portal
 * Cryptographically hashed credentials with single-view raw secret modal
 */
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ApiKey } from '../types';
import {
  Key,
  PlusCircle,
  Copy,
  Check,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  X,
} from 'lucide-react';

export const ApiKeys: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyName, setKeyName] = useState('Production Backend Key');
  const [isCreating, setIsCreating] = useState(false);
  const [createdKeyData, setCreatedKeyData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const data = await api.getKeys();
      if (data?.keys) {
        setKeys(data.keys);
      }
    } catch (err) {
      console.error('Failed to load API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    setErrorMsg(null);
    setIsCreating(true);

    try {
      const res = await api.createKey(keyName.trim(), ['sms:send', 'sms:bulk', 'sms:read']);
      if (res?.success) {
        setCreatedKeyData(res);
        setKeyName('');
        fetchKeys();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently revoke API key "${name}"? Any systems currently using it will be blocked.`)) {
      return;
    }
    try {
      await api.revokeKey(keyId);
      fetchKeys();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">API Key Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically secure hashed API credentials for integrating HWX Gateway into your backend servers.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchKeys}
          className="p-2 text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors self-start sm:self-auto"
          title="Refresh Keys"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Security Architecture Notice */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-slate-200 font-semibold block">Zero-Raw-Storage Security Architecture</span>
          <p className="text-[11px] leading-relaxed">
            Raw API keys are NEVER stored in Firebase Firestore. Only irreversible SHA-256 cryptographic hashes are recorded. Plaintext keys are shown only once upon generation.
          </p>
        </div>
      </div>

      {/* Create Key Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-100 mb-1">Generate New API Key</h3>
        <p className="text-xs text-slate-400 mb-4">
          Assign a recognizable name describing the service or server integrating with HWX Gateway.
        </p>

        <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="e.g. Node.js Production Backend"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={isCreating || !keyName.trim()}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isCreating ? 'Generating...' : 'Create API Key'}</span>
          </button>
        </form>
      </div>

      {/* Keys Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {keys.length === 0 && !loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Key className="w-8 h-8 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-300">No active API keys</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Create an API key above to start making programmatic requests.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="py-3 px-4">Key Label</th>
                  <th className="py-3 px-4">Key Token Prefix</th>
                  <th className="py-3 px-4">Scopes</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Total Requests</th>
                  <th className="py-3 px-4">Last Used</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {keys.map((k) => (
                  <tr key={k.keyId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-200 font-sans font-medium">{k.name}</td>
                    <td className="py-3 px-4 text-indigo-400">{k.keyPrefix}</td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex flex-wrap gap-1">
                        {k.scopes.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          k.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {k.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200 tabular-nums">{k.totalRequests || 0}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {k.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => handleRevokeKey(k.keyId, k.name)}
                          className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 px-2 py-1 rounded transition-colors inline-flex items-center gap-1 font-sans"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Secret Display Modal (Shown ONCE only) */}
      {createdKeyData && (
        <div className="fixed inset-0 bg-slate-950/85 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Key className="w-4 h-4" />
                <span>Save Your API Key Now</span>
              </div>
              <button
                type="button"
                onClick={() => setCreatedKeyData(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-amber-950/40 border border-amber-800/80 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Please copy and store this API key securely in your environment variables. For security reasons, you will never be shown this key again.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                API Secret Key for "{createdKeyData.name}"
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdKeyData.api_key}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-emerald-400 select-all"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(createdKeyData.api_key)}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                  title="Copy Key"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setCreatedKeyData(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg"
              >
                I have saved this key safely
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
