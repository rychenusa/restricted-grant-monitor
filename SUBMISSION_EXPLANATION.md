# Restricted Grant Burn & Risk Monitor

## Overview

Restricted grants are operationally high-stakes. Finance leaders must land within tight burn bands while managing volatility, allocation complexity, and data freshness — often through manual spreadsheets.

Before rebuilding models or escalating issues internally, they need a fast, directional answer:

- Are we on track?
- Are we drifting into risk?
- Is manual oversight still sufficient?

This tool reframes grant tracking from static reporting to forward-looking risk diagnostics.

---

## What It Does

A lightweight, rule-based diagnostic that projects landing position and quantifies exposure across five dimensions:

- **Burn Position**
- **Volatility**
- **Acceleration (Delta)**
- **Data Freshness**
- **Allocation Complexity**

The output surfaces:

- Projected landing percentage
- Dollar buffer / shortfall
- Composite risk score (0–100)
- Clear risk band (Green / Yellow / Red)
- Escalation signals when structure becomes fragile

All scoring is deterministic and transparent — no black-box modeling.

---

## Design Principles

- **Low Friction** – Single-page interface, no login, no integrations.
- **Transparent Logic** – Rule-based scoring with visible bands and thresholds.
- **Forward-Looking** – Emphasis on projected exposure, not historical reporting.
- **Action-Oriented** – Clear signal when manual tracking may no longer be sufficient.

The goal is a fast, structured “sanity check” that can be run in seconds but still guide real oversight decisions.

---

## Why It Matters

Most grant oversight lives in spreadsheets optimized for bookkeeping, not risk diagnostics.

By modeling burn trajectory, volatility, structural complexity, and data reliability together, this tool:

- Surfaces fragility before close
- Reduces spreadsheet dependency
- Creates clearer escalation thresholds
- Encourages disciplined operational monitoring

It demonstrates how structured, rule-based systems can convert messy operational inputs into decision-ready signals.

---

## Implementation

Built as a single-page application using:

- Next.js
- TypeScript
- Tailwind CSS

Risk scoring logic is modularized into a deterministic calculation layer with explicit band definitions and edge-case handling.

AI-assisted development was used to accelerate layout scaffolding, formalize scoring rules, and refine UX clarity while preserving deterministic system behavior.
