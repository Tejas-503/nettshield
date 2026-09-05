import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  Edit2,
  Lock,
  Plus,
  Power,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import type { FirewallPolicy, NetworkInterface, TrafficAction } from '../../types/firewall';
import { IMPLICIT_DENY_POLICY } from '../../utils/firewallEngine';

interface PolicyListViewProps {
  policies: FirewallPolicy[];
  onAddPolicy: () => void;
  onEditPolicy: (policy: FirewallPolicy) => void;
  onDeletePolicy: (id: number) => void;
  onTogglePolicy: (id: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export const PolicyListView: React.FC<PolicyListViewProps> = ({
  policies,
  onAddPolicy,
  onEditPolicy,
  onDeletePolicy,
  onTogglePolicy,
  onMoveUp,
  onMoveDown,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<'ALL' | TrafficAction>('ALL');
  const [interfaceFilter, setInterfaceFilter] = useState<'ALL' | NetworkInterface>('ALL');

  const filteredPolicies = policies.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.srcSubnet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.dstSubnet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.service.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || p.action === actionFilter;
    const matchesInterface =
      interfaceFilter === 'ALL' ||
      p.srcInterface === interfaceFilter ||
      p.dstInterface === interfaceFilter;

    return matchesSearch && matchesAction && matchesInterface;
  });

  const getInterfaceBadge = (intf: NetworkInterface) => {
    switch (intf) {
      case 'LAN':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'WAN':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'DMZ':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Principle Callout */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 flex items-start space-x-3 text-xs">
        <div className="p-2 rounded bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 border border-amber-500/30">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-200 text-sm mb-0.5">
            NETSHIELD Sequential First-Match Rule Processing
          </h3>
          <p className="text-slate-400 leading-relaxed">
            Policies are evaluated sequentially from <span className="text-sky-300 font-semibold">top to bottom</span> (Sequence #1 downwards). The very <span className="text-emerald-300 font-semibold">first matching policy</span> dictates packet fate (ALLOW or DENY). If no rules match, the packet falls through to the <span className="text-red-400 font-semibold">NETSHIELD Implicit Deny Rule 0</span>. Use the <ArrowUp className="w-3 h-3 inline text-slate-300" /> and <ArrowDown className="w-3 h-3 inline text-slate-300" /> priority buttons to adjust sequence ordering.
          </p>
        </div>
      </div>

      {/* Action Toolbar & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search policy name, IP, subnet, service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
            />
          </div>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as 'ALL' | TrafficAction)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Actions</option>
            <option value="ALLOW">Allow Only</option>
            <option value="DENY">Deny Only</option>
          </select>

          {/* Interface Filter */}
          <select
            value={interfaceFilter}
            onChange={(e) => setInterfaceFilter(e.target.value as 'ALL' | NetworkInterface)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Interfaces</option>
            <option value="LAN">LAN</option>
            <option value="WAN">WAN</option>
            <option value="DMZ">DMZ</option>
          </select>
        </div>

        {/* Create Policy Button */}
        <button
          onClick={onAddPolicy}
          className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-500 text-white font-bold px-3.5 py-1.5 rounded shadow shadow-red-950/40 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Policy</span>
        </button>
      </div>

      {/* Policy Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold tracking-wider uppercase text-[10px]">
                <th className="py-2.5 px-3 w-16 text-center">Seq</th>
                <th className="py-2.5 px-3 w-14">ID</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">In / Out</th>
                <th className="py-2.5 px-3">Source IP/Subnet</th>
                <th className="py-2.5 px-3">Destination IP</th>
                <th className="py-2.5 px-3">Service</th>
                <th className="py-2.5 px-3 text-center">Action</th>
                <th className="py-2.5 px-3 text-center">Hits</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Priority</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPolicies.map((p, index) => {
                const originalIndex = policies.findIndex((item) => item.id === p.id);
                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      p.enabled
                        ? 'hover:bg-slate-800/40'
                        : 'opacity-50 bg-slate-950/40'
                    }`}
                  >
                    {/* Sequence */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                      #{index + 1}
                    </td>

                    {/* ID */}
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {p.id}
                    </td>

                    {/* Name */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">{p.name}</div>
                      {p.comments && (
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">
                          {p.comments}
                        </div>
                      )}
                    </td>

                    {/* In / Out Interfaces */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1 font-mono text-[11px]">
                        <span
                          className={`px-1.5 py-0.5 rounded border text-[10px] ${getInterfaceBadge(
                            p.srcInterface
                          )}`}
                        >
                          {p.srcInterface}
                        </span>
                        <span className="text-slate-500">→</span>
                        <span
                          className={`px-1.5 py-0.5 rounded border text-[10px] ${getInterfaceBadge(
                            p.dstInterface
                          )}`}
                        >
                          {p.dstInterface}
                        </span>
                      </div>
                    </td>

                    {/* Source Subnet */}
                    <td className="py-3 px-3 font-mono text-sky-400">
                      {p.srcSubnet}
                    </td>

                    {/* Destination Subnet */}
                    <td className="py-3 px-3 font-mono text-indigo-400">
                      {p.dstSubnet}
                    </td>

                    {/* Service */}
                    <td className="py-3 px-3">
                      <span className="font-mono bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700 text-[11px]">
                        {p.service}
                        {p.customPort ? `:${p.customPort}` : ''}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          p.action === 'ALLOW'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                            : 'bg-red-950/60 text-red-400 border-red-500/40'
                        }`}
                      >
                        {p.action === 'ALLOW' ? (
                          <Check className="w-3 h-3 mr-1" />
                        ) : (
                          <X className="w-3 h-3 mr-1" />
                        )}
                        {p.action}
                      </span>
                    </td>

                    {/* Hits */}
                    <td className="py-3 px-3 text-center">
                      <div className="font-mono text-slate-300 font-semibold">
                        {p.hitCount.toLocaleString()}
                      </div>
                      {p.lastHit && (
                        <div className="text-[9px] text-slate-400">{p.lastHit}</div>
                      )}
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onTogglePolicy(p.id)}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                          p.enabled
                            ? 'text-emerald-400 hover:bg-emerald-950/50'
                            : 'text-slate-500 hover:bg-slate-800'
                        }`}
                        title={p.enabled ? 'Disable Policy' : 'Enable Policy'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Reorder Buttons */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          disabled={originalIndex === 0}
                          onClick={() => onMoveUp(originalIndex)}
                          className={`p-1 rounded cursor-pointer ${
                            originalIndex === 0
                              ? 'text-slate-700 cursor-not-allowed'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                          title="Move Policy Up (Higher Priority)"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={originalIndex === policies.length - 1}
                          onClick={() => onMoveDown(originalIndex)}
                          className={`p-1 rounded cursor-pointer ${
                            originalIndex === policies.length - 1
                              ? 'text-slate-700 cursor-not-allowed'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                          title="Move Policy Down (Lower Priority)"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Edit / Delete */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onEditPolicy(p)}
                          className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Edit Policy"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeletePolicy(p.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Delete Policy"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Pinned Built-in FortiGate Implicit Deny Rule */}
              <tr className="bg-red-950/20 border-t-2 border-red-900/60 font-mono">
                <td className="py-3 px-3 text-center text-red-400 font-bold">
                  Rule 0
                </td>
                <td className="py-3 px-3 text-red-400 font-bold">0</td>
                <td className="py-3 px-3">
                  <div className="font-bold text-red-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-red-400" />
                    <span>{IMPLICIT_DENY_POLICY.name}</span>
                  </div>
                  <div className="text-[10px] text-red-400/80 font-sans">
                    Permanent bottom drop rule (NETSHIELD catch-all for unmatched traffic)
                  </div>
                </td>
                <td className="py-3 px-3 text-slate-400">any → any</td>
                <td className="py-3 px-3 text-slate-400">all</td>
                <td className="py-3 px-3 text-slate-400">all</td>
                <td className="py-3 px-3">
                  <span className="bg-red-950/60 text-red-300 px-2 py-0.5 rounded border border-red-800/60 text-[11px]">
                    ALL
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-900/60 text-red-200 border border-red-500/50">
                    <X className="w-3 h-3 mr-1" />
                    DENY
                  </span>
                </td>
                <td className="py-3 px-3 text-center text-slate-400 font-sans text-[11px]">
                  Default
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="text-emerald-400 text-[11px] font-sans">Locked</span>
                </td>
                <td className="py-3 px-3 text-center text-slate-600">
                  Bottom
                </td>
                <td className="py-3 px-3 text-right text-slate-600 pr-4">
                  Built-in
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
