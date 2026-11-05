/**
 * HWX Gateway - Dashboard Overview Page
 * High-density metrics, 3D Gateway Telemetry station, and real-time operations
 */
import React, { useEffect, useState } from 'react';
import { StatsCard } from '../components/StatsCard';
import { GatewayTelemetry3D } from '../components/GatewayTelemetry3D';
import { api } from '../lib/api';
import { NavTab } from '../components/Sidebar';
import {
  Smartphone,
  Send,
  Clock,
  CheckCircle,
  PlusCircle,
  Layers,
  Terminal,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

interface OverviewProps {
  onNavigate: (tab: NavTab) => void;
}

export const Overview: React.FC<OverviewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    activeDevices: 0,
    totalDevices: 0,
    queuedJobs: 0,
    todayDispatched: 0,
    successRate: '100%',
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [healthData, usageData, logsData, devicesData] = await Promise.all([
        api.getHealth().catch(() => null),
        api.getUsage().catch(() => null),
        api.getSmsLogs({ limit: 5 }).catch(() => null),
        api.getDevices().catch(() => null),
      ]);

      const totalSent = usageData?.usage?.sentCount || 0;
      const totalFailed = usageData?.usage?.failedCount || 0;
      const totalAttempted = totalSent + totalFailed;
      const rate = totalAttempted > 0 ? `${Math.round((totalSent / totalAttempted) * 100)}%` : '100%';

      setStats({
        activeDevices: healthData?.metrics?.activeDevices || 0,
        totalDevices: devicesData?.devices?.length || 0,
        queuedJobs: healthData?.metrics?.queuedJobs || 0,
        todayDispatched: usageData?.usage?.todayDispatched || 0,
        successRate: rate,
      });

      if (logsData?.logs) {
        setRecentLogs(logsData.logs);
      }
    } catch (e) {
      console.error('Failed to load overview data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s live refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">System Telemetry & Gateway Operations</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time Android hardware nodes, dual-SIM dispatchers, and queue schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="p-2 text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('add-device')}
            className="px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Pair Android Device</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Paired Android Devices"
          value={stats.totalDevices}
          subtitle={`${stats.activeDevices} online now`}
          icon={Smartphone}
        />
        <StatsCard
          title="Active SMS Queue Depth"
          value={stats.queuedJobs}
          subtitle="Priority & fair-bulk FIFO"
          icon={Clock}
        />
        <StatsCard
          title="Dispatched Today"
          value={stats.todayDispatched}
          subtitle="Single & bulk recipients"
          icon={Send}
        />
        <StatsCard
          title="Delivery / Sent Rate"
          value={stats.successRate}
          subtitle="Actual hardware results"
          icon={CheckCircle}
          trend={stats.successRate}
          trendPositive={parseInt(stats.successRate) >= 95}
        />
      </div>

      {/* Interactive 3D Gateway Scene */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Gateway Node 3D Telemetry
            </span>
            <span className="text-xs text-slate-400" aria-hidden="true">·</span>
            <span className="text-xs text-slate-400 font-mono">PBR Studio Render</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('devices')}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Manage Hardware</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <GatewayTelemetry3D activeDeviceName="HWX-Gateway-Primary-01" />
      </div>

      {/* 2-Column Split: Quick Dispatch & Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Launchpad */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Gateway Shortcuts</h3>
            <p className="text-xs text-slate-400 mt-1">Instant triggers for API tests and broadcasts.</p>

            <div className="mt-4 space-y-2.5">
              <button
                type="button"
                onClick={() => onNavigate('send-sms')}
                className="w-full p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 text-left transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Send className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-xs font-medium text-slate-200">Send Single SMS</div>
                    <div className="text-[11px] text-slate-400">High-priority transactional dispatch</div>
                  </div>
                </div>
                <span className="text-xs text-slate-400">→</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('bulk-sms')}
                className="w-full p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 text-left transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-xs font-medium text-slate-200">Bulk SMS Dispatcher</div>
                    <div className="text-[11px] text-slate-400">Parent-child batch job tracking</div>
                  </div>
                </div>
                <span className="text-xs text-slate-400">→</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('console')}
                className="w-full p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 text-left transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-xs font-medium text-slate-200">API Test Console</div>
                    <div className="text-[11px] text-slate-400">Auto cURL generator & live sandbox</div>
                  </div>
                </div>
                <span className="text-xs text-slate-400">→</span>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Project ID:</span>
            <span className="font-mono text-slate-200">YOUR_PROJECT_ID</span>
          </div>
        </div>

        {/* Live SMS Transmissions Log */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Recent Transmissions</h3>
              <p className="text-xs text-slate-400">Latest SMS jobs received and queued by gateway.</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('logs')}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              View Full Logs →
            </button>
          </div>

          {recentLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-lg">
              No SMS jobs dispatched yet. Use "Send Single SMS" or "API Console" to test.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2 font-medium">Job ID</th>
                    <th className="pb-2 font-medium">Recipient</th>
                    <th className="pb-2 font-medium">Device / SIM</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {recentLogs.map((log) => (
                    <tr key={log.logId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 text-indigo-400 font-semibold">{log.jobId}</td>
                      <td className="py-2.5 text-slate-200">{log.recipient}</td>
                      <td className="py-2.5 text-slate-400">
                        {log.deviceId} (SIM {log.simSlot})
                      </td>
                      <td className="py-2.5">
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
                      <td className="py-2.5 text-right text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
