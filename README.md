# NETSHIELD

> Enterprise Next-Generation Firewall Policy Simulator

A browser-based firewall simulator inspired by real-world enterprise security workflows. NETSHIELD demonstrates how firewall policies are evaluated, how packets are processed, and how network traffic is monitored through logs and diagnostics.

## Live Demo

- 🌐 **Live:**-- https://nettshield.vercel.app
- 💻 **GitHub:** 

---

## Preview

<img width="1362" height="638" alt="image" src="https://github.com/user-attachments/assets/d2b8e936-81dd-42d8-8c23-80067cd009f0" />

<img width="1365" height="640" alt="image" src="https://github.com/user-attachments/assets/77becd25-135f-4f31-801b-b63c905862df" />

<img width="1365" height="639" alt="image" src="https://github.com/user-attachments/assets/4ce1a09e-5396-499a-af78-31dceec474ff" />


---

## Features

- Rule-based Firewall Policy Management
- Sequential First-Match Rule Engine
- Traffic Packet Simulation
- Allow / Deny Policy Evaluation
- LAN, WAN and DMZ Interface Simulation
- Real-Time Traffic Logs
- Packet Diagnostics
- Local Storage Persistence
- Modern SOC-style Dashboard

---

## How It Works

1. Create a firewall policy.
2. Define the source, destination, service and action.
3. Simulate packet traffic.
4. The engine evaluates rules from top to bottom.
5. The first matching rule determines whether the packet is allowed or denied.
6. A traffic log is generated with the matched policy and verdict.

---

## Firewall Workflow

Source Device

↓

LAN Interface

↓

Firewall Policy Evaluation

↓

Rule Match

↓

ALLOW / DENY

↓

Traffic Log Generated

---

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Local Storage

---

## Project Goal

NETSHIELD was built to understand how enterprise firewalls process network traffic without requiring physical firewall hardware. The project focuses on practical concepts such as firewall policies, traffic flow, rule evaluation and network troubleshooting.

---

## Disclaimer

NETSHIELD is an educational simulator inspired by enterprise firewall workflows. It is an independent learning project and is not affiliated with Fortinet or any commercial firewall vendor.
