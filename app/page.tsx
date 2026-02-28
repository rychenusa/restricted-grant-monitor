'use client';

import React, { useMemo, useState } from 'react';
import {
  calculateMetrics,
  type GrantInputs,
  type RiskZone,
} from '../lib/calculations';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const percentFormatter = (value: number, digits = 1) =>
  `${value.toFixed(digits)}%`;

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function getZoneClasses(zone: RiskZone): {
  pill: string;
  text: string;
  bgLight: string;
} {
  switch (zone) {
    case 'Ideal':
      return {
        pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        text: 'text-emerald-700',
        bgLight: 'bg-emerald-50',
      };
    case 'Caution':
      return {
        pill: 'bg-amber-50 text-amber-700 border border-amber-200',
        text: 'text-amber-700',
        bgLight: 'bg-amber-50',
      };
    case 'High Risk':
    default:
      return {
        pill: 'bg-rose-50 text-rose-700 border border-rose-200',
        text: 'text-rose-700',
        bgLight: 'bg-rose-50',
      };
  }
}

function buildExportSummary(
  inputs: GrantInputs,
  metrics: ReturnType<typeof calculateMetrics>,
): string {
  const lines: string[] = [];

  lines.push('Nonprofit Grant Burn & Risk Monitor – Snapshot');
  lines.push('---------------------------------------------');
  lines.push(`Grant amount: ${currencyFormatter.format(inputs.grantAmount)}`);
  lines.push(`Start date: ${inputs.startDate}`);
  lines.push(`End date: ${inputs.endDate}`);
  lines.push(`Spend to date: ${currencyFormatter.format(inputs.spendToDate)}`);
  lines.push('');
  lines.push(
    `Months elapsed / remaining: ${metrics.monthsElapsed} / ${metrics.monthsRemaining}`,
  );
  lines.push(
    `Burn rate (per month): ${currencyFormatter.format(metrics.burnRate)}`,
  );
  lines.push(
    `Projected spend: ${currencyFormatter.format(metrics.projectedSpend)}`,
  );
  lines.push(
    `Projected landing %: ${percentFormatter(metrics.projectedLandingPct)}`,
  );
  lines.push(
    `Remaining buffer: ${currencyFormatter.format(metrics.remainingBuffer)}`,
  );
  lines.push(`Burn risk zone: ${metrics.riskZone}`);
  lines.push('');
  lines.push(
    `Composite risk score: ${metrics.compositeScore}/100 (${metrics.compositeBand})`,
  );
  lines.push(`- Burn position: ${metrics.burnScore}/40`);
  lines.push(
    `- Volatility: ${metrics.volatilityScore}/20 (ratio ${(metrics.volatilityRatio * 100).toFixed(
      0,
    )}%)`,
  );
  lines.push(
    `- Acceleration delta: ${metrics.deltaScore}/10 (${(metrics.delta * 100).toFixed(
      0,
    )}% vs prior avg)`,
  );
  lines.push(
    `- Data freshness: ${metrics.freshnessScore}/15 (${metrics.daysSinceUpdate} days old)`,
  );
  lines.push(`- Allocation complexity: ${metrics.complexityScore}/15`);
  lines.push('');
  lines.push('Recent spend (M-2 / M-1 / M0):');
  lines.push(
    `${currencyFormatter.format(inputs.spendM2)}, ${currencyFormatter.format(
      inputs.spendM1,
    )}, ${currencyFormatter.format(inputs.spendM0)}`,
  );
  lines.push('');
  lines.push('Operational structure:');
  lines.push(
    `Tracking: ${inputs.trackingMethod}; Programs: ${inputs.numPrograms}; Overhead band: ${inputs.overheadPctBand}; Reclass: ${inputs.reclassFreq}`,
  );
  lines.push('');
  lines.push('Automation readiness:');
  lines.push(
    metrics.automationFlagged
      ? `Flagged – ${metrics.automationReasons.join(' ')}`
      : 'Not flagged – conditions below thresholds.',
  );

  return lines.join('\n');
}

export default function Page() {
  const today = useMemo(() => new Date(), []);
  const defaultStart = useMemo(() => addMonths(today, -8), [today]);
  const defaultEnd = useMemo(() => addMonths(today, 4), [today]);
  const defaultLastUpdated = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 45);
    return d;
  }, [today]);

  const [inputs, setInputs] = useState<GrantInputs>({
    grantAmount: 300000,
    startDate: formatDateInput(defaultStart),
    endDate: formatDateInput(defaultEnd),
    spendToDate: 220000,
    spendM2: 20000,
    spendM1: 30000,
    spendM0: 40000,
    lastUpdatedDate: formatDateInput(defaultLastUpdated),
    trackingMethod: 'Manual',
    numPrograms: '3+',
    overheadPctBand: '>30%',
    reclassFreq: 'Monthly',
  });

  const [numberInputs, setNumberInputs] = useState<{
    grantAmount: string;
    spendToDate: string;
    spendM2: string;
    spendM1: string;
    spendM0: string;
  }>({
    grantAmount: '300000',
    spendToDate: '220000',
    spendM2: '20000',
    spendM1: '30000',
    spendM0: '40000',
  });

  const metrics = useMemo(() => calculateMetrics(inputs), [inputs]);
  const exportSummary = useMemo(
    () => buildExportSummary(inputs, metrics),
    [inputs, metrics],
  );
  const zoneClasses = getZoneClasses(metrics.riskZone);
  const bufferNegative = metrics.remainingBuffer < 0;

  const [copied, setCopied] = useState(false);

  type NumberField =
    | 'grantAmount'
    | 'spendToDate'
    | 'spendM2'
    | 'spendM1'
    | 'spendM0';

  const handleNumberChange =
    (field: NumberField) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setNumberInputs(prev => ({
        ...prev,
        [field]: raw,
      }));
      const parsed = parseFloat(raw);
      setInputs(prev => ({
        ...prev,
        [field]:
          raw === '' || !Number.isFinite(parsed) || parsed < 0 ? 0 : parsed,
      }));
    };

  type DateField = 'startDate' | 'endDate' | 'lastUpdatedDate';

  const handleDateChange =
    (field: DateField) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputs(prev => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(exportSummary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Nonprofit Grant Burn &amp; Risk Monitor
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            A lightweight, rule-based view so nonprofit controllers can sanity-check restricted grant burn, risk, and volatility in minutes.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
          {/* LEFT: INPUTS */}
          <section className="space-y-4">
            {/* Grant Details */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Grant Details
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Grant Amount
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    value={numberInputs.grantAmount}
                    onChange={handleNumberChange('grantAmount')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Spend To Date
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    value={numberInputs.spendToDate}
                    onChange={handleNumberChange('spendToDate')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    value={inputs.startDate}
                    onChange={handleDateChange('startDate')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    value={inputs.endDate}
                    onChange={handleDateChange('endDate')}
                  />
                </div>
              </div>
            </div>

            {/* Recent Spend */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Recent Spend (Monthly)
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Two Months Ago (M-2)
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    value={numberInputs.spendM2}
                    onChange={handleNumberChange('spendM2')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Last Month (M-1)
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    value={numberInputs.spendM1}
                    onChange={handleNumberChange('spendM1')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Current Month (M0)
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    value={numberInputs.spendM0}
                    onChange={handleNumberChange('spendM0')}
                  />
                </div>
              </div>
            </div>

            {/* Data Freshness */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Data Freshness
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Last Updated Date
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    value={inputs.lastUpdatedDate}
                    onChange={handleDateChange('lastUpdatedDate')}
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Currently {metrics.daysSinceUpdate} days since last update.
                  </p>
                </div>
              </div>
            </div>

            {/* Operational Structure */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Operational Structure
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Tracking Method
                  </label>
                  <select
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    value={inputs.trackingMethod}
                    onChange={e =>
                      setInputs(prev => ({
                        ...prev,
                        trackingMethod: e.target.value as GrantInputs['trackingMethod'],
                      }))
                    }
                  >
                    <option value="Manual">Manual</option>
                    <option value="Mixed">Mixed</option>
                    <option value="ERP">ERP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Number of Programs
                  </label>
                  <select
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    value={inputs.numPrograms}
                    onChange={e =>
                      setInputs(prev => ({
                        ...prev,
                        numPrograms: e.target.value as GrantInputs['numPrograms'],
                      }))
                    }
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3+">3+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Overhead % Band
                  </label>
                  <select
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    value={inputs.overheadPctBand}
                    onChange={e =>
                      setInputs(prev => ({
                        ...prev,
                        overheadPctBand: e.target.value as GrantInputs['overheadPctBand'],
                      }))
                    }
                  >
                    <option value="<15%">&lt;15%</option>
                    <option value="15–30%">15–30%</option>
                    <option value=">30%">&gt;30%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Reclass Frequency
                  </label>
                  <select
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    value={inputs.reclassFreq}
                    onChange={e =>
                      setInputs(prev => ({
                        ...prev,
                        reclassFreq: e.target.value as GrantInputs['reclassFreq'],
                      }))
                    }
                  >
                    <option value="None">None</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-slate-500">
                Complexity feeds the composite risk score and automation readiness.
              </p>
            </div>
          </section>

          {/* RIGHT: RESULTS */}
          <section className="space-y-4">
            {/* Primary metrics */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
                      Projected Landing %
                    </p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight">
                      {percentFormatter(metrics.projectedLandingPct)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Safety band target: <span className="font-medium">97–100%</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
                      Remaining Buffer
                    </p>
                    <p
                      className={`mt-1 text-3xl font-semibold tracking-tight ${
                        bufferNegative ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {currencyFormatter.format(metrics.remainingBuffer)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Grant size: {currencyFormatter.format(inputs.grantAmount)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${zoneClasses.pill}`}
                  >
                    {metrics.riskZone}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Based on projected landing vs allowable band.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 text-xs text-slate-600 sm:grid-cols-3">
                <div>
                  <p className="font-medium text-slate-700">Burn rate (per month)</p>
                  <p className="mt-0.5">
                    {currencyFormatter.format(metrics.burnRate)}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Timeline</p>
                  <p className="mt-0.5">
                    {metrics.monthsElapsed} elapsed / {metrics.monthsRemaining} remaining
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Projected spend</p>
                  <p className="mt-0.5">
                    {currencyFormatter.format(metrics.projectedSpend)}
                  </p>
                </div>
              </div>
            </div>

            {/* Risk score + breakdown */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    Risk Score
                  </h2>
                  <p className="text-xs text-slate-500">
                    Composite across burn position, volatility, acceleration, freshness, and complexity. All scores are rule-based and transparent—no black box AI.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-slate-900">
                    {metrics.compositeScore}/100
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      metrics.compositeBand === 'Low'
                        ? 'text-emerald-700'
                        : metrics.compositeBand === 'Moderate'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {metrics.compositeBand} risk
                  </p>
                </div>
              </div>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    metrics.compositeBand === 'Low'
                      ? 'bg-emerald-500'
                      : metrics.compositeBand === 'Moderate'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(metrics.compositeScore, 100)}%` }}
                />
              </div>

              <dl className="mt-4 grid grid-cols-1 gap-3 text-xs text-slate-600 md:grid-cols-2">
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <dt className="font-medium text-slate-700">
                    Burn position (0–40)
                  </dt>
                  <dd className="mt-0.5 flex items-baseline justify-between">
                    <span>{metrics.burnScore}/40</span>
                    <span className={zoneClasses.text}>
                      {metrics.riskZone}
                    </span>
                  </dd>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <dt className="font-medium text-slate-700">
                    Volatility (0–20)
                  </dt>
                  <dd className="mt-0.5 flex items-baseline justify-between">
                    <span>{metrics.volatilityScore}/20</span>
                    <span className="text-slate-500">
                      {percentFormatter(metrics.volatilityRatio * 100, 0)} range
                    </span>
                  </dd>
                  {metrics.volatilityNote && (
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {metrics.volatilityNote}
                    </p>
                  )}
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <dt className="font-medium text-slate-700">
                    Acceleration delta (0–10)
                  </dt>
                  <dd className="mt-0.5 flex items-baseline justify-between">
                    <span>{metrics.deltaScore}/10</span>
                    <span className="text-slate-500">
                      {percentFormatter(metrics.delta * 100, 0)} vs prior avg
                    </span>
                  </dd>
                  {metrics.deltaNote && (
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {metrics.deltaNote}
                    </p>
                  )}
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <dt className="font-medium text-slate-700">
                    Data freshness (0–15)
                  </dt>
                  <dd className="mt-0.5 flex items-baseline justify-between">
                    <span>{metrics.freshnessScore}/15</span>
                    <span className="text-slate-500">
                      {metrics.daysSinceUpdate} days old
                    </span>
                  </dd>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2 md:col-span-2">
                  <dt className="font-medium text-slate-700">
                    Allocation complexity (0–15)
                  </dt>
                  <dd className="mt-0.5 flex items-baseline justify-between">
                    <span>{metrics.complexityScore}/15</span>
                    <span className="text-slate-500">
                      {inputs.trackingMethod} tracking, {inputs.numPrograms} programs,
                      overhead {inputs.overheadPctBand}, reclass {inputs.reclassFreq}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Scenario comparison */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    Scenario Comparison
                  </h2>
                  <p className="text-xs text-slate-500">
                    Compare current burn vs ±10% to see how quickly the landing and buffer move.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {metrics.scenarios.map(scenario => {
                  const scZoneClasses = getZoneClasses(scenario.zone);
                  const scNegative = scenario.remainingBuffer < 0;
                  return (
                    <div
                      key={scenario.label}
                      className="flex flex-col justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-800">
                          {scenario.label}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${scZoneClasses.pill}`}
                        >
                          {scenario.zone}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">
                            Landing %
                          </span>
                          <span className="font-medium text-slate-900">
                            {percentFormatter(
                              scenario.projectedLandingPct,
                              1,
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">
                            Buffer
                          </span>
                          <span
                            className={`font-medium ${
                              scNegative ? 'text-rose-600' : 'text-slate-900'
                            }`}
                          >
                            {currencyFormatter.format(
                              scenario.remainingBuffer,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Automation readiness */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    Automation Readiness
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Flags when volatility, complexity, stale data, or manual tracking
                    suggest value from more automated grant controls.
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    metrics.automationFlagged
                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                      : 'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}
                >
                  {metrics.automationFlagged ? 'Automation recommended' : 'Manual OK for now'}
                </span>
              </div>

              <div className="mt-3 text-xs text-slate-600">
                {metrics.automationFlagged ? (
                  <>
                    <p className="font-medium text-slate-800">
                      Triggered by:
                    </p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-4">
                      {metrics.automationReasons.map(reason => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p>
                    None of the current conditions cross automation thresholds.
                    Monitor if volatility, acceleration, or data staleness increase.
                  </p>
                )}
              </div>
            </div>

            {/* Export snapshot */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    Export snapshot
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Copy a plain-text summary of this grant&apos;s burn, risk, and structure to share in email or notes.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
                  >
                    Copy summary
                  </button>
                  {copied && (
                    <span className="text-[11px] text-emerald-700">
                      Copied
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-8 border-t border-slate-200 pt-4">
          <div className="flex flex-col justify-between gap-2 text-xs text-slate-500 sm:flex-row sm:items-center">
            <p>
              Designed as a satellite diagnostic for nonprofit finance teams.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}

