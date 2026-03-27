# Restricted Grant Monitor

**Overview**

A browser-based tool for nonprofit finance teams to review **restricted grant** pacing, spending volatility, and operational risk in one place. Enter grant details and recent activity; the app returns projected landing, scenario comparisons, and a transparent risk score. All calculations run locally with **deterministic, rule-based logic**—no external services or machine learning.

**Author:** Ryan Chen  
**Live application:** https://restricted-grant-monitor.vercel.app/

---

## Local development

```bash
git clone https://github.com/rychenusa/restricted-grant-monitor.git
cd restricted-grant-monitor
npm install
npm run dev
```

Open the URL shown in the terminal (typically http://localhost:3000). The app is fully client-side; no API keys or authentication are required.

---

## Inputs

The dashboard expects:

- Grant amount and period (start and end dates)  
- Cumulative spend to date  
- Monthly spend for the three most recent months  
- Date the underlying data was last updated  
- Operational context: tracking method, number of programs, overhead band, and reclassification frequency  

These inputs support burn-rate estimates, projected landing as a percentage of the grant, and volatility and freshness signals.

---

## Outputs

| Output | Description |
|--------|-------------|
| **Projected landing %** | Expected spend at the end of the grant vs the award. A **97–100%** band is treated as a practical target (closing rarely lands exactly at 100% due to timing and adjustments). |
| **Scenario comparison** | Burn adjusted ±10% to illustrate sensitivity of landing and remaining buffer. |
| **Risk score** | Composite score from burn position, volatility, acceleration vs recent average, data freshness, and allocation complexity. A higher score indicates more monitoring attention, not a forecast of default. |
| **Automation readiness** | Highlights when combined conditions suggest reviewing automated monitoring or accounting workflows. |
| **Export** | Plain-text summary suitable for email, board packets, or internal notes. |

---

## Stack

Next.js, React, TypeScript, Tailwind CSS. Hosted on Vercel.

---

## Repository structure

| Path | Role |
|------|------|
| `app/` | Application UI and pages |
| `lib/` | Burn and risk calculations |
| `public/` | Static assets |
| `vercel.json` | Deployment configuration |
