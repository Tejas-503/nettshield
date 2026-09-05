import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  Globe,
  Info,
  Network,
  Shield,
  X,
} from 'lucide-react';
import type {
  FirewallPolicy,
  NetworkInterface,
  ServiceType,
  TrafficAction,
} from '../../types/firewall';
import { isValidSubnetOrIp, STANDARD_SERVICES } from '../../utils/ipUtils';

interface PolicyModalProps {
  policy: FirewallPolicy | null; // null if creating new
  isOpen: boolean;
  onClose: () => void;
  onSave: (policyData: Omit<FirewallPolicy, 'id' | 'hitCount'> & { id?: number }) => void;
  nextId: number;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  policy,
  isOpen,
  onClose,
  onSave,
  nextId,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(policy?.name || `Policy_${nextId}`);
  const [srcInterface, setSrcInterface] = useState<NetworkInterface>(
    policy?.srcInterface || 'LAN'
  );
  const [dstInterface, setDstInterface] = useState<NetworkInterface>(
    policy?.dstInterface || 'WAN'
  );
  const [srcSubnet, setSrcSubnet] = useState(policy?.srcSubnet || '192.168.1.0/24');
  const [dstSubnet, setDstSubnet] = useState(policy?.dstSubnet || 'all');
  const [service, setService] = useState<ServiceType>(policy?.service || 'HTTPS');
  const [customPort, setCustomPort] = useState<number>(policy?.customPort || 8080);
  const [action, setAction] = useState<TrafficAction>(policy?.action || 'ALLOW');
  const [enabled, setEnabled] = useState<boolean>(policy ? policy.enabled : true);
  const [comments, setComments] = useState(policy?.comments || '');

  const [errors, setErrors] = useState<{ src?: string; dst?: string; name?: string }>({});

  const handleSave = () => {
    const newErrors: { src?: string; dst?: string; name?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Policy name is required';
    }

    if (!isValidSubnetOrIp(srcSubnet)) {
      newErrors.src = 'Invalid format. Use IPv4 (e.g. 192.168.1.5), CIDR (192.168.1.0/24), or "all"';
    }

    if (!isValidSubnetOrIp(dstSubnet)) {
      newErrors.dst = 'Invalid format. Use IPv4 (e.g. 10.0.0.1), CIDR (10.0.0.0/8), or "all"';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...(policy?.id ? { id: policy.id } : {}),
      name: name.trim(),
      srcInterface,
      dstInterface,
      srcSubnet: srcSubnet.trim(),
      dstSubnet: dstSubnet.trim(),
      service,
      customPort: service === 'CUSTOM' ? Number(customPort) : undefined,
      action,
      enabled,
      comments: comments.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-red-600/20 border border-red-500/30 text-red-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                {policy ? `Edit Policy #${policy.id}` : 'Create New Firewall Policy'}
              </h2>
              <p className="text-[11px] text-slate-400">
                NetShield Security Rule Definition
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Policy Name & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">
                Policy Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Allow_DevOps_Traffic"
                className={`w-full bg-slate-950 border ${
                  errors.name ? 'border-red-500' : 'border-slate-700'
                } rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500 font-mono`}
              />
              {errors.name && (
                <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Status
              </label>
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`w-full py-2 px-3 rounded font-medium text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  enabled
                    ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    enabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
                <span>{enabled ? 'Enabled' : 'Disabled'}</span>
              </button>
            </div>
          </div>

          {/* Incoming & Outgoing Interfaces */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Network className="w-3.5 h-3.5 text-sky-400" />
                <span>Incoming Interface (Source)</span>
              </label>
              <select
                value={srcInterface}
                onChange={(e) => setSrcInterface(e.target.value as NetworkInterface)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500"
              >
                <option value="LAN">port1 [LAN] - 192.168.1.1/24</option>
                <option value="WAN">port2 [WAN] - 198.51.100.1</option>
                <option value="DMZ">dmz - 172.16.1.1/24</option>
                <option value="any">any (All interfaces)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>Outgoing Interface (Destination)</span>
              </label>
              <select
                value={dstInterface}
                onChange={(e) => setDstInterface(e.target.value as NetworkInterface)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500"
              >
                <option value="WAN">port2 [WAN] - Internet Gateway</option>
                <option value="LAN">port1 [LAN] - Internal Network</option>
                <option value="DMZ">dmz - Demilitarized Zone</option>
                <option value="any">any (All interfaces)</option>
              </select>
            </div>
          </div>

          {/* Source Subnet / IP */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300">
                Source Address / Subnet <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center space-x-1">
                <span className="text-[10px] text-slate-400">Quick fill:</span>
                {['192.168.1.0/24', '192.168.1.50/32', 'all'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSrcSubnet(opt)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono border border-slate-700 cursor-pointer"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              value={srcSubnet}
              onChange={(e) => setSrcSubnet(e.target.value)}
              placeholder="e.g., 192.168.1.0/24 or all"
              className={`w-full bg-slate-950 border ${
                errors.src ? 'border-red-500' : 'border-slate-700'
              } rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500 font-mono`}
            />
            {errors.src && (
              <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.src}
              </p>
            )}
          </div>

          {/* Destination Subnet / IP */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300">
                Destination Address / Subnet <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center space-x-1">
                <span className="text-[10px] text-slate-400">Quick fill:</span>
                {['all', '172.16.1.10/32', '10.0.0.0/8'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDstSubnet(opt)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono border border-slate-700 cursor-pointer"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              value={dstSubnet}
              onChange={(e) => setDstSubnet(e.target.value)}
              placeholder="e.g., all or 172.16.1.10/32"
              className={`w-full bg-slate-950 border ${
                errors.dst ? 'border-red-500' : 'border-slate-700'
              } rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500 font-mono`}
            />
            {errors.dst && (
              <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.dst}
              </p>
            )}
          </div>

          {/* Service & Port */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Service Object
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value as ServiceType)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500 font-mono"
              >
                {Object.keys(STANDARD_SERVICES).map((key) => {
                  const s = STANDARD_SERVICES[key as ServiceType];
                  return (
                    <option key={key} value={key}>
                      {s.name} {s.port ? `(Port ${s.port}/${s.protocol})` : `(${s.protocol})`}
                    </option>
                  );
                })}
              </select>
            </div>

            {service === 'CUSTOM' ? (
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Custom Destination Port
                </label>
                <input
                  type="number"
                  value={customPort}
                  onChange={(e) => setCustomPort(Number(e.target.value))}
                  min={1}
                  max={65535}
                  placeholder="e.g. 8080"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>
            ) : (
              <div className="flex items-center text-slate-400 text-[11px] bg-slate-950/40 border border-slate-800 rounded p-2 self-end">
                <Info className="w-3.5 h-3.5 text-sky-400 mr-2 shrink-0" />
                <span>{STANDARD_SERVICES[service]?.description}</span>
              </div>
            )}
          </div>

          {/* Action Choice: ALLOW vs DENY */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Firewall Action (Verdict)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAction('ALLOW')}
                className={`py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center space-x-2 border transition-all cursor-pointer ${
                  action === 'ALLOW'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/50'
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>ACCEPT (ALLOW)</span>
              </button>

              <button
                type="button"
                onClick={() => setAction('DENY')}
                className={`py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center space-x-2 border transition-all cursor-pointer ${
                  action === 'DENY'
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/50'
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <X className="w-4 h-4" />
                <span>DENY (BLOCK)</span>
              </button>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Comments / Log Reference
            </label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Operational justification or change ticket number..."
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500 resize-none text-xs"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-800/80 border-t border-slate-700 flex justify-end space-x-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-950/50 flex items-center gap-1.5 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{policy ? 'Save Policy Changes' : 'Install Policy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
