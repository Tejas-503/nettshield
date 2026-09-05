import type { FirewallPolicy, TrafficLog } from '../types/firewall';

const POLICIES_KEY = 'fortigate_firewall_policies_v1';
const LOGS_KEY = 'fortigate_firewall_logs_v1';

export const DEFAULT_POLICIES: FirewallPolicy[] = [
  {
    id: 1,
    name: 'Allow_Corporate_Web_HTTPS',
    srcInterface: 'LAN',
    dstInterface: 'WAN',
    srcSubnet: '192.168.1.0/24',
    dstSubnet: 'all',
    service: 'HTTPS',
    action: 'ALLOW',
    enabled: true,
    hitCount: 1420,
    lastHit: '2 mins ago',
    natEnabled: true,
    comments: 'Allow office LAN clients secure access to external web',
  },
  {
    id: 2,
    name: 'Allow_Corporate_Web_HTTP',
    srcInterface: 'LAN',
    dstInterface: 'WAN',
    srcSubnet: '192.168.1.0/24',
    dstSubnet: 'all',
    service: 'HTTP',
    action: 'ALLOW',
    enabled: true,
    hitCount: 843,
    lastHit: '5 mins ago',
    natEnabled: true,
    comments: 'Standard HTTP web traffic from trusted LAN',
  },
  {
    id: 3,
    name: 'Allow_DNS_Queries',
    srcInterface: 'LAN',
    dstInterface: 'WAN',
    srcSubnet: '192.168.1.0/24',
    dstSubnet: 'all',
    service: 'DNS',
    action: 'ALLOW',
    enabled: true,
    hitCount: 3125,
    lastHit: 'Just now',
    natEnabled: true,
    comments: 'Allow internal hosts to resolve external DNS (1.1.1.1, 8.8.8.8)',
  },
  {
    id: 4,
    name: 'Block_Threat_Actor_Subnet',
    srcInterface: 'WAN',
    dstInterface: 'any',
    srcSubnet: '198.51.100.0/24',
    dstSubnet: 'all',
    service: 'ALL',
    action: 'DENY',
    enabled: true,
    hitCount: 289,
    lastHit: '12 mins ago',
    comments: 'Known scanner and malicious botnet range blocked at perimeter',
  },
  {
    id: 5,
    name: 'Allow_DevOps_SSH_to_DMZ',
    srcInterface: 'LAN',
    dstInterface: 'DMZ',
    srcSubnet: '192.168.1.50/32',
    dstSubnet: '172.16.1.10/32',
    service: 'SSH',
    action: 'ALLOW',
    enabled: true,
    hitCount: 94,
    lastHit: '1 hour ago',
    comments: 'Bastion host remote terminal access for Senior DevOps admin',
  },
  {
    id: 6,
    name: 'Block_Inbound_RDP_Perimeter',
    srcInterface: 'WAN',
    dstInterface: 'any',
    srcSubnet: 'all',
    dstSubnet: 'all',
    service: 'RDP',
    action: 'DENY',
    enabled: true,
    hitCount: 521,
    lastHit: '18 mins ago',
    comments: 'Prevent unauthorized remote desktop brute-force from WAN',
  },
];

export const INITIAL_LOGS: TrafficLog[] = [
  {
    id: 'log-101',
    timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
    srcIp: '192.168.1.45',
    dstIp: '142.250.190.46',
    srcInterface: 'LAN',
    dstInterface: 'WAN',
    service: 'HTTPS',
    port: 443,
    protocol: 'TCP',
    action: 'ALLOW',
    policyId: 1,
    policyName: 'Allow_Corporate_Web_HTTPS',
    bytes: 4218,
    status: 'Accepted',
  },
  {
    id: 'log-102',
    timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
    srcIp: '192.168.1.45',
    dstIp: '1.1.1.1',
    srcInterface: 'LAN',
    dstInterface: 'WAN',
    service: 'DNS',
    port: 53,
    protocol: 'UDP',
    action: 'ALLOW',
    policyId: 3,
    policyName: 'Allow_DNS_Queries',
    bytes: 148,
    status: 'Accepted',
  },
  {
    id: 'log-103',
    timestamp: new Date(Date.now() - 240000).toLocaleTimeString(),
    srcIp: '198.51.100.22',
    dstIp: '192.168.1.1',
    srcInterface: 'WAN',
    dstInterface: 'LAN',
    service: 'SSH',
    port: 22,
    protocol: 'TCP',
    action: 'DENY',
    policyId: 4,
    policyName: 'Block_Threat_Actor_Subnet',
    bytes: 64,
    status: 'Blocked',
  },
  {
    id: 'log-104',
    timestamp: new Date(Date.now() - 360000).toLocaleTimeString(),
    srcIp: '203.0.113.88',
    dstIp: '192.168.1.20',
    srcInterface: 'WAN',
    dstInterface: 'LAN',
    service: 'RDP',
    port: 3389,
    protocol: 'TCP',
    action: 'DENY',
    policyId: 6,
    policyName: 'Block_Inbound_RDP_Perimeter',
    bytes: 54,
    status: 'Blocked',
  },
  {
    id: 'log-105',
    timestamp: new Date(Date.now() - 480000).toLocaleTimeString(),
    srcIp: '192.168.1.50',
    dstIp: '172.16.1.10',
    srcInterface: 'LAN',
    dstInterface: 'DMZ',
    service: 'SSH',
    port: 22,
    protocol: 'TCP',
    action: 'ALLOW',
    policyId: 5,
    policyName: 'Allow_DevOps_SSH_to_DMZ',
    bytes: 8712,
    status: 'Accepted',
  },
  {
    id: 'log-106',
    timestamp: new Date(Date.now() - 600000).toLocaleTimeString(),
    srcIp: '185.220.101.5',
    dstIp: '192.168.1.80',
    srcInterface: 'WAN',
    dstInterface: 'LAN',
    service: 'CUSTOM',
    port: 3306,
    protocol: 'TCP',
    action: 'DENY',
    policyId: 0,
    policyName: 'Implicit Deny (Rule 0)',
    bytes: 40,
    status: 'Dropped',
  },
];

export function loadPolicies(): FirewallPolicy[] {
  try {
    const raw = localStorage.getItem(POLICIES_KEY);
    if (!raw) {
      savePolicies(DEFAULT_POLICIES);
      return DEFAULT_POLICIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_POLICIES;
  } catch {
    return DEFAULT_POLICIES;
  }
}

export function savePolicies(policies: FirewallPolicy[]): void {
  try {
    localStorage.setItem(POLICIES_KEY, JSON.stringify(policies));
  } catch (err) {
    console.error('Failed to save policies to localStorage', err);
  }
}

export function resetPoliciesToDefault(): FirewallPolicy[] {
  savePolicies(DEFAULT_POLICIES);
  return DEFAULT_POLICIES;
}

export function loadLogs(): TrafficLog[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) {
      saveLogs(INITIAL_LOGS);
      return INITIAL_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_LOGS;
  } catch {
    return INITIAL_LOGS;
  }
}

export function saveLogs(logs: TrafficLog[]): void {
  try {
    // Keep last 200 logs to prevent memory bloat
    const trimmed = logs.slice(0, 200);
    localStorage.setItem(LOGS_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to save logs to localStorage', err);
  }
}

export function clearLogs(): void {
  try {
    localStorage.removeItem(LOGS_KEY);
  } catch (err) {
    console.error('Failed to clear logs', err);
  }
}

export function exportLogsToCsv(logs: TrafficLog[]): void {
  const headers = [
    'Timestamp',
    'Source IP',
    'Destination IP',
    'In Interface',
    'Out Interface',
    'Service',
    'Port',
    'Protocol',
    'Action',
    'Matched Policy',
    'Bytes',
    'Status',
  ];

  const rows = logs.map((l) => [
    `"${l.timestamp}"`,
    `"${l.srcIp}"`,
    `"${l.dstIp}"`,
    `"${l.srcInterface}"`,
    `"${l.dstInterface}"`,
    `"${l.service}"`,
    l.port,
    `"${l.protocol}"`,
    `"${l.action}"`,
    `"${l.policyName}"`,
    l.bytes,
    `"${l.status}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `NetShield_Traffic_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
