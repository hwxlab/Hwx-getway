/**
 * HWX Gateway - SMS Logs & Compliance Audit History
 * High-density table with multi-parameter filtering, search, and privacy preservation
 */
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { NavTab } from '../components/Sidebar';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface SmsLogsProps {
  onNavigate: (tab: NavTab) => void;
  onSelectBulkJob: (bulkJobId: string) => void;
}

export const SmsLogs: React.FC<SmsLogsProps> = ({ onNavigate, onSelectBulkJob }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getSmsLogs({
        page,
        limit: 25,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined,
      });
      if (data?.logs) {
        setLogs(data.logs);
        setTotalPages(data.total_pages || 1);
        setTotalLogs(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">SMS Transmission Logs</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable cellular dispatch history, operator delivery results, and transmission errors.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          className="p-2 text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors self-start sm:self-auto"
          title="Refresh Logs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search phone number or job ID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
            {totalLogs} Total Records
          </span>
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All States</option>
              <option value="sent">Sent</option>
              <option value="processing">Processing</option>
              <option value="queued">Queued</option>
              <option value="failed">Failed</option>
              <option value="uncertain">Uncertain</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {logs.length === 0 && !loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <FileText className="w-8 h-8 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-300">No transmission logs match query</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Check active filters or search terms.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">Job ID</th>
                  <th className="py-3 px-4">Parent Bulk ID</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Device / SIM</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Error Code</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.logId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 text-slate-400">{log.logId}</td>
                    <td className="py-2.5 px-4 text-indigo-400 font-semibold">{log.jobId}</td>
                    <td className="py-2.5 px-4 text-slate-300">
                      {log.parentBulkJobId ? (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectBulkJob(log.parentBulkJobId);
                            onNavigate('bulk-details');
                          }}
                          className="text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <span>{log.parentBulkJobId}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-200">{log.recipient}</td>
                    <td className="py-2.5 px-4 text-slate-300">
                      {log.deviceId} (SIM {log.simSlot})
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          log.status === 'sent'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : log.status === 'processing'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : log.status === 'failed'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">
                      {log.errorCode || <span className="text-slate-400">None</span>}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-slate-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
