/**
 * HWX Gateway - Bulk Job Details & Child Task Monitor
 * Aggregated counters, live execution progress bar, and child job pagination
 */
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { NavTab } from '../components/Sidebar';
import {
  Layers,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

interface BulkJobDetailsProps {
  bulkJobId: string | null;
  onNavigate: (tab: NavTab) => void;
}

export const BulkJobDetails: React.FC<BulkJobDetailsProps> = ({ bulkJobId, onNavigate }) => {
  const [bulkJob, setBulkJob] = useState<any | null>(null);
  const [childJobs, setChildJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDetails = async () => {
    if (!bulkJobId) return;
    setLoading(true);
    try {
      const [parentData, childrenData] = await Promise.all([
        api.getBulkJob(bulkJobId).catch(() => null),
        api.getBulkJobChildJobs(bulkJobId, page, 20).catch(() => null),
      ]);

      if (parentData?.bulk_job) {
        setBulkJob(parentData.bulk_job);
      }
      if (childrenData?.jobs) {
        setChildJobs(childrenData.jobs);
        setTotalPages(childrenData.total_pages || 1);
      }
    } catch (err) {
      console.error('Failed to load bulk job details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    const interval = setInterval(() => {
      if (bulkJob?.overallStatus === 'queued' || bulkJob?.overallStatus === 'processing') {
        fetchDetails();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [bulkJobId, page]);

  if (!bulkJobId) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
        <Layers className="w-8 h-8 mx-auto text-slate-600" />
        <h3 className="text-base font-semibold text-slate-200">No Bulk Job Selected</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Select a Parent Bulk Job from the SMS Jobs table or launch a new batch from Bulk SMS.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('bulk-sms')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg"
        >
          Go to Bulk SMS
        </button>
      </div>
    );
  }

  const total = bulkJob?.totalRecipients || 1;
  const sent = bulkJob?.sentCount || 0;
  const failed = bulkJob?.failedCount || 0;
  const completed = sent + failed;
  const percent = Math.min(100, Math.round((completed / total) * 100));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('jobs')}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
            title="Back to SMS Jobs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100 tracking-tight font-mono">{bulkJobId}</h2>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  bulkJob?.overallStatus === 'completed'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : bulkJob?.overallStatus === 'processing'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                }`}
              >
                {bulkJob?.overallStatus || 'QUEUED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Parent batch tracking record and live aggregated child progress.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchDetails}
          className="p-2 text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors self-start sm:self-auto"
          title="Refresh Batch"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Progress Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200">Execution Progress</span>
          <span className="font-mono font-bold text-indigo-400 tabular-nums">{percent}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(sent / total) * 100}%` }}
          />
          <div
            className="h-full bg-red-500 transition-all duration-500"
            style={{ width: `${(failed / total) * 100}%` }}
          />
        </div>

        {/* Aggregate Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2 text-xs font-mono">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">TOTAL</span>
            <span className="text-slate-100 font-bold text-base tabular-nums">{total}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">QUEUED</span>
            <span className="text-indigo-400 font-bold text-base tabular-nums">{bulkJob?.queuedCount || 0}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">PROCESSING</span>
            <span className="text-amber-400 font-bold text-base tabular-nums">{bulkJob?.processingCount || 0}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">SENT</span>
            <span className="text-emerald-400 font-bold text-base tabular-nums">{sent}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">FAILED</span>
            <span className="text-red-400 font-bold text-base tabular-nums">{failed}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">UNCERTAIN</span>
            <span className="text-slate-400 font-bold text-base tabular-nums">{bulkJob?.uncertainCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Child Jobs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Child SMS Tasks ({total})
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Device: {bulkJob?.deviceId} · SIM Slot {bulkJob?.simSlot}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">Child Job ID</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Error / Feedback</th>
                <th className="py-3 px-4 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {childJobs.map((child) => (
                <tr key={child.jobId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 text-indigo-400 font-semibold">{child.jobId}</td>
                  <td className="py-2.5 px-4 text-slate-200">{child.recipient}</td>
                  <td className="py-2.5 px-4 text-slate-400 uppercase text-[10px]">{child.priority}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        child.status === 'sent'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : child.status === 'processing'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : child.status === 'failed'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                      }`}
                    >
                      {child.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">
                    {child.errorCode ? (
                      <span className="text-red-400">{child.errorCode}</span>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-400">
                    {new Date(child.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
