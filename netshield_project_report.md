# 🛡️ NETSHIELD: Next-Generation Firewall Policy Simulator
## Comprehensive Project Report & Feature Specification

---

## 1. Executive Summary

**NETSHIELD** is an enterprise-grade **Next-Generation Firewall (NGFW) Policy Simulator & Security Operations Center (SOC)** web application. Designed with the aesthetics and behavior of leading cyber appliances, it provides network engineers, cybersecurity analysts, and students with an interactive, hands-on environment to test, debug, and understand how enterprise firewalls evaluate real network traffic.

### Purpose & Problem Solved
In production enterprise networks, firewall misconfigurations (such as shadow rules, reversed rule order, or overly permissive subnets) cause severe security breaches or outages. Testing policy changes on physical production appliances can be risky. 

**NETSHIELD** solves this by providing:
- A risk-free, 100% accurate **sequential first-match simulation engine**.
- Real-time **packet tracing** with visual condition-by-condition pass/fail diagnostics.
- Instant visibility into rule hit counters, allow/deny ratios, and traffic logs.

---

## 2. Technical Stack & Architecture

| Layer | Technology | Key Highlights |
|---|---|---|
| **Core Framework** | React 19 (TypeScript) | Strict typing, robust interfaces for packets, policies, logs |
| **Build & Bundling** | Vite 8 + @tailwindcss/vite | Lightning-fast HMR and optimized production bundle |
| **Styling** | Vanilla CSS + Tailwind CSS | Authentic cyber dark theme (`#0B111E`, `#0F172A`), glowing indicators |
| **Icons** | Lucide React | Crisp, cybersecurity-oriented iconography |
| **Performance** | Native System Typography & `React.memo` | Zero-latency instant loading, 60fps renders |
| **State Storage** | LocalStorage Engine | Persistence across sessions with one-click factory reset |

---

## 3. Core Engine: Sequential First-Match Evaluation

At the core of NETSHIELD is the evaluation engine (`src/utils/firewallEngine.ts`), which mirrors real enterprise firewall firmware:

1. **Top-to-Bottom Sequential Evaluation**:
   - Policies are indexed from Priority #1 down to #N.
   - Incoming packets are evaluated against each rule in strict order.
2. **5-Point Inspection Criteria**:
   - **Inbound Interface**: (`port1 [LAN]`, `port2 [WAN]`, `dmz`, or `any`)
   - **Outbound Interface**: (`port1 [LAN]`, `port2 [WAN]`, `dmz`, or `any`)
   - **Source IP / Subnet**: Exact IPv4 (`192.168.1.45`), CIDR mask (`192.168.1.0/24`, `10.0.0.0/8`), or `all`.
   - **Destination IP / Subnet**: Exact IPv4 (`142.250.190.46`), CIDR mask, or `all`.
   - **Service / Port**: Standard protocols (`HTTPS:443`, `HTTP:80`, `DNS:53`, `SSH:22`, `RDP:3389`, `ICMP`) or Custom TCP/UDP port.
3. **First-Match Short-Circuiting**:
   - The **very first rule** where all 5 criteria pass dictates the packet's fate (`ALLOW` or `DENY`).
   - Evaluation halts immediately — no subsequent rules are evaluated.
4. **Built-in Implicit Deny Rule 0**:
   - If no custom rule matches, the packet automatically falls through to **Rule 0 (Implicit Deny)**, which drops the packet under a strict zero-trust default stance.

---

## 4. Comprehensive Feature Breakdown

### 🖥️ A. Top Navigation Header & Live Hardware Telemetry
- **Branding**: `NETSHIELD NS-1000` with `NetShield OS v7.4.3`.
- **Live Hardware Telemetry Bar**:
  - **CPU Utilization**: Dynamic animated percentage meter (8% – 32%).
  - **Memory Allocation**: Real-time memory load monitor (38% – 50%).
  - **Active Concurrent Sessions**: Dynamic counter simulating live corporate connection volume (~1,480 sessions).
  - **Network Throughput**: Sustained bandwidth monitor (`418.5 Mbps`).
  - **Cluster Status**: `HA: Standalone (Synchronized)`.
- **Quick Action Bar**:
  - **Simulate Packet**: Instant jump to diagnostic injector.
  - **Export Logs**: Downloads full forward traffic history as `.csv`.
  - **Reset Defaults**: Factory reset confirmation modal restoring initial reference policies.

---

### 📑 B. Executive Security Operations Center (SOC) Dashboard
- **KPI Metrics**:
  - **Enforced Policies**: Active rules count vs disabled rules.
  - **Accepted Traffic**: Number and percentage of allowed packets.
  - **Dropped / Denied**: Number and percentage of perimeter blocks.
  - **Top Active Policy**: Automatically displays the rule with the highest traffic volume.
- **Security Disposition Ratio Bar**:
  - Visual dual-color progress bar showing real-time distribution of `ALLOW` vs `DENY` flows.
- **Physical Hardware Interface Status**:
  - Live status cards for physical ports:
    - `port1 [LAN]`: `192.168.1.1/24` (1000 Mbps Full Duplex, Active)
    - `port2 [WAN]`: `198.51.100.1` (1000 Mbps Full Duplex, Internet Gateway)
    - `dmz`: `172.16.1.1/24` (1000 Mbps Full Duplex, Isolated DMZ)
- **Live Forward Traffic Activity Feed**:
  - Displays the last 5 real-time firewall transactions with timestamps, source, destination, and verdicts.

---

### 🛡️ C. Firewall Policy Management Center
- **Dynamic Rule Priority Re-ordering**:
  - **Move Up (▲)** and **Move Down (▼)** buttons allow re-ordering rule priority.
  - Changing sequence order directly affects traffic decisions, demonstrating how rule placement impacts security.
- **Policy Table Overview**:
  - Columns: `Sequence #`, `ID`, `Name`, `In/Out Interfaces`, `Source IP/Subnet`, `Destination IP/Subnet`, `Service/Port`, `Action Badge (ALLOW/DENY)`, `Hit Counter`, `Status Toggle (Active/Disabled)`, and `Actions (Edit/Delete)`.
- **Pinned Implicit Deny (Rule 0)**:
  - Permanent bottom drop row that cannot be deleted or bypassed.
- **Interactive Search & Multidimensional Filtering**:
  - Filter by search text (Name, IP, subnet, service).
  - Filter by Action (`All`, `ALLOW`, `DENY`).
  - Filter by Interface (`All`, `LAN`, `WAN`, `DMZ`).
- **Policy Creation & Edit Modal**:
  - Policy Name and Admin Comments.
  - Interface selectors (`LAN`, `WAN`, `DMZ`, `any`).
  - Source and Destination Subnet inputs with quick-fill chips (`192.168.1.0/24`, `192.168.1.50/32`, `all`, `172.16.1.10/32`).
  - Built-in CIDR validation preventing invalid syntax.
  - Service picker (`HTTP`, `HTTPS`, `DNS`, `SSH`, `RDP`, `ICMP`, `CUSTOM`).
  - Action selector (`ACCEPT` in emerald green vs `DENY` in crimson red).

---

### ⚡ D. Traffic Simulator & Diagnostic Packet Tracer
- **Packet Header Constructor**:
  - Custom input for Source IP, Inbound Interface, Destination IP, Outbound Interface, Service, and Port.
  - Quick-fill helper buttons for standard lab IP addresses (`192.168.1.45 [LAN PC]`, `198.51.100.22 [Attacker]`, `142.250.190.46 [Google]`, `1.1.1.1 [Cloudflare DNS]`, `172.16.1.10 [DMZ]`).
- **6 Pre-Configured Attack & Normal Traffic Presets**:
  1. 🌐 **LAN Web Browsing**: Normal HTTPS traffic from internal LAN host to external web (Allowed).
  2. ⚠️ **Threat Actor Probe**: Malicious WAN IP scanning internal port 22 SSH (Blocked by Perimeter Deny).
  3. ⚡ **DNS Resolution**: LAN workstation querying public DNS 1.1.1.1 on port 53 (Allowed).
  4. 🔒 **DevOps to DMZ Bastion**: Admin accessing DMZ bastion server via SSH (Allowed by specific admin rule).
  5. 🚫 **WAN Remote Desktop Probe**: External scan targeting port 3389 RDP (Blocked).
  6. 🛑 **Unsolicited MySQL Probe**: External attacker probing database port 3306 (Dropped by Rule 0 Implicit Deny).
- **High-Impact Verdict Banner**:
  - Glowing **TRAFFIC PERMITTED (ALLOW)** in emerald or **TRAFFIC DROPPED (DENY)** in ruby.
  - Execution duration in milliseconds (e.g., `0.35 ms`).
  - Displays winning policy name and rule ID.
- **Sequential Top-to-Bottom Evaluation Trace**:
  - Shows every evaluated rule in sequential order #1, #2, ...
  - Individual pass/fail badges for each of the 5 conditions:
    - `[✓] In-Interface`
    - `[✓] Out-Interface`
    - `[✓] Source IP/Subnet`
    - `[✓] Destination IP/Subnet`
    - `[✓] Service/Port`
  - Explains the exact match reason or failure point (e.g., *"Service mismatch: expected SSH, packet is HTTPS"*).
  - Highlights winning rule and confirms immediate processing stop.

---

### 📜 E. Forward Traffic Log & Reporting Center
- **Live Forward Traffic Log Table**:
  - Real-time logging of all simulated packets.
  - Details logged: Timestamp, Source IP & Interface, Destination IP & Interface, Service & Port, Action, Matched Policy ID & Name, Packet Size (Bytes), and Status.
- **Traffic Generation Tools**:
  - **Generate Traffic Burst**: Simulates an instant batch of realistic mixed network transactions (DNS queries, web traffic, external probes, DMZ management).
- **Filtering & Search**:
  - Instant text search across Source IP, Destination IP, Policy Name.
  - Filter by verdict (`Accepted Only` vs `Blocked Only`).
  - Filter by service (`HTTPS`, `HTTP`, `DNS`, `SSH`, `RDP`).
- **Export & Maintenance**:
  - **Export CSV**: Generates RFC-compliant CSV download `NetShield_Traffic_Logs_YYYY-MM-DD.csv`.
  - **Clear Logs**: Purges log history from storage.

---

## 5. Summary Table of Pre-Configured Seed Policies

| Seq | Policy Name | From → To | Source Subnet | Destination Subnet | Service | Action | Purpose |
|:---:|---|:---:|:---:|:---:|:---:|:---:|---|
| #1 | `Allow_Corporate_Web_HTTPS` | LAN → WAN | `192.168.1.0/24` | `all` | `HTTPS:443` | **ALLOW** | Secure web browsing for internal users |
| #2 | `Allow_Corporate_Web_HTTP` | LAN → WAN | `192.168.1.0/24` | `all` | `HTTP:80` | **ALLOW** | Standard HTTP web access |
| #3 | `Allow_DNS_Queries` | LAN → WAN | `192.168.1.0/24` | `all` | `DNS:53` | **ALLOW** | Resolving external DNS names |
| #4 | `Block_Threat_Actor_Subnet` | WAN → any | `198.51.100.0/24`| `all` | `ALL` | **DENY** | Blocking known malicious scanner subnet |
| #5 | `Allow_DevOps_SSH_to_DMZ` | LAN → DMZ | `192.168.1.50/32`| `172.16.1.10/32` | `SSH:22` | **ALLOW** | Secure bastion access for DevOps engineer |
| #6 | `Block_Inbound_RDP_Perimeter` | WAN → any | `all` | `all` | `RDP:3389` | **DENY** | Blocking external Remote Desktop brute-force |
| **0** | **Implicit Deny (Rule 0)** | **any → any** | **all** | **all** | **ALL** | **DENY** | **Permanent built-in zero-trust catch-all drop** |

---

## 6. Accessing the Application

The application is running locally:
```
URL: http://127.0.0.1:5173/
```
All state is stored in your browser's local storage and can be reset at any time using the **"Reset Defaults"** button in the top navigation bar.
