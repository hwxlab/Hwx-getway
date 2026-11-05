/**
 * HWX Gateway - Sidebar Navigation Component
 * Responsive sidebar adhering to domain navigation, unboxed metadata, and clean icons.
 */
import React from 'react';
import {
  LayoutDashboard,
  Smartphone,
  PlusCircle,
  CreditCard,
  Send,
  Layers,
  Clock,
  FileText,
  Key,
  BookOpen,
  Terminal,
  Activity,
  Settings,
  ShieldCheck,
  X,
  Server,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'devices'
  | 'add-device'
  | 'sims'
  | 'send-sms'
  | 'bulk-sms'
  | 'jobs'
  | 'bulk-details'
  | 'logs'
  | 'keys'
  | 'docs'
  | 'console'
  | 'usage'
  | 'settings'
  | 'audit';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
  deviceCount?: number;
  activeJobCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  deviceCount = 0,
  activeJobCount = 0,
}) => {
  const navSections = [
    {
      title: 'Gateway Operations',
      items: [
        { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
        { id: 'devices' as NavTab, label: 'Devices', icon: Smartphone, badge: deviceCount > 0 ? deviceCount : undefined },
        { id: 'add-device' as NavTab, label: 'Add Device', icon: PlusCircle },
        { id: 'sims' as NavTab, label: 'SIM Management', icon: CreditCard },
      ],
    },
    {
      title: 'SMS Transmission',
      items: [
        { id: 'send-sms' as NavTab, label: 'Send Single SMS', icon: Send },
        { id: 'bulk-sms' as NavTab, label: 'Bulk SMS', icon: Layers },
        { id: 'jobs' as NavTab, label: 'SMS Jobs', icon: Clock, badge: activeJobCount > 0 ? activeJobCount : undefined },
        { id: 'logs' as NavTab, label: 'SMS Logs', icon: FileText },
      ],
    },
    {
      title: 'Developer Platform',
      items: [
        { id: 'keys' as NavTab, label: 'API Keys', icon: Key },
        { id: 'console' as NavTab, label: 'API Test Console', icon: Terminal },
        { id: 'docs' as NavTab, label: 'API Documentation', icon: BookOpen },
      ],
    },
    {
      title: 'Administration',
      items: [
        { id: 'usage' as NavTab, label: 'Usage & Limits', icon: Activity },
        { id: 'settings' as NavTab, label: 'Account Settings', icon: Settings },
        { id: 'audit' as NavTab, label: 'Security & Audit', icon: ShieldCheck },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              <Server className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-100 text-sm tracking-tight whitespace-nowrap">HWX Gateway</span>
              <span className="text-[11px] text-slate-400 font-mono">Android SMS Hub</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-100 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((sec) => (
            <div key={sec.title}>
              <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                {sec.title}
              </div>
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700 tabular-nums">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Hardware Node Status */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>Firebase DB:</span>
            <span className="font-mono text-amber-400">Configure Firebase</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Project:</span>
            <span className="font-mono text-slate-300">YOUR_PROJECT_ID</span>
          </div>
        </div>
      </aside>
    </>
  );
};
