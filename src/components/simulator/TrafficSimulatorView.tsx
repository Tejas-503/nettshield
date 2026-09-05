import React, { useState } from 'react';
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Cpu,
  FastForward,
  Info,
  Play,
  Sliders,
  Terminal,
  XCircle,
  Zap,
} from 'lucide-react';
import type {
  FirewallPolicy,
  NetworkInterface,
  ServiceType,
  SimulationResult,
  TrafficLog,
  TrafficPacket,
} from '../../types/firewall';
import { evaluatePacket } from '../../utils/firewallEngine';
import { isValidIp, STANDARD_SERVICES } from '../../utils/ipUtils';

interface TrafficSimulatorViewProps {
  policies: FirewallPolicy[];
  onLogGenerated: (log: TrafficLog) => void;
  onUpdatePolicyHits: (policyId: number) => void;
}

export const TrafficSimulatorView: React.FC<TrafficSimulatorViewProps> = ({
  policies,
  onLogGenerated,
  onUpdatePolicyHits,
}) => {
  const [srcIp, setSrcIp] = useState('192.168.1.45');
  const [srcInterface, setSrcInterface] = useState<NetworkInterface>('LAN');
  const [dstIp, setDstIp] = useState('142.250.190.46');
  const [dstInterface, setDstInterface] = useState<NetworkInterface>('WAN');
  const [service, setService] = useState<ServiceType>('HTTPS');
  const [customPort, setCustomPort] = useState<number>(8080);
  const [ipErrors, setIpErrors] = useState<{ src?: string; dst?: string }>({});

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  // Pre-configured real-world scenario presets
  const presets = [
    {
      label: 'LAN Web Browsing',
      subtitle: 'HTTPS to Google',
      icon: '🌐',
      data: {
        srcIp: '192.168.1.45',
        srcInterface: 'LAN' as NetworkInterface,
        dstIp: '142.250.190.46',
        dstInterface: 'WAN' as NetworkInterface,
        service: 'HTTPS' as ServiceType,
        port: 443,
      },
    },
    {
      label: 'Threat Actor Probe',
      subtitle: 'WAN SSH brute-force',
      icon: '⚠️',
      data: {
        srcIp: '198.51.100.22',
        srcInterface: 'WAN' as NetworkInterface,
        dstIp: '192.168.1.1',
        dstInterface: 'LAN' as NetworkInterface,
        service: 'SSH' as ServiceType,
        port: 22,
      },
    },
    {
      label: 'DNS Resolution',
      subtitle: 'LAN to Cloudflare 1.1.1.1',
      icon: '⚡',
      data: {
        srcIp: '192.168.1.45',
        srcInterface: 'LAN' as NetworkInterface,
        dstIp: '1.1.1.1',
        dstInterface: 'WAN' as NetworkInterface,
        service: 'DNS' as ServiceType,
        port: 53,
      },
    },
    {
      label: 'DevOps to DMZ Bastion',
      subtitle: 'Admin SSH to 172.16.1.10',
      icon: '🔒',
      data: {
        srcIp: '192.168.1.50',
        srcInterface: 'LAN' as NetworkInterface,
        dstIp: '172.16.1.10',
        dstInterface: 'DMZ' as NetworkInterface,
        service: 'SSH' as ServiceType,
        port: 22,
      },
    },
    {
      label: 'WAN Remote Desktop Probe',
      subtitle: 'External probe on RDP 3389',
      icon: '🚫',
      data: {
        srcIp: '203.0.113.88',
        srcInterface: 'WAN' as NetworkInterface,
        dstIp: '192.168.1.20',
        dstInterface: 'LAN' as NetworkInterface,
        service: 'RDP' as ServiceType,
        port: 3389,
      },
    },
    {
      label: 'Unsolicited MySQL Probe',
      subtitle: 'WAN to port 3306 (Implicit Deny)',
      icon: '🛑',
      data: {
        srcIp: '185.220.101.5',
        srcInterface: 'WAN' as NetworkInterface,
        dstIp: '192.168.1.80',
        dstInterface: 'LAN' as NetworkInterface,
        service: 'CUSTOM' as ServiceType,
        port: 3306,
      },
    },
  ];

  const applyPreset = (preset: (typeof presets)[0]) => {
    setSrcIp(preset.data.srcIp);
    setSrcInterface(preset.data.srcInterface);
    setDstIp(preset.data.dstIp);
    setDstInterface(preset.data.dstInterface);
    setService(preset.data.service);
    if (preset.data.service === 'CUSTOM') {
      setCustomPort(preset.data.port);
    }
    setIpErrors({});
  };

  const handleSimulate = () => {
    const errors: { src?: string; dst?: string } = {};

    if (!isValidIp(srcIp)) {
      errors.src = 'Must be a valid IPv4 address (e.g. 192.168.1.45)';
    }
    if (!isValidIp(dstIp)) {
      errors.dst = 'Must be a valid IPv4 address (e.g. 142.250.190.46)';
    }

    if (Object.keys(errors).length > 0) {
      setIpErrors(errors);
      return;
    }
    setIpErrors({});

    const port =
      service === 'CUSTOM'
        ? Number(customPort)
        : STANDARD_SERVICES[service]?.port || 80;

    const protocol =
      service === 'CUSTOM'
        ? 'TCP'
        : STANDARD_SERVICES[service]?.protocol || 'TCP';

    const packet: TrafficPacket = {
      srcIp: srcIp.trim(),
      dstIp: dstIp.trim(),
      srcInterface,
      dstInterface,
      service,
      port,
      protocol,
      timestamp: new Date().toLocaleTimeString(),
    };

    const result = evaluatePacket(packet, policies);
    setSimulationResult(result);

    // Update hits count if matched a custom policy
    if (result.matchedPolicy && result.matchedPolicy.id !== 0) {
      onUpdatePolicyHits(result.matchedPolicy.id);
    }

    // Record in traffic log
    const logEntry: TrafficLog = {
      id: `sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString(),
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
      bytes: Math.floor(Math.random() * 3000) + 64,
      status: result.action === 'ALLOW' ? 'Accepted' : 'Blocked',
    };

    onLogGenerated(logEntry);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded bg-red-600/20 border border-red-500/30 text-red-400">
              <Terminal className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              NETSHIELD Packet Trace & Policy Verification Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Synthesize incoming network packets, test against the active NETSHIELD rule base,
            and inspect sequential top-to-bottom condition matching.
          </p>
        </div>

        <button
          onClick={handleSimulate}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-bold px-6 py-2.5 rounded-lg shadow-lg shadow-red-950/60 transition-all active:scale-95 cursor-pointer text-xs uppercase tracking-wider"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Inject Packet & Evaluate</span>
        </button>
      </div>

      {/* Preset Scenarios Strip */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <FastForward className="w-3.5 h-3.5 text-sky-400" />
          <span>Quick Scenario Presets</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg p-2.5 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{p.icon}</span>
                <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
              </div>
              <div className="font-semibold text-slate-200 text-xs truncate group-hover:text-white">
                {p.label}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {p.subtitle}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Packet Parameter Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-red-400" />
          <span>Packet Header Construction</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Inbound Interface */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Source Interface
            </label>
            <select
              value={srcInterface}
              onChange={(e) => setSrcInterface(e.target.value as NetworkInterface)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500 font-medium"
            >
              <option value="LAN">port1 [LAN]</option>
              <option value="WAN">port2 [WAN]</option>
              <option value="DMZ">dmz</option>
            </select>
          </div>

          {/* Source IP */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300">
                Source IPv4 Address
              </label>
              <span className="text-[10px] text-slate-500">Host IP</span>
            </div>
            <input
              type="text"
              value={srcIp}
              onChange={(e) => setSrcIp(e.target.value)}
              placeholder="e.g. 192.168.1.45"
              className={`w-full bg-slate-950 border ${
                ipErrors.src ? 'border-red-500' : 'border-slate-700'
              } rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500 font-mono`}
            />
            {ipErrors.src && (
              <p className="text-[10px] text-red-400 mt-1">{ipErrors.src}</p>
            )}
            <div className="flex gap-1 mt-1.5">
              {['192.168.1.45', '198.51.100.22', '192.168.1.50'].map((ip) => (
                <button
                  key={ip}
                  type="button"
                  onClick={() => setSrcIp(ip)}
                  className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-400 px-1 py-0.5 rounded font-mono cursor-pointer"
                >
                  {ip}
                </button>
              ))}
            </div>
          </div>

          {/* Outbound Interface */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Destination Interface
            </label>
            <select
              value={dstInterface}
              onChange={(e) => setDstInterface(e.target.value as NetworkInterface)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500 font-medium"
            >
              <option value="WAN">port2 [WAN] (Internet)</option>
              <option value="LAN">port1 [LAN] (Internal)</option>
              <option value="DMZ">dmz (Servers)</option>
            </select>
          </div>

          {/* Destination IP */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300">
                Destination IPv4 Address
              </label>
              <span className="text-[10px] text-slate-500">Target IP</span>
            </div>
            <input
              type="text"
              value={dstIp}
              onChange={(e) => setDstIp(e.target.value)}
              placeholder="e.g. 142.250.190.46"
              className={`w-full bg-slate-950 border ${
                ipErrors.dst ? 'border-red-500' : 'border-slate-700'
              } rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500 font-mono`}
            />
            {ipErrors.dst && (
              <p className="text-[10px] text-red-400 mt-1">{ipErrors.dst}</p>
            )}
            <div className="flex gap-1 mt-1.5">
              {['142.250.190.46', '1.1.1.1', '172.16.1.10'].map((ip) => (
                <button
                  key={ip}
                  type="button"
                  onClick={() => setDstIp(ip)}
                  className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-400 px-1 py-0.5 rounded font-mono cursor-pointer"
                >
                  {ip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Service & Port Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-3 border-t border-slate-800/80 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Service / Application
            </label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value as ServiceType)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500 font-mono"
            >
              {Object.keys(STANDARD_SERVICES)
                .filter((k) => k !== 'ALL')
                .map((key) => {
                  const s = STANDARD_SERVICES[key as ServiceType];
                  return (
                    <option key={key} value={key}>
                      {s.name} {s.port ? `(Port ${s.port})` : ''}
                    </option>
                  );
                })}
            </select>
          </div>

          {service === 'CUSTOM' && (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Custom Port Number
              </label>
              <input
                type="number"
                min={1}
                max={65535}
                value={customPort}
                onChange={(e) => setCustomPort(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
          )}

          <div className="flex items-end">
            <button
              onClick={handleSimulate}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold py-2 px-4 rounded transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Run Diagnostic Packet Check</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulation Result Card */}
      {simulationResult && (
        <div className="space-y-4 animate-fade-in">
          {/* Main Verdict Card */}
          <div
            className={`border rounded-xl p-5 shadow-2xl transition-all ${
              simulationResult.action === 'ALLOW'
                ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border-emerald-500/50 glow-green'
                : 'bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border-red-500/50 glow-red'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div className="flex items-center space-x-3.5">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                    simulationResult.action === 'ALLOW'
                      ? 'bg-emerald-600 text-white shadow-emerald-950/80'
                      : 'bg-red-600 text-white shadow-red-950/80'
                  }`}
                >
                  {simulationResult.action === 'ALLOW' ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <AlertOctagon className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-lg font-black tracking-wider uppercase ${
                        simulationResult.action === 'ALLOW'
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {simulationResult.action === 'ALLOW'
                        ? 'Traffic Permitted (ALLOW)'
                        : 'Traffic Dropped (DENY)'}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                      {simulationResult.durationMs} ms
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Decided by:{' '}
                    <span className="font-bold text-white">
                      {simulationResult.matchedPolicy?.name}
                    </span>{' '}
                    (Policy ID #{simulationResult.matchedPolicy?.id})
                  </div>
                </div>
              </div>

              {/* Packet Summary Chip */}
              <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-2 rounded-lg font-mono text-xs">
                <span className="text-sky-400 font-semibold">
                  {simulationResult.packet.srcIp}
                </span>
                <span className="text-slate-600">[{simulationResult.packet.srcInterface}]</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-indigo-400 font-semibold">
                  {simulationResult.packet.dstIp}
                </span>
                <span className="text-slate-600">[{simulationResult.packet.dstInterface}]</span>
                <span className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded text-[11px]">
                  {simulationResult.packet.service}:{simulationResult.packet.port}
                </span>
              </div>
            </div>

            {/* Explanation note */}
            <div className="mt-3 text-xs text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>
                {simulationResult.isImplicitDeny
                  ? 'No administrator-configured firewall policy matched this traffic. The NetShield built-in Implicit Deny rule (Rule 0) dropped the packet.'
                  : `Packet matched all criteria of Policy #${simulationResult.matchedPolicy?.id} (${simulationResult.matchedPolicy?.name}). Sequential rule processing immediately stopped and executed verdict: ${simulationResult.action}.`}
              </span>
            </div>
          </div>

          {/* Sequential Top-to-Bottom Trace Drawer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Sequential Rule Evaluation Trace (Top-to-Bottom)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {simulationResult.evaluationTrace.length} rules evaluated
              </span>
            </div>

            <div className="space-y-3">
              {simulationResult.evaluationTrace.map((step, stepIndex) => {
                const isWinner = step.matched;
                return (
                  <div
                    key={stepIndex}
                    className={`rounded-lg border transition-all p-3.5 text-xs ${
                      isWinner
                        ? step.action === 'ALLOW'
                          ? 'bg-emerald-950/30 border-emerald-500/60 shadow-md shadow-emerald-950/40'
                          : 'bg-red-950/30 border-red-500/60 shadow-md shadow-red-950/40'
                        : 'bg-slate-950/50 border-slate-800/80 opacity-75'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-400 text-[11px]">
                          Seq #{stepIndex + 1}
                        </span>
                        <span className="font-bold text-slate-200">
                          {step.policyName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          (ID #{step.policyId})
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {step.disabled ? (
                          <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-semibold">
                            DISABLED (Skipped)
                          </span>
                        ) : isWinner ? (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              step.action === 'ALLOW'
                                ? 'bg-emerald-600 text-white border-emerald-400'
                                : 'bg-red-600 text-white border-red-400'
                            }`}
                          >
                            WINNING RULE: {step.action}
                          </span>
                        ) : (
                          <span className="bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded text-[10px]">
                            No Match
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Conditions Breakdown */}
                    {step.disabled ? (
                      <div className="text-slate-400 italic text-[11px]">
                        {step.skippedReason}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mt-2 pt-2 border-t border-slate-800/60">
                        {step.conditions.map((cond, cIdx) => (
                          <div
                            key={cIdx}
                            className={`p-2 rounded border text-[11px] ${
                              cond.passed
                                ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center justify-between font-semibold mb-1">
                              <span className="text-[10px] uppercase text-slate-400">
                                {cond.name}
                              </span>
                              {cond.passed ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                              ) : (
                                <XCircle className="w-3 h-3 text-slate-500 shrink-0" />
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 leading-tight truncate" title={cond.details}>
                              {cond.details}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
