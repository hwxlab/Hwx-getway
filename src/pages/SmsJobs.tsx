/**
 * HWX Gateway - SMS Jobs Queue & Tracking
 * Filterable table of single and child SMS tasks with live states
 */
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { NavTab } from '../components/Sidebar';
import {
  Clock,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface SmsJobsProps {
  onNavigate: (tab: NavTab) => void;
  onSelectBulkJob: (bulkJobId: string) => void;
}

export const SmsJobs: React.FC<SmsJobsProps> = ({ onNavigate, onSelectBulkJob }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await api.getSmsLogs({
        page,
        limit: 20,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined,
      });
      if (data?.logs) {
        setLogs(data.logs);
        setTotalPages(data.total_pages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">SMS Jobs & Execution Pipeline</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time states of single transactional jobs and bulk child tasks leased to Android gateways.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchJobs}
          className="p-2 text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors self-start sm:self-auto"
          title="Refresh Jobs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Job ID, Parent ID, or phone..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="queued">Queued</option>
            <option value="processing">Processing</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="uncertain">Uncertain</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {logs.length === 0 && !loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Clock className="w-8 h-8 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-300">No matching SMS jobs found</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Dispatch a test message using "Send Single SMS" or "Bulk SMS".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="py-3 px-4">Job ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Device / SIM</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Error / Notes</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr
                    key={log.logId}
                    onClick={() => setSelectedJob(log)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 text-indigo-400 font-semibold">{log.jobId}</td>
                    <td className="py-3 px-4">
                      {log.parentBulkJobId ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBulkJob(log.parentBulkJobId);
                            onNavigate('bulk-details');
                          }}
                          className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <span>{log.parentBulkJobId.substring(0, 10)}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Single SMS</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-200">{log.recipient}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {log.deviceId?.substring(0, 8)} (S{log.simSlot})
                    </td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4 text-slate-400">
                      {log.errorCode || <span className="text-slate-400">None</span>}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
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

      {/* Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">SMS Job Details</h3>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Job ID:</span>
                <span className="text-indigo-400">{selectedJob.jobId}</span>
              </div>
              {selectedJob.parentBulkJobId && (
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Parent Bulk ID:</span>
                  <span className="text-slate-200">{selectedJob.parentBulkJobId}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Recipient:</span>
                <span className="text-slate-200">{selectedJob.recipient}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Device ID:</span>
                <span className="text-slate-200">{selectedJob.deviceId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">SIM Slot:</span>
                <span className="text-slate-200">Slot {selectedJob.simSlot}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Status:</span>
                <span className="text-indigo-400 font-bold">{selectedJob.status}</span>
              </div>
              {selectedJob.errorCode && (
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Error Code:</span>
                  <span className="text-red-400">{selectedJob.errorCode}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Recorded At:</span>
                <span className="text-slate-400">{new Date(selectedJob.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
