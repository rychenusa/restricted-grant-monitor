export type TrackingMethod = 'Manual' | 'Mixed' | 'ERP';
export type NumPrograms = '1' | '2' | '3+';
export type OverheadBand = '<15%' | '15–30%' | '>30%';
export type ReclassFreq = 'None' | 'Monthly' | 'Weekly';

export type RiskZone = 'Ideal' | 'Caution' | 'High Risk';

export interface GrantInputs {
  grantAmount: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  spendToDate: number;
  spendM2: number;
  spendM1: number;
  spendM0: number;
  lastUpdatedDate: string; // YYYY-MM-DD
  trackingMethod: TrackingMethod;
  numPrograms: NumPrograms;
  overheadPctBand: OverheadBand;
  reclassFreq: ReclassFreq;
}

export interface ScenarioResult {
  label: string;
  projectedLandingPct: number;
  remainingBuffer: number;
  zone: RiskZone;
}

export interface CalculationResult {
  monthsElapsed: number;
  monthsRemaining: number;
  burnRate: number;
  projectedSpend: number;
  projectedLandingPct: number;
  remainingBuffer: number;
  riskZone: RiskZone;

  volatilityRatio: number;
  volatilityScore: number;
  volatilityNote?: string;

  delta: number;
  deltaScore: number;
  deltaNote?: string;

  daysSinceUpdate: number;
  freshnessScore: number;

  complexityScore: number;
  burnScore: number;

  compositeScore: number;
  compositeBand: 'Low' | 'Moderate' | 'High';

  scenarios: ScenarioResult[];

  automationFlagged: boolean;
  automationReasons: string[];
}

function safeParseDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function wholeMonthsDiff(earlier: Date, later: Date): number {
  if (later.getTime() < earlier.getTime()) return 0;
  const years = later.getFullYear() - earlier.getFullYear();
  const months = later.getMonth() - earlier.getMonth();
  let diff = years * 12 + months;
  if (later.getDate() < earlier.getDate()) diff -= 1;
  return Math.max(0, diff);
}

function computeRiskZone(projectedLandingPct: number): RiskZone {
  if (projectedLandingPct >= 97 && projectedLandingPct <= 100) {
    return 'Ideal';
  }
  if (
    (projectedLandingPct >= 95 && projectedLandingPct < 97) ||
    (projectedLandingPct > 100 && projectedLandingPct <= 102)
  ) {
    return 'Caution';
  }
  return 'High Risk';
}

function computeBurnScore(projectedLandingPct: number): number {
  if (projectedLandingPct >= 97 && projectedLandingPct <= 100) {
    return 5;
  }
  if (projectedLandingPct >= 95 && projectedLandingPct < 97) {
    return 15;
  }
  if (projectedLandingPct > 100 && projectedLandingPct <= 102) {
    return 25;
  }
  if (projectedLandingPct < 95) {
    return 30;
  }
  if (projectedLandingPct > 102) {
    return 40;
  }
  return 0;
}

function computeVolatility(
  spendM2: number,
  spendM1: number,
  spendM0: number,
): { ratio: number; score: number; note?: string } {
  const values = [spendM2, spendM1, spendM0];
  const sum = values.reduce((acc, v) => acc + v, 0);
  const avg3 = sum / 3;
  if (avg3 <= 0) {
    return {
      ratio: 0,
      score: 0,
      note: 'Insufficient spend history to compute volatility (treated as 0).',
    };
  }
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const ratio = (maxVal - minVal) / avg3;

  let score = 0;
  if (ratio < 0.15) score = 3;
  else if (ratio < 0.3 + 1e-9) score = 8;
  else if (ratio < 0.45 + 1e-9) score = 14;
  else score = 20;

  return { ratio, score };
}

function computeDelta(
  spendM2: number,
  spendM1: number,
  spendM0: number,
): { delta: number; score: number; note?: string } {
  const prev2Avg = (spendM2 + spendM1) / 2;
  if (prev2Avg <= 0) {
    return {
      delta: 0,
      score: 0,
      note: 'Insufficient prior months to compute acceleration (treated as 0).',
    };
  }
  const delta = (spendM0 - prev2Avg) / prev2Avg;

  let score = 0;
  if (delta >= -0.1 && delta <= 0.1) {
    score = 2;
  } else if (delta > 0.1 && delta <= 0.25) {
    score = 6;
  } else if (delta > 0.25) {
    score = 10;
  } else if (delta >= -0.25 && delta < -0.1) {
    score = 4;
  } else if (delta < -0.25) {
    score = 8;
  }

  return { delta, score };
}

function computeFreshness(daysSinceUpdate: number): number {
  if (daysSinceUpdate < 30) return 3;
  if (daysSinceUpdate <= 60) return 8;
  return 15;
}

function computeComplexityScore(
  trackingMethod: TrackingMethod,
  numPrograms: NumPrograms,
  overheadPctBand: OverheadBand,
  reclassFreq: ReclassFreq,
): number {
  let score = 0;

  if (trackingMethod === 'Manual') score += 5;
  else if (trackingMethod === 'Mixed') score += 3;
  else score += 1;

  if (numPrograms === '1') score += 1;
  else if (numPrograms === '2') score += 2;
  else score += 3;

  if (overheadPctBand === '<15%') score += 1;
  else if (overheadPctBand === '15–30%') score += 2;
  else score += 3;

  if (reclassFreq === 'None') score += 1;
  else if (reclassFreq === 'Monthly') score += 2;
  else score += 3;

  return Math.min(score, 15);
}

function computeCompositeBand(score: number): 'Low' | 'Moderate' | 'High' {
  if (score <= 30) return 'Low';
  if (score <= 60) return 'Moderate';
  return 'High';
}

export function calculateMetrics(inputs: GrantInputs): CalculationResult {
  const today = new Date();

  const start = safeParseDate(inputs.startDate);
  const end = safeParseDate(inputs.endDate);
  const lastUpdate = safeParseDate(inputs.lastUpdatedDate);

  const monthsElapsedRaw = start != null ? wholeMonthsDiff(start, today) : 1;
  const monthsElapsed = Math.max(1, monthsElapsedRaw);

  const monthsRemaining = end != null ? wholeMonthsDiff(today, end) : 0;

  const burnRate = monthsElapsed > 0 ? inputs.spendToDate / monthsElapsed : 0;
  const projectedSpend = inputs.spendToDate + burnRate * monthsRemaining;

  const grantAmountPositive = inputs.grantAmount > 0 ? inputs.grantAmount : 0;
  const projectedLandingPct =
    grantAmountPositive > 0
      ? (projectedSpend / grantAmountPositive) * 100
      : 0;

  const remainingBuffer = inputs.grantAmount - projectedSpend;

  const riskZone = computeRiskZone(projectedLandingPct);
  const burnScore = computeBurnScore(projectedLandingPct);

  const {
    ratio: volatilityRatio,
    score: volatilityScore,
    note: volatilityNote,
  } = computeVolatility(inputs.spendM2, inputs.spendM1, inputs.spendM0);

  const { delta, score: deltaScore, note: deltaNote } = computeDelta(
    inputs.spendM2,
    inputs.spendM1,
    inputs.spendM0,
  );

  let daysSinceUpdate = 0;
  if (lastUpdate) {
    const msDiff = today.getTime() - lastUpdate.getTime();
    daysSinceUpdate = Math.max(
      0,
      Math.floor(msDiff / (1000 * 60 * 60 * 24)),
    );
  }

  const freshnessScore = computeFreshness(daysSinceUpdate);
  const complexityScore = computeComplexityScore(
    inputs.trackingMethod,
    inputs.numPrograms,
    inputs.overheadPctBand,
    inputs.reclassFreq,
  );

  const compositeScoreRaw =
    burnScore +
    volatilityScore +
    deltaScore +
    freshnessScore +
    complexityScore;
  const compositeScore = Math.min(compositeScoreRaw, 100);
  const compositeBand = computeCompositeBand(compositeScore);

  const scenarios: ScenarioResult[] = [1, 0.9, 1.1].map((factor, idx) => {
    const labels = ['Current burn', '-10% burn', '+10% burn'];
    const scenarioBurnRate = burnRate * factor;
    const scenarioProjectedSpend =
      inputs.spendToDate + scenarioBurnRate * monthsRemaining;
    const scenarioLandingPct =
      grantAmountPositive > 0
        ? (scenarioProjectedSpend / grantAmountPositive) * 100
        : 0;
    const scenarioBuffer = inputs.grantAmount - scenarioProjectedSpend;
    const scenarioZone = computeRiskZone(scenarioLandingPct);

    return {
      label: labels[idx],
      projectedLandingPct: scenarioLandingPct,
      remainingBuffer: scenarioBuffer,
      zone: scenarioZone,
    };
  });

  const automationReasons: string[] = [];
  if (complexityScore >= 10) {
    automationReasons.push(
      `High allocation complexity (score ${complexityScore} ≥ 10).`,
    );
  }
  if (volatilityRatio > 0.3) {
    automationReasons.push(
      `Recent spend volatility exceeds 30% band (ratio ${(volatilityRatio * 100).toFixed(
        0,
      )}%).`,
    );
  }
  if (delta > 0.15) {
    automationReasons.push(
      `Current month spend is more than 15% above the prior 2‑month average (delta ${(delta * 100).toFixed(
        0,
      )}%).`,
    );
  }
  if (freshnessScore >= 8) {
    automationReasons.push(
      `Data is ${daysSinceUpdate} days old (freshness score ≥ 8).`,
    );
  }
  if (inputs.trackingMethod === 'Manual') {
    automationReasons.push('Grant tracking is fully manual.');
  }

  const automationFlagged = automationReasons.length > 0;

  return {
    monthsElapsed,
    monthsRemaining,
    burnRate,
    projectedSpend,
    projectedLandingPct,
    remainingBuffer,
    riskZone,
    volatilityRatio,
    volatilityScore,
    volatilityNote,
    delta,
    deltaScore,
    deltaNote,
    daysSinceUpdate,
    freshnessScore,
    complexityScore,
    burnScore,
    compositeScore,
    compositeBand,
    scenarios,
    automationFlagged,
    automationReasons,
  };
}

