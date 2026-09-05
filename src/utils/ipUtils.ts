import type { ServiceDefinition, ServiceType } from '../types/firewall';

export const STANDARD_SERVICES: Record<ServiceType, ServiceDefinition> = {
  HTTP: { name: 'HTTP', protocol: 'TCP', port: 80, description: 'Web traffic (Insecure HTTP)' },
  HTTPS: { name: 'HTTPS', protocol: 'TCP', port: 443, description: 'Secure Web traffic (TLS/SSL)' },
  DNS: { name: 'DNS', protocol: 'UDP', port: 53, description: 'Domain Name System queries' },
  SSH: { name: 'SSH', protocol: 'TCP', port: 22, description: 'Secure Shell remote terminal' },
  RDP: { name: 'RDP', protocol: 'TCP', port: 3389, description: 'Remote Desktop Protocol' },
  'ICMP/PING': { name: 'ICMP/PING', protocol: 'ICMP', port: null, description: 'Internet Control Message Protocol echo/reply' },
  FTP: { name: 'FTP', protocol: 'TCP', port: 21, description: 'File Transfer Protocol control' },
  SMTP: { name: 'SMTP', protocol: 'TCP', port: 25, description: 'Simple Mail Transfer Protocol' },
  ALL: { name: 'ALL', protocol: 'ALL', port: null, description: 'All services, ports and protocols' },
  CUSTOM: { name: 'CUSTOM', protocol: 'TCP', port: 8080, description: 'User-specified port and protocol' },
};

/**
 * Validates whether an input is a valid IPv4 address
 */
export function isValidIp(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return false;

  for (const part of parts) {
    if (!/^\d+$/.test(part)) return false;
    const num = Number(part);
    if (num < 0 || num > 255) return false;
    if (part.length > 1 && part.startsWith('0')) return false; // leading zero
  }

  return true;
}

/**
 * Validates IPv4 with optional CIDR mask (e.g., '192.168.1.0/24', '10.0.0.1', 'all', 'any')
 */
export function isValidSubnetOrIp(input: string): boolean {
  if (!input) return false;
  const trimmed = input.trim().toLowerCase();
  if (trimmed === 'all' || trimmed === 'any' || trimmed === '0.0.0.0/0') return true;

  if (trimmed.includes('/')) {
    const [ip, maskStr] = trimmed.split('/');
    if (!isValidIp(ip)) return false;
    if (!/^\d+$/.test(maskStr)) return false;
    const mask = Number(maskStr);
    return mask >= 0 && mask <= 32;
  }

  return isValidIp(trimmed);
}

/**
 * Converts an IPv4 string into a 32-bit unsigned integer
 */
export function ipToInt(ip: string): number {
  const octets = ip.trim().split('.').map(Number);
  return (((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0);
}

/**
 * Checks if a given IP address matches a subnet, CIDR or 'all'
 */
export function isIpInSubnet(ip: string, subnetInput: string): boolean {
  if (!isValidIp(ip)) return false;

  const target = subnetInput.trim().toLowerCase();
  if (target === 'all' || target === 'any' || target === '0.0.0.0/0') {
    return true;
  }

  try {
    const ipIntVal = ipToInt(ip);

    if (target.includes('/')) {
      const [networkIp, prefixStr] = target.split('/');
      const prefix = parseInt(prefixStr, 10);
      if (prefix === 0) return true;
      if (prefix < 0 || prefix > 32) return false;

      const netIntVal = ipToInt(networkIp);
      // Bitwise shift in JS is 32-bit signed, >>> 0 ensures unsigned 32-bit
      const mask = prefix === 32 ? 0xffffffff : (~((1 << (32 - prefix)) - 1)) >>> 0;

      return ((ipIntVal & mask) >>> 0) === ((netIntVal & mask) >>> 0);
    }

    // Exact IP match
    return ipToInt(target) === ipIntVal;
  } catch {
    return false;
  }
}
