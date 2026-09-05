import React, { useEffect, useState, memo } from 'react';
import {
  Activity,
  AlertTriangle,
  Cpu,
  Download,
  HardDrive,
  Play,
  RotateCcw,
  Shield,
  Zap,
} from 'lucide-react';
import type { TrafficLog } from '../../types/firewall';
import { exportLogsToCsv } from '../../utils/storage';

interface HeaderProps {
  onQuickSimulate: () => void;
  onResetDefaults: () => void;
  logs: TrafficLog[];
  activeTab: string;
}

// Isolated system metrics component to avoid re-rendering entire header
const SystemMetricsBar = memo(() => {
  const [cpu, setCpu] = useState(14);
  const [mem, setMem] = useState(42);
  const [sessions, setSessions] = useState(1482);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpu((prev) => Math.max(8, Math.min(32, prev + (Math.floor(Math.random() * 5) - 2))));
      setMem((prev) => Math.max(38, Math.min(50, prev + (Math.floor(Math.random() * 3) - 1))));
      setSessions((prev) => Math.max(1200, Math.min(1800, prev + (Math.floor(Math.random() * 7) - 3))));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden lg:flex items-center space-x-6 text-xs bg-slate-950/60 px-4 py-1.5 rounded-lg border border-slate-800/80">
      {/* CPU */}
      <div className="flex items-center space-x-2">
        <Cpu className="w-3.5 h-3.5 text-sky-400" />
        <div>
          <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
            <span>CPU</span>
            <span className="font-mono text-slate-200 font-semibold">{cpu}%</span>
          </div>
          <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-sky-500 h-full transition-all duration-700 rounded-full"
              style={{ width: `${cpu}%` }}
            />
          </div>
        </div>
      </div>

      {/* Memory */}
      <div className="flex items-center space-x-2">
        <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
        <div>
          <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
            <span>MEM</span>
            <span className="font-mono text-slate-200 font-semibold">{mem}%</span>
          </div>
          <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full transition-all duration-700 rounded-full"
              style={{ width: `${mem}%` }}
            />
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="flex items-center space-x-2">
        <Activity className="w-3.5 h-3.5 text-emerald-400" />
        <div>
          <div className="text-[10px] text-slate-400">Sessions</div>
          <div className="font-mono font-semibold text-emerald-400">
            {sessions.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Throughput */}
      <div className="flex items-center space-x-2">
        <Zap className="w-3.5 h-3.5 text-amber-400" />
        <div>
          <div className="text-[10px] text-slate-400">Throughput</div>
          <div className="font-mono font-semibold text-amber-400">418.5 Mbps</div>
        </div>
      </div>
    </div>
  );
});

export const Header: React.FC<HeaderProps> = memo(({
  onQuickSimulate,
  onResetDefaults,
  logs,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 text-slate-200 px-4 py-2.5 sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 select-none">
      {/* Brand & Model */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-black text-sm shadow-md shadow-red-900/40">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-white text-base">
                NETSHIELD
              </span>
              <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-xs px-2 py-0.5 rounded font-mono font-semibold">
                NS-1000
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
              <span>NetShield OS v7.4.3</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                HA: Standalone
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live System Resource Monitors (Isolated) */}
      <SystemMetricsBar />

      {/* Top Quick Actions */}
      <div className="flex items-center space-x-2.5">
        <button
          onClick={onQuickSimulate}
          className="flex items-center space-x-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold px-3 py-1.5 rounded shadow shadow-red-900/40 transition-all active:scale-95 cursor-pointer"
          title="Open Packet Simulator"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Simulate Packet</span>
        </button>

        <button
          onClick={() => exportLogsToCsv(logs)}
          className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium px-2.5 py-1.5 rounded border border-slate-700 transition-colors cursor-pointer"
          title="Export CSV Traffic Logs"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export Logs</span>
        </button>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center space-x-1.5 bg-slate-800/80 hover:bg-red-950/60 text-slate-400 hover:text-red-400 text-xs px-2.5 py-1.5 rounded border border-slate-700/80 hover:border-red-900/80 transition-colors cursor-pointer"
          title="Reset Policies to Factory Defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Reset Defaults</span>
        </button>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-red-500/40 rounded-lg p-5 max-w-sm w-full shadow-2xl shadow-red-950/50">
            <div className="flex items-center space-x-3 text-red-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-white text-base">Reset Factory Policies?</h3>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              This will erase any custom policies and restore the factory NetShield default
              rule set. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetDefaults();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
});
