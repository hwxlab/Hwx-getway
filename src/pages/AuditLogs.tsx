/**
 * HWX Gateway - Security & Audit Trail
 */
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ShieldCheck, RefreshCw, Lock } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs();
      if (data?.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Security & Audit Event Logs</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographic authentication timestamps, API key provisioning events, and device pairings.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAuditLogs}
          className="p-2 text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors self-start sm:self-auto"
          title="Refresh Audit Logs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {logs.length === 0 && !loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Lock className="w-8 h-8 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-300">No security audit events recorded</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Events will be appended here when API keys are generated, revoked, or devices paired.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Audit Details</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.logId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 text-slate-400">{log.logId}</td>
                    <td className="py-2.5 px-4 text-indigo-400 font-semibold font-sans">{log.action}</td>
                    <td className="py-2.5 px-4 text-slate-300">{log.actor}</td>
                    <td className="py-2.5 px-4 text-slate-400 font-sans">{log.details}</td>
                    <td className="py-2.5 px-4 text-right text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
