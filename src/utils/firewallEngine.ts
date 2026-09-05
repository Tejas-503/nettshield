import type {
  ConditionEvaluation,
  EvaluationStep,
  FirewallPolicy,
  SimulationResult,
  TrafficPacket,
} from '../types/firewall';
import { isIpInSubnet, STANDARD_SERVICES } from './ipUtils';

export const IMPLICIT_DENY_POLICY: FirewallPolicy = {
  id: 0,
  name: 'Implicit Deny (Rule 0)',
  srcInterface: 'any',
  dstInterface: 'any',
  srcSubnet: 'all',
  dstSubnet: 'all',
  service: 'ALL',
  action: 'DENY',
  enabled: true,
  hitCount: 0,
  comments: 'NetShield built-in default drop rule for unmatched traffic',
};

/**
 * Evaluates a network packet against an ordered list of NetShield firewall policies.
 * Rules are processed strictly top-to-bottom. The first matching rule determines the outcome.
 */
export function evaluatePacket(
  packet: TrafficPacket,
  policies: FirewallPolicy[]
): SimulationResult {
  const startTime = performance.now();
  const evaluationTrace: EvaluationStep[] = [];
  let matchedPolicy: FirewallPolicy | null = null;

  for (const policy of policies) {
    if (!policy.enabled) {
      evaluationTrace.push({
        policyId: policy.id,
        policyName: policy.name,
        action: policy.action,
        matched: false,
        disabled: true,
        conditions: [],
        skippedReason: 'Policy is currently disabled by administrator',
      });
      continue;
    }

    const conditions: ConditionEvaluation[] = [];

    // 1. Inbound Interface evaluation
    const inIntMatch =
      policy.srcInterface === 'any' || policy.srcInterface === packet.srcInterface;
    conditions.push({
      name: 'In-Interface',
      passed: inIntMatch,
      expected: policy.srcInterface === 'any' ? 'any' : policy.srcInterface,
      actual: packet.srcInterface,
      details: inIntMatch ? 'Interface matches' : `Mismatch: policy requires ${policy.srcInterface}, got ${packet.srcInterface}`,
    });

    // 2. Outbound Interface evaluation
    const outIntMatch =
      policy.dstInterface === 'any' || policy.dstInterface === packet.dstInterface;
    conditions.push({
      name: 'Out-Interface',
      passed: outIntMatch,
      expected: policy.dstInterface === 'any' ? 'any' : policy.dstInterface,
      actual: packet.dstInterface,
      details: outIntMatch ? 'Interface matches' : `Mismatch: policy requires ${policy.dstInterface}, got ${packet.dstInterface}`,
    });

    // 3. Source IP / Subnet evaluation
    const srcIpMatch = isIpInSubnet(packet.srcIp, policy.srcSubnet);
    conditions.push({
      name: 'Source IP/Subnet',
      passed: srcIpMatch,
      expected: policy.srcSubnet,
      actual: packet.srcIp,
      details: srcIpMatch
        ? `IP ${packet.srcIp} belongs to ${policy.srcSubnet}`
        : `IP ${packet.srcIp} is out of subnet ${policy.srcSubnet}`,
    });

    // 4. Destination IP / Subnet evaluation
    const dstIpMatch = isIpInSubnet(packet.dstIp, policy.dstSubnet);
    conditions.push({
      name: 'Destination IP/Subnet',
      passed: dstIpMatch,
      expected: policy.dstSubnet,
      actual: packet.dstIp,
      details: dstIpMatch
        ? `IP ${packet.dstIp} belongs to ${policy.dstSubnet}`
        : `IP ${packet.dstIp} is out of subnet ${policy.dstSubnet}`,
    });

    // 5. Service / Port evaluation
    let serviceMatch = false;
    let serviceDetail = '';

    if (policy.service === 'ALL') {
      serviceMatch = true;
      serviceDetail = 'Policy accepts all services and ports';
    } else if (policy.service === 'CUSTOM') {
      serviceMatch = policy.customPort === packet.port;
      serviceDetail = serviceMatch
        ? `Custom port ${packet.port} matched`
        : `Custom port mismatch (expected ${policy.customPort}, got ${packet.port})`;
    } else if (policy.service === packet.service) {
      serviceMatch = true;
      serviceDetail = `Service ${packet.service} matched standard port ${packet.port}`;
    } else {
      // Check standard port match
      const def = STANDARD_SERVICES[policy.service];
      if (def && def.port !== null && def.port === packet.port) {
        serviceMatch = true;
        serviceDetail = `Port ${packet.port} matches ${policy.service}`;
      } else {
        serviceMatch = false;
        serviceDetail = `Service mismatch: expected ${policy.service}, packet is ${packet.service} (port ${packet.port})`;
      }
    }

    conditions.push({
      name: 'Service/Port',
      passed: serviceMatch,
      expected: policy.service === 'CUSTOM' ? `Port ${policy.customPort}` : policy.service,
      actual: `${packet.service}:${packet.port}`,
      details: serviceDetail,
    });

    const isMatch = inIntMatch && outIntMatch && srcIpMatch && dstIpMatch && serviceMatch;

    evaluationTrace.push({
      policyId: policy.id,
      policyName: policy.name,
      action: policy.action,
      matched: isMatch,
      conditions,
    });

    if (isMatch) {
      matchedPolicy = policy;
      break; // Top-to-bottom: FIRST MATCH WINS!
    }
  }

  const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
  const isImplicitDeny = matchedPolicy === null;
  const finalAction = matchedPolicy ? matchedPolicy.action : 'DENY';

  // If implicit deny triggered, add step for Rule 0
  if (isImplicitDeny) {
    evaluationTrace.push({
      policyId: IMPLICIT_DENY_POLICY.id,
      policyName: IMPLICIT_DENY_POLICY.name,
      action: 'DENY',
      matched: true,
      conditions: [
        {
          name: 'In-Interface',
          passed: true,
          expected: 'any',
          actual: packet.srcInterface,
          details: 'Default catch-all rule matches any interface',
        },
        {
          name: 'Out-Interface',
          passed: true,
          expected: 'any',
          actual: packet.dstInterface,
          details: 'Default catch-all rule matches any interface',
        },
        {
          name: 'Source IP/Subnet',
          passed: true,
          expected: 'all',
          actual: packet.srcIp,
          details: 'Default catch-all rule matches all IPs',
        },
        {
          name: 'Destination IP/Subnet',
          passed: true,
          expected: 'all',
          actual: packet.dstIp,
          details: 'Default catch-all rule matches all IPs',
        },
        {
          name: 'Service/Port',
          passed: true,
          expected: 'ALL',
          actual: `${packet.service}:${packet.port}`,
          details: 'Default catch-all rule matches all services',
        },
      ],
    });
  }

  return {
    packet,
    action: finalAction,
    matchedPolicy: matchedPolicy || IMPLICIT_DENY_POLICY,
    isImplicitDeny,
    evaluationTrace,
    durationMs,
    timestamp: new Date().toISOString(),
  };
}
