/**
 * HWX Gateway - Connected Android Devices Management
 * Hardware inventory, SIM slots, online presence, and credential revocation
 */
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Device } from '../types';
import { NavTab } from '../components/Sidebar';
import {
  Smartphone,
  PlusCircle,
  RefreshCw,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  BatteryCharging,
  CreditCard,
  Wifi,
  ExternalLink,
} from 'lucide-react';

interface DevicesProps {
  onNavigate: (tab: NavTab) => void;
}

export const Devices: React.FC<DevicesProps> = ({ onNavigate }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const data = await api.getDevices();
      if (data?.devices) {
        setDevices(data.devices);
      }
    } catch (err: any) {
      console.error('Error fetching devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleRename = async (deviceId: string) => {
    if (!editName.trim()) return;
    try {
      await api.renameDevice(deviceId, editName.trim());
      setActionMsg(`Device renamed to "${editName.trim()}".`);
      setEditingDeviceId(null);
      fetchDevices();
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to rename device');
    }
  };

  const handleDelete = async (deviceId: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke and delete device "${name}"? It will no longer receive SMS jobs.`)) {
      return;
    }
    try {
      await api.deleteDevice(deviceId);
      setActionMsg(`Device "${name}" has been revoked.`);
      fetchDevices();
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete device');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Connected Android Gateways</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Physical Android phones paired as cellular SMS gateways with multi-SIM support.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchDevices}
            className="p-2 text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
            title="Refresh devices"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('add-device')}
            className="px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Device</span>
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-300 text-xs">
          {actionMsg}
        </div>
      )}

      {/* Device List */}
      {devices.length === 0 && !loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="inline-flex p-3 rounded-xl bg-slate-800 text-slate-400 mb-4">
            <Smartphone className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">No Android Gateways Connected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Pair an Android device using the QR code or manual pairing code to enable SMS dispatching from your website and API.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('add-device')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Pair First Device Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices.map((device) => {
            const isOnline = device.isOnline;
            const sims = device.sims || [];

            return (
              <div
                key={device.deviceId}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        {editingDeviceId === device.deviceId ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleRename(device.deviceId)}
                              className="text-xs px-2 py-1 bg-indigo-600 text-white rounded"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingDeviceId(null)}
                              className="text-xs text-slate-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-slate-100">{device.name}</h3>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDeviceId(device.deviceId);
                                setEditName(device.name);
                              }}
                              className="text-slate-400 hover:text-slate-200"
                              title="Rename device"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                          <span>{device.deviceId}</span>
                          <span aria-hidden="true">·</span>
                          <span>{device.model}</span>
                        </div>
                      </div>
                    </div>

                    {/* Online status indicator */}
                    <div className="flex items-center gap-1.5 text-xs">
                      {isOnline ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                          Online
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-slate-600 inline-block"></span>
                          Offline
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Device Specs & Health */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400">Android: </span>
                      <span className="text-slate-200">{device.androidVersion}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">FCM Push: </span>
                      <span className={device.fcmToken ? 'text-emerald-400' : 'text-amber-400'}>
                        {device.fcmToken ? 'Registered' : 'Waiting Token'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">SMS Permission: </span>
                      <span className={device.smsPermissionGranted ? 'text-emerald-400' : 'text-red-400'}>
                        {device.smsPermissionGranted ? 'Granted' : 'Denied'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Last Seen: </span>
                      <span className="text-slate-200">
                        {new Date(device.lastSeenAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {/* SIM Slots */}
                  <div className="mt-4">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Detected SIM Cards ({sims.length})
                    </div>
                    <div className="space-y-1.5">
                      {sims.map((sim) => (
                        <div
                          key={sim.simId}
                          className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="font-semibold text-slate-200">Slot {sim.simSlot}:</span>
                            <span className="text-slate-300">{sim.carrierName}</span>
                            {sim.phoneNumber && (
                              <span className="text-slate-400 font-mono text-[11px]">{sim.phoneNumber}</span>
                            )}
                          </div>
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                              sim.availability === 'Available'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {sim.availability}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Paired: {new Date(device.pairedAt).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(device.deviceId, device.name)}
                    className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 px-2.5 py-1.5 rounded transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke Device</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
