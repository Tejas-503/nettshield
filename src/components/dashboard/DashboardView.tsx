import React from 'react';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Layers,
  Network,
  Play,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import type { FirewallPolicy, TrafficLog } from '../../types/firewall';

interface DashboardViewProps {
  policies: FirewallPolicy[];
  logs: TrafficLog[];
  onNavigateToSimulator: () => void;
  onNavigateToPolicies: () => void;
  onNavigateToLogs: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  policies,
  logs,
  onNavigateToSimulator,
  onNavigateToPolicies,
  onNavigateToLogs,
}) => {
  const activePolicies = policies.filter((p) => p.enabled).length;
  const disabledPolicies = policies.length - activePolicies;

  const totalAllowed = logs.filter((l) => l.action === 'ALLOW').length;
  const totalBlocked = logs.filter((l) => l.action === 'DENY').length;
  const totalEvents = logs.length;
  const allowPercentage = totalEvents > 0 ? Math.round((totalAllowed / totalEvents) * 100) : 0;
  const blockPercentage = totalEvents > 0 ? 100 - allowPercentage : 0;

  // Top hit policy
  const topPolicy = [...policies].sort((a, b) => b.hitCount - a.hitCount)[0];

  return (
    <div className="space-y-5 select-none">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/30 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                NETSHIELD Security Operations Center (SOC)
              </h2>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
                NORMAL OPERATIONS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Next-Generation Firewall (NGFW) policy inspection engine is active with{' '}
              <span className="text-slate-200 font-semibold">{activePolicies} enforcement rules</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onNavigateToSimulator}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-md shadow-red-950/50 transition-all active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Traffic Simulator</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Rules */}
        <div
          onClick={onNavigateToPolicies}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Enforced Policies
            </span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white font-mono">
              {activePolicies}
            </span>
            <span className="text-xs text-slate-400">
              / {policies.length} Total
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>{disabledPolicies} rules disabled</span>
            <span className="text-sky-400 flex items-center group-hover:translate-x-0.5 transition-transform">
              View table <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Card 2: Permitted Traffic */}
        <div
          onClick={onNavigateToLogs}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Accepted Traffic
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {totalAllowed}
            </span>
            <span className="text-xs text-emerald-400/80 font-mono">
              ({allowPercentage}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Corporate & DMZ flows</span>
            <span className="text-emerald-400 flex items-center group-hover:translate-x-0.5 transition-transform">
              Inspect logs <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Card 3: Blocked Threats */}
        <div
          onClick={onNavigateToLogs}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Dropped / Denied
            </span>
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-red-400 font-mono">
              {totalBlocked}
            </span>
            <span className="text-xs text-red-400/80 font-mono">
              ({blockPercentage}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Perimeter drops & Rule 0</span>
            <span className="text-red-400 flex items-center group-hover:translate-x-0.5 transition-transform">
              Threat log <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Card 4: Top Hit Rule */}
        <div
          onClick={onNavigateToPolicies}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Top Active Policy
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-white truncate" title={topPolicy?.name}>
            {topPolicy?.name || 'No Hits Yet'}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span className="font-mono text-amber-400 font-semibold">
              {topPolicy ? topPolicy.hitCount.toLocaleString() : 0} Hits
            </span>
            <span className="text-amber-400 flex items-center group-hover:translate-x-0.5 transition-transform">
              ID #{topPolicy?.id} <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: Traffic Ratio & Physical Interfaces */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Allow vs Deny Ratio */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <span>Security Disposition</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {totalEvents} samples
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Real-time ratio between accepted authorized traffic flows vs perimeter blocked attacks.
            </p>

            {/* Visual ratio bar */}
            <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden flex border border-slate-800 mb-3">
              <div
                className="bg-emerald-500 h-full transition-all duration-700 relative group"
                style={{ width: `${allowPercentage}%` }}
              />
              <div
                className="bg-red-500 h-full transition-all duration-700 relative group"
                style={{ width: `${blockPercentage}%` }}
              />
            </div>

            <div className="flex justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>ALLOW: {allowPercentage}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                <span>DENY: {blockPercentage}%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            Enforcing strict zero-trust default drop on unmatched traffic.
          </div>
        </div>

        {/* Physical Interface Gauges */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-400" />
              <span>Hardware Physical Interfaces</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ALL PORTS OPERATIONAL
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* port1 LAN */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-white">port1 [LAN]</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-mono px-1.5 py-0.5 rounded">
                  UP
                </span>
              </div>
              <div className="text-[11px] text-sky-400 font-mono">192.168.1.1/24</div>
              <div className="text-[10px] text-slate-400 mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Speed:</span>
                  <span className="font-mono text-slate-300">1000 Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span>Duplex:</span>
                  <span className="font-mono text-slate-300">Full</span>
                </div>
                <div className="flex justify-between">
                  <span>Zone:</span>
                  <span className="text-slate-300">Internal Trust</span>
                </div>
              </div>
            </div>

            {/* port2 WAN */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-white">port2 [WAN]</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-mono px-1.5 py-0.5 rounded">
                  UP
                </span>
              </div>
              <div className="text-[11px] text-purple-400 font-mono">198.51.100.1</div>
              <div className="text-[10px] text-slate-400 mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Speed:</span>
                  <span className="font-mono text-slate-300">1000 Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span>Duplex:</span>
                  <span className="font-mono text-slate-300">Full</span>
                </div>
                <div className="flex justify-between">
                  <span>Zone:</span>
                  <span className="text-slate-300">Untrusted Ext</span>
                </div>
              </div>
            </div>

            {/* dmz */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-white">dmz</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-mono px-1.5 py-0.5 rounded">
                  UP
                </span>
              </div>
              <div className="text-[11px] text-amber-400 font-mono">172.16.1.1/24</div>
              <div className="text-[10px] text-slate-400 mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Speed:</span>
                  <span className="font-mono text-slate-300">1000 Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span>Duplex:</span>
                  <span className="font-mono text-slate-300">Full</span>
                </div>
                <div className="flex justify-between">
                  <span>Zone:</span>
                  <span className="text-slate-300">Isolated DMZ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Traffic Log Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Real-time Forward Traffic Activity</span>
          </h3>
          <button
            onClick={onNavigateToLogs}
            className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Full Log Stream</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-800">
                <th className="py-2 px-3">Time</th>
                <th className="py-2 px-3">Source (In)</th>
                <th className="py-2 px-3">Destination (Out)</th>
                <th className="py-2 px-3">Service</th>
                <th className="py-2 px-3 text-center">Verdict</th>
                <th className="py-2 px-3">Rule Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {logs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 text-slate-400">{log.timestamp}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-sky-400 font-semibold">{log.srcIp}</span>{' '}
                    <span className="text-[10px] text-slate-500 font-sans">
                      [{log.srcInterface}]
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-indigo-400 font-semibold">{log.dstIp}</span>{' '}
                    <span className="text-[10px] text-slate-500 font-sans">
                      [{log.dstInterface}]
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                      {log.service}:{log.port}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        log.action === 'ALLOW'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                          : 'bg-red-950/60 text-red-400 border-red-500/40'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-300">
                    {log.policyName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
