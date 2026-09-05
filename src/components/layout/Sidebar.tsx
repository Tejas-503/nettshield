import React from 'react';
import {
  Cpu,
  FileText,
  LayoutDashboard,
  Network,
  Shield,
  Sliders,
} from 'lucide-react';

export type TabType = 'dashboard' | 'policies' | 'simulator' | 'logs';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  policyCount: number;
  logCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  policyCount,
  logCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'policies' as TabType,
      label: 'Firewall Policy',
      icon: Shield,
      badge: policyCount,
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30',
    },
    {
      id: 'simulator' as TabType,
      label: 'Traffic Simulator',
      icon: Cpu,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse',
    },
    {
      id: 'logs' as TabType,
      label: 'Log & Report',
      icon: FileText,
      badge: logCount > 0 ? logCount : null,
      badgeColor: 'bg-slate-700 text-slate-300',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between select-none shrink-0 min-h-[calc(100vh-53px)]">
      <div>
        {/* Navigation Section */}
        <div className="p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 flex items-center gap-1.5">
            <Sliders className="w-3 h-3" />
            <span>Policy & Objects</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-red-600/15 text-white border-l-4 border-red-500 pl-2 font-semibold shadow-sm shadow-red-950/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-red-400' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Network Interfaces Status */}
        <div className="px-3 pt-3 border-t border-slate-800/80">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Network className="w-3 h-3" />
              <span>Interfaces (Physical)</span>
            </div>
            <span className="text-[9px] text-emerald-400 font-mono">3 UP</span>
          </div>

          <div className="space-y-1.5 px-2">
            {/* port1 LAN */}
            <div className="bg-slate-950/70 border border-slate-800 rounded p-2 text-[11px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-semibold text-slate-200">port1 [LAN]</span>
                </div>
                <span className="text-[9px] font-mono bg-slate-800 text-slate-300 px-1 rounded">
                  1G / Full
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1 flex justify-between">
                <span>192.168.1.1/24</span>
                <span className="text-emerald-400 font-sans">Active</span>
              </div>
            </div>

            {/* port2 WAN */}
            <div className="bg-slate-950/70 border border-slate-800 rounded p-2 text-[11px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-semibold text-slate-200">port2 [WAN]</span>
                </div>
                <span className="text-[9px] font-mono bg-slate-800 text-slate-300 px-1 rounded">
                  1G / Full
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1 flex justify-between">
                <span>198.51.100.1</span>
                <span className="text-emerald-400 font-sans">Gateway</span>
              </div>
            </div>

            {/* dmz */}
            <div className="bg-slate-950/70 border border-slate-800 rounded p-2 text-[11px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-semibold text-slate-200">dmz</span>
                </div>
                <span className="text-[9px] font-mono bg-slate-800 text-slate-300 px-1 rounded">
                  1G / Full
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1 flex justify-between">
                <span>172.16.1.1/24</span>
                <span className="text-emerald-400 font-sans">Isolated</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appliance Hardware Info footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[10px] text-slate-400">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-400">Host:</span>
          <span className="font-mono text-slate-300 font-semibold">NS-EDGE-GW01</span>
        </div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-400">Serial:</span>
          <span className="font-mono text-slate-300">NS1000TK21004921</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Engine:</span>
          <span className="text-emerald-400 font-mono font-medium">NetShield v7.4.3</span>
        </div>
      </div>
    </aside>
  );
};
