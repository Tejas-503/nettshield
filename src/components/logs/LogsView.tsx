import React, { useState } from 'react';
import {
  Check,
  Download,
  Search,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import type {
  FirewallPolicy,
  NetworkInterface,
  ServiceType,
  TrafficAction,
  TrafficLog,
  TrafficPacket,
} from '../../types/firewall';
import { evaluatePacket } from '../../utils/firewallEngine';
import { exportLogsToCsv } from '../../utils/storage';

interface LogsViewProps {
  logs: TrafficLog[];
  policies: FirewallPolicy[];
  onClearLogs: () => void;
  onAddLogs: (newLogs: TrafficLog[]) => void;
  onUpdatePolicyHits: (policyId: number) => void;
}

export const LogsView: React.FC<LogsViewProps> = ({
  logs,
  policies,
  onClearLogs,
  onAddLogs,
  onUpdatePolicyHits,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<'ALL' | TrafficAction>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      log.srcIp.toLowerCase().includes(term) ||
      log.dstIp.toLowerCase().includes(term) ||
      log.policyName.toLowerCase().includes(term) ||
      log.service.toLowerCase().includes(term);

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesService = serviceFilter === 'ALL' || log.service === serviceFilter;

    return matchesSearch && matchesAction && matchesService;
  });

  const totalAllowed = logs.filter((l) => l.action === 'ALLOW').length;
  const totalBlocked = logs.filter((l) => l.action === 'DENY').length;
  const totalBytes = logs.reduce((sum, l) => sum + l.bytes, 0);

  // Generate a live batch of realistic traffic simulations
  const handleGenerateBurst = () => {
    setIsGenerating(true);
    const sampleEndpoints = [
      { srcIp: '192.168.1.105', srcInt: 'LAN' as NetworkInterface, dstIp: '142.250.190.46', dstInt: 'WAN' as NetworkInterface, svc: 'HTTPS' as ServiceType, port: 443 },
      { srcIp: '192.168.1.120', srcInt: 'LAN' as NetworkInterface, dstIp: '8.8.8.8', dstInt: 'WAN' as NetworkInterface, svc: 'DNS' as ServiceType, port: 53 },
      { srcIp: '198.51.100.89', srcInt: 'WAN' as NetworkInterface, dstIp: '192.168.1.1', dstInt: 'LAN' as NetworkInterface, svc: 'SSH' as ServiceType, port: 22 },
      { srcIp: '203.0.113.44', srcInt: 'WAN' as NetworkInterface, dstIp: '192.168.1.50', dstInt: 'LAN' as NetworkInterface, svc: 'RDP' as ServiceType, port: 3389 },
      { srcIp: '192.168.1.50', srcInt: 'LAN' as NetworkInterface, dstIp: '172.16.1.10', dstInt: 'DMZ' as NetworkInterface, svc: 'SSH' as ServiceType, port: 22 },
      { srcIp: '45.33.32.156', srcInt: 'WAN' as NetworkInterface, dstIp: '192.168.1.99', dstInt: 'LAN' as NetworkInterface, svc: 'CUSTOM' as ServiceType, port: 8088 },
    ];

    const newLogs: TrafficLog[] = [];

    sampleEndpoints.forEach((ep, i) => {
      const packet: TrafficPacket = {
        srcIp: ep.srcIp,
        dstIp: ep.dstIp,
        srcInterface: ep.srcInt,
        dstInterface: ep.dstInt,
        service: ep.svc,
        port: ep.port,
        protocol: ep.svc === 'DNS' ? 'UDP' : 'TCP',
      };

      const result = evaluatePacket(packet, policies);
      if (result.matchedPolicy && result.matchedPolicy.id !== 0) {
        onUpdatePolicyHits(result.matchedPolicy.id);
      }

      newLogs.push({
        id: `burst-${Date.now()}-${i}`,
        timestamp: new Date(Date.now() - i * 3000).toLocaleTimeString(),
        srcIp: packet.srcIp,
        dstIp: packet.dstIp,
        srcInterface: packet.srcInterface,
        dstInterface: packet.dstInterface,
        service: packet.service,
        port: packet.port,
        protocol: packet.protocol,
        action: result.action,
        policyId: result.matchedPolicy ? result.matchedPolicy.id : 0,
        policyName: result.matchedPolicy ? result.matchedPolicy.name : 'Implicit Deny (Rule 0)',
        bytes: Math.floor(Math.random() * 4500) + 72,
        status: result.action === 'ALLOW' ? 'Accepted' : 'Blocked',
      });
    });

    setTimeout(() => {
      onAddLogs(newLogs);
      setIsGenerating(false);
    }, 400);
  };

  return (
    <div className="space-y-4">
      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-slate-400 text-[10px] uppercase font-bold">Total Events</div>
          <div className="text-lg font-bold text-white font-mono mt-0.5">
            {logs.length.toLocaleString()}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-emerald-400 text-[10px] uppercase font-bold">Accepted Traffic</div>
          <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
            {totalAllowed.toLocaleString()}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-red-400 text-[10px] uppercase font-bold">Blocked / Denied</div>
          <div className="text-lg font-bold text-red-400 font-mono mt-0.5">
            {totalBlocked.toLocaleString()}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-sky-400 text-[10px] uppercase font-bold">Volume Sampled</div>
          <div className="text-lg font-bold text-sky-400 font-mono mt-0.5">
            {(totalBytes / 1024).toFixed(1)} KB
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Source IP, Target IP, Policy..."
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
            <option value="ALLOW">Accepted Only</option>
            <option value="DENY">Blocked Only</option>
          </select>

          {/* Service Filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Services</option>
            <option value="HTTPS">HTTPS</option>
            <option value="HTTP">HTTP</option>
            <option value="DNS">DNS</option>
            <option value="SSH">SSH</option>
            <option value="RDP">RDP</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-2">
          <button
            disabled={isGenerating}
            onClick={handleGenerateBurst}
            className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-3 py-1.5 rounded transition-all cursor-pointer text-xs"
            title="Simulate a real-time burst of packet traffic"
          >
            <Zap className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Generate Traffic Burst</span>
          </button>

          <button
            onClick={() => exportLogsToCsv(filteredLogs)}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded border border-slate-700 transition-colors cursor-pointer text-xs"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onClearLogs}
            className="flex items-center space-x-1 text-slate-400 hover:text-red-400 bg-slate-800/60 hover:bg-red-950/40 px-2.5 py-1.5 rounded border border-slate-700/80 transition-colors cursor-pointer text-xs"
            title="Clear Log History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Log Entries Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold tracking-wider uppercase text-[10px]">
                <th className="py-2.5 px-3 w-28">Timestamp</th>
                <th className="py-2.5 px-3">Source (In)</th>
                <th className="py-2.5 px-3">Destination (Out)</th>
                <th className="py-2.5 px-3">Service / Port</th>
                <th className="py-2.5 px-3 text-center">Action</th>
                <th className="py-2.5 px-3">Matched Policy</th>
                <th className="py-2.5 px-3 text-right">Bytes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    No log events match current filters. Use the Traffic Simulator or click
                    "Generate Traffic Burst".
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Timestamp */}
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {log.timestamp}
                    </td>

                    {/* Source */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-sky-400 font-semibold">{log.srcIp}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded font-sans">
                          {log.srcInterface}
                        </span>
                      </div>
                    </td>

                    {/* Destination */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-indigo-400 font-semibold">{log.dstIp}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded font-sans">
                          {log.dstInterface}
                        </span>
                      </div>
                    </td>

                    {/* Service & Port */}
                    <td className="py-2.5 px-3">
                      <span className="bg-slate-950 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800 text-[11px]">
                        {log.service}:{log.port}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          log.action === 'ALLOW'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                            : 'bg-red-950/60 text-red-400 border-red-500/40'
                        }`}
                      >
                        {log.action === 'ALLOW' ? (
                          <Check className="w-3 h-3 mr-1" />
                        ) : (
                          <X className="w-3 h-3 mr-1" />
                        )}
                        {log.action}
                      </span>
                    </td>

                    {/* Matched Policy */}
                    <td className="py-2.5 px-3 font-sans">
                      <div className="text-slate-200 font-medium text-xs">
                        {log.policyName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Rule ID #{log.policyId}
                      </div>
                    </td>

                    {/* Bytes */}
                    <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                      {log.bytes.toLocaleString()} B
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
