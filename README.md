# Restricted Grant Monitor

**Nonprofit Grant Burn & Risk Monitor**

A lightweight diagnostic tool for monitoring **restricted grant pacing, volatility, and operational risk**. The monitor projects end-of-grant landing, flags instability in recent spending, and surfaces when manual accounting workflows may introduce risk.

Designed to be fast, interpretable, and usable during **monthly close or board preparation**.

**Built by Ryan Chen.**

**Live app:** https://restricted-grant-monitor.vercel.app/

---

## Quick start

```bash
git clone https://github.com/rychenusa/restricted-grant-monitor.git
cd restricted-grant-monitor
npm install
npm run dev
```

Open the app in your browser and enter the grant inputs at the top of the dashboard.

Main inputs include:

- **Grant amount** — total value of the restricted grant  
- **Spend to date** — cumulative expenses charged to the grant  
- **Start and end dates** — defines the grant timeline  
- **Recent monthly spend** — the last three months of expenses  
- **Last updated date** — indicates how fresh the financial data is  
- **Operational structure** — manual tracking, program allocations, overhead band, and reclassification frequency  

The monitor then calculates projected landing, risk signals, and automation readiness.

---

## How it works

The monitor evaluates whether a grant is pacing toward a safe landing using a small set of interpretable signals.

### Burn rate

Burn rate is calculated using average monthly spend.

```
burn rate = total spend to date ÷ elapsed months
projected spend = burn rate × total grant duration
```

This produces the **Projected Landing %**, which indicates whether the grant is likely to overspend or underspend.

### Safety band

The monitor uses a **97–100% safety band**.

In real nonprofit finance workflows, grants rarely land exactly at 100% due to accrual timing, reclasses, and final-period spending adjustments. The band reflects a practical target range.

### Scenario comparison

The tool also simulates **±10% burn adjustments** to show how sensitive the final landing is to pacing changes.

This helps controllers quickly understand how small spending changes affect the final grant position.

All calculations are **rule-based and transparent**. There are no machine learning models or black-box scoring systems.

---

## Risk scoring framework

The **Risk Score** aggregates several operational signals that affect grant reliability.

| Component | Max Score | Description |
|-----------|-----------|-------------|
| Burn position | 40 | Distance between projected landing and safety band |
| Volatility | 20 | Instability in recent monthly spend |
| Acceleration | 10 | Current month spend relative to recent average |
| Data freshness | 15 | Time since the financial data was last updated |
| Allocation complexity | 15 | Manual tracking, program count, overhead structure, and reclassification frequency |

Higher scores indicate greater risk that the grant may miss its target landing.

---

## Automation readiness

The monitor also highlights when operational conditions suggest value from automation.

Signals include:

- **High spend volatility**
- **Stale financial data**
- **Manual grant tracking**
- **Frequent accounting reclassifications**
- **High allocation complexity**

When several of these appear together, the system recommends evaluating automated grant monitoring or accounting workflows.

---

## Export snapshot

The **Copy Summary** feature generates a plain-text snapshot of the grant's status.

Controllers can quickly share:

- burn pacing
- projected landing
- risk signals
- operational structure

This allows finance teams to communicate grant status to **CFOs, boards, or program managers** without manually compiling the analysis.

---

## Project structure

| Path | Purpose |
|------|--------|
| `app/` | Application UI and dashboard logic |
| `components/` | UI components and scoring modules |
| `utils/` | Burn calculations and risk scoring functions |
| `public/` | Static assets |
| `vercel.json` | Deployment configuration |

---

## Running locally

Anyone can clone the repository and run the monitor locally.

The application runs entirely client-side and requires no external APIs or authentication.

---

## Tech

- Next.js  
- React  
- TypeScript  
- Tailwind CSS  
- Vercel deployment  

All calculations are deterministic and executed directly in the browser.
