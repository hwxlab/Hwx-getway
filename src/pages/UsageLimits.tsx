/**
 * HWX Gateway - Usage & Limits Dashboard
 * Daily/monthly quota tracking, rate limit monitoring, and throughput graphs
 */
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { StatsCard } from '../components/StatsCard';
import {
  Activity,
  Zap,
  Clock,
  Layers,
  Send,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const UsageLimits: React.FC = () => {
  const [usageData, setUsageData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsage = async () => {
    setLoading(true);
    try {
      const data = await api.getUsage();
      setUsageData(data);
    } catch (err) {
      console.error('Failed to load usage data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const limits = usageData?.limits || {
    dailyLimit: 5000,
    monthlyLimit: 150000,
    rateLimitPerMinute: 120,
    maxRecipientsPerBulk: 1000,
  };
  const usage = usageData?.usage || {
    totalDispatched: 0,
    singleSmsCount: 0,
    bulkSmsCount: 0,
    sentCount: 0,
    failedCount: 0,
    queuedCount: 0,
    todayDispatched: 0,
  };

  const dailyPercent = Math.min(100, Math.round((usage.todayDispatched / limits.dailyLimit) * 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Usage Quotas & System Limits</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor SMS volume consumption, sliding-window rate limits, and carrier safety bounds.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsage}
          className="p-2 text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors self-start sm:self-auto"
          title="Refresh Quotas"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Daily Quota Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Daily SMS Transmission Quota</h3>
            <p className="text-xs text-slate-400">Resets daily at 00:00 UTC</p>
          </div>
          <span className="text-sm font-mono font-bold text-indigo-400 tabular-nums">
            {usage.todayDispatched.toLocaleString()} / {limits.dailyLimit.toLocaleString()} SMS
          </span>
        </div>

        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${dailyPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-400 font-mono">
          <span>{dailyPercent}% consumed</span>
          <span>{(limits.dailyLimit - usage.todayDispatched).toLocaleString()} remaining today</span>
        </div>
      </div>

      {/* Limits & Protection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Rate Limit (API)"
          value={`${limits.rateLimitPerMinute} / min`}
          subtitle="Sliding 60-second window"
          icon={Zap}
        />
        <StatsCard
          title="Max Bulk Batch Size"
          value={`${limits.maxRecipientsPerBulk} Recip.`}
          subtitle="Per POST /v1/sms/bulk call"
          icon={Layers}
        />
        <StatsCard
          title="Lease Expiration"
          value="3 Minutes"
          subtitle="Automatic reset on crash"
          icon={Clock}
        />
        <StatsCard
          title="Concurrent Tasks"
          value="5 / Device"
          subtitle="Bounded concurrency"
          icon={Activity}
        />
      </div>

      {/* Volume Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-100 mb-4">Transmission Channel Breakdown</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 font-sans">Single Transactional</span>
              <Send className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-slate-100 tabular-nums">
              {usage.singleSmsCount.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">High priority OTP & alerts</div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 font-sans">Bulk Broadcasts</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-slate-100 tabular-nums">
              {usage.bulkSmsCount.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Child jobs dispatched via batches</div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 font-sans">Total Dispatched</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-slate-100 tabular-nums">
              {usage.totalDispatched.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Lifetime transmission volume</div>
          </div>
        </div>
      </div>
    </div>
  );
};
