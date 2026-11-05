/**
 * HWX Gateway - SIM Management Portal
 * Cellular status, multi-SIM slots, carrier networks, and health states
 */
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Device, SimCard } from '../types';
import { NavTab } from '../components/Sidebar';
import {
  CreditCard,
  RefreshCw,
  Signal,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Info,
} from 'lucide-react';

interface SimManagementProps {
  onNavigate: (tab: NavTab) => void;
}

export const SimManagement: React.FC<SimManagementProps> = ({ onNavigate }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSims = async () => {
    setLoading(true);
    try {
      const data = await api.getDevices();
      if (data?.devices) {
        setDevices(data.devices);
      }
    } catch (err) {
      console.error('Failed to load SIMs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSims();
  }, []);

  const allSims: Array<SimCard & { deviceName: string; isDeviceOnline: boolean }> = [];
  devices.forEach((d) => {
    (d.sims || []).forEach((s) => {
      allSims.push({
        ...s,
        deviceName: d.name,
        isDeviceOnline: d.isOnline,
      });
    });
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">SIM Management & Cellular Inventory</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor SIM cards reported by connected Android devices, network health, and carrier routing.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSims}
          className="p-2 text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors self-start sm:self-auto"
          title="Refresh SIMs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Operator & Android Notice */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-slate-200 font-semibold block">Android Cellular Reporting Principles</span>
          <p className="text-[11px] leading-relaxed">
            Standard Android APIs do not expose prepaid balance. Balance is never falsely reported unless confirmed by an operator integration. If a carrier restricts phone number readout, "Not Available" is respectfully displayed.
          </p>
        </div>
      </div>

      {/* SIM Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {allSims.length === 0 && !loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <CreditCard className="w-8 h-8 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-300">No SIM cards discovered</p>
            <p className="text-[11px] text-slate-400 mt-1 mb-4">
              Connect an Android device with one or two active SIM cards to start routing SMS.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('add-device')}
              className="px-3.5 py-2 bg-indigo-600 text-white rounded-lg text-xs"
            >
              Add Android Device
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="py-3 px-4">Device</th>
                  <th className="py-3 px-4">Slot</th>
                  <th className="py-3 px-4">Carrier</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Network</th>
                  <th className="py-3 px-4">SMS Permission</th>
                  <th className="py-3 px-4">Health Status</th>
                  <th className="py-3 px-4 text-right">Last Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {allSims.map((sim) => (
                  <tr key={sim.simId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-200 font-sans font-medium">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{sim.deviceName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{sim.deviceId}</div>
                    </td>
                    <td className="py-3 px-4 text-indigo-400 font-bold">Slot {sim.simSlot}</td>
                    <td className="py-3 px-4 text-slate-200">{sim.carrierName}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {sim.phoneNumber || (
                        <span className="text-slate-400 italic font-sans text-[11px]">Not Available</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Signal className="w-3 h-3 text-slate-400" />
                        <span>{sim.networkStatus}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {sim.smsPermission ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Granted
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Denied
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          sim.availability === 'Available'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {sim.availability}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {new Date(sim.lastHealthUpdateAt).toLocaleTimeString()}
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
