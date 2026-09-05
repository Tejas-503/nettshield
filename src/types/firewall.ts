export type NetworkInterface = 'LAN' | 'WAN' | 'DMZ' | 'any';

export type TrafficAction = 'ALLOW' | 'DENY';

export type Protocol = 'TCP' | 'UDP' | 'ICMP' | 'ALL';

export type ServiceType =
  | 'HTTP'
  | 'HTTPS'
  | 'DNS'
  | 'SSH'
  | 'RDP'
  | 'ICMP/PING'
  | 'FTP'
  | 'SMTP'
  | 'ALL'
  | 'CUSTOM';

export interface ServiceDefinition {
  name: ServiceType;
  protocol: Protocol;
  port: number | null; // null for ICMP or ALL
  description: string;
}

export interface FirewallPolicy {
  id: number;
  name: string;
  srcInterface: NetworkInterface;
  dstInterface: NetworkInterface;
  srcSubnet: string; // e.g., '192.168.1.0/24', '10.0.0.5', 'all'
  dstSubnet: string; // e.g., 'all', '172.16.1.10/32'
  service: ServiceType;
  customPort?: number;
  action: TrafficAction;
  enabled: boolean;
  hitCount: number;
  lastHit?: string;
  comments?: string;
  natEnabled?: boolean;
  logAllowed?: boolean;
}

export interface TrafficPacket {
  srcIp: string;
  dstIp: string;
  srcInterface: NetworkInterface;
  dstInterface: NetworkInterface;
  service: ServiceType;
  port: number;
  protocol: Protocol;
  timestamp?: string;
}

export interface ConditionEvaluation {
  name: 'In-Interface' | 'Out-Interface' | 'Source IP/Subnet' | 'Destination IP/Subnet' | 'Service/Port';
  passed: boolean;
  expected: string;
  actual: string;
  details?: string;
}

export interface EvaluationStep {
  policyId: number;
  policyName: string;
  action: TrafficAction;
  matched: boolean;
  disabled?: boolean;
  conditions: ConditionEvaluation[];
  skippedReason?: string;
}

export interface SimulationResult {
  packet: TrafficPacket;
  action: TrafficAction;
  matchedPolicy: FirewallPolicy | null;
  isImplicitDeny: boolean;
  evaluationTrace: EvaluationStep[];
  durationMs: number;
  timestamp: string;
}

export interface TrafficLog {
  id: string;
  timestamp: string;
  srcIp: string;
  dstIp: string;
  srcInterface: NetworkInterface;
  dstInterface: NetworkInterface;
  service: string;
  port: number;
  protocol: Protocol;
  action: TrafficAction;
  policyId: number;
  policyName: string;
  bytes: number;
  status: 'Accepted' | 'Blocked' | 'Dropped';
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeSessions: number;
  uptime: string;
  throughputKbps: number;
}
