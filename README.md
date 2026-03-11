# Restricted Grant Monitor

A lightweight diagnostic dashboard for monitoring **restricted grant burn pacing and operational risk**.

The monitor projects end-of-grant landing, detects spending volatility, and flags when manual accounting workflows may introduce risk. Designed to be fast, interpretable, and usable during **monthly close or board preparation**.

**Live demo:**  
https://restricted-grant-monitor.vercel.app/

Built by Ryan Chen.

---

## Overview

Restricted grants rarely land exactly at their target spend due to accrual timing, volatility in program expenses, and operational complexity.

The Restricted Grant Monitor provides a quick diagnostic of whether a grant is pacing toward a safe landing and highlights signals that may introduce operational risk.

The system emphasizes **transparent rule-based diagnostics** rather than opaque models so finance teams can immediately understand why a grant may be off track.

---

## Core Inputs

The monitor requires a small set of inputs typically available during grant monitoring:

- **Grant amount** — total value of the restricted grant  
- **Spend to date** — cumulative expenses charged to the grant  
- **Grant timeline** — start and end dates defining the grant duration  
- **Recent monthly spend** — the last three months of spending activity  
- **Last updated date** — indicates how fresh the financial data is  
- **Operational structure** — manual tracking, program allocations, overhead structure, and reclassification frequency  

These inputs allow the monitor to estimate grant pacing and operational reliability.

---

## Key Diagnostics

### Projected Landing
Estimates where the grant is likely to land relative to its total value using historical burn pace.

Results are evaluated against a **97–100% safety band**, reflecting the practical reality that grants rarely land exactly at 100% due to accrual timing and final adjustments.

### Spend Volatility
Measures instability in recent monthly spending. Large swings often signal operational instability or rushed end-of-grant spending.

### Sensitivity Analysis
Simulates **±10% burn adjustments** to show how small pacing changes affect final grant landing.

---

## Risk Score

The Risk Score aggregates operational signals that affect the reliability of the projected landing.

| Component | Max Score | Description |
|-----------|-----------|-------------|
| Burn position | 40 | Distance between projected landing and safety band |
| Volatility | 20 | Instability in recent monthly spend |
| Acceleration | 10 | Current month spending relative to recent average |
| Data freshness | 15 | Time since financial data was last updated |
| Allocation complexity | 15 | Manual tracking, program allocations, and reclassification activity |

Higher scores indicate greater risk that the grant may miss its target landing.

---

## Snapshot Export

The **Copy Summary** feature generates a plain-text snapshot of the grant’s status, allowing teams to quickly share:

- burn pacing  
- projected landing  
- key risk signals  
- operational structure  

Useful during **monthly close, CFO updates, or board preparation**.

---

## Running Locally

```bash
git clone https://github.com/rychenusa/restricted-grant-monitor.git
cd restricted-grant-monitor
npm install
npm run dev
