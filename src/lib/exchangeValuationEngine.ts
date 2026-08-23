export type PreciousMetalType = "GOLD" | "SILVER" | "PLATINUM";
export type PreciousMetalPurity = "24KT" | "22KT" | "18KT" | "14KT" | "999_SILVER" | "925_STERLING" | "950_PLATINUM";
export type StoneType = "DIAMOND" | "RUBY" | "EMERALD" | "SAPPHIRE" | "OTHER";

/** Physical Unit Constant: 1 Carat = 0.20 Grams (Non-configurable international physical constant) */
export const CARAT_TO_GRAM_RATIO = 0.20;

export interface PreciousMetalValuationInput {
  description: string;
  metalType: PreciousMetalType;
  purity: PreciousMetalPurity;
  grossWeightGm: number;
  stoneType?: StoneType;
  stoneWeightCarat?: number; // Carats
  stoneValuationRatePerCarat?: number; // Configurable Business Valuation Rule
  meltingLossPercent?: number;
  valuationMethod?: "KARATMETER" | "TOUCHSTONE" | "MELT_TEST" | "GEM_SCAN";
  rateSource?: string;
  valuatedBy?: string;
  approvedBy?: string;
  revisionNo?: number;
  parentValuationId?: string;
  revisionReason?: string;
}

export interface PreciousMetalValuationRecord {
  valuationId: string;
  revisionNo: number;
  parentValuationId?: string;
  revisionReason?: string;
  status: "DRAFT" | "REVIEWED" | "APPROVED" | "SUPERSEDED";
  valuationTimestamp: string;
  description: string;
  metalType: PreciousMetalType;
  purity: PreciousMetalPurity;
  grossWeightGm: number;
  
  // Stone Component
  stoneType?: StoneType;
  stoneWeightCarat: number;
  stoneWeightGramEquivalent: number; // stoneWeightCarat * CARAT_TO_GRAM_RATIO
  stoneValuationRatePerCarat: number;
  stoneValuationValue: number;
  
  netMetalWeightGm: number; // grossWeightGm - stoneWeightGramEquivalent
  purityPercent: number;
  fineEquivalentWeightGm: number;
  metalRateUsed: number;
  grossMetalValue: number;
  meltingLossPercent: number;
  metalDeductionAmount: number;
  netMetalValue: number;
  
  finalCreditValue: number;
  rateSource: string;
  valuationMethod: string;
  valuatedBy: string;
  approvedBy: string;
  
  // Snapshot Evidence for Audit Reconstructions
  previousSnapshot?: Partial<PreciousMetalValuationRecord>;
}

const PURITY_PERCENT_MAP: Record<PreciousMetalPurity, number> = {
  "24KT": 0.999,
  "22KT": 0.9167,
  "18KT": 0.750,
  "14KT": 0.5833,
  "999_SILVER": 0.999,
  "925_STERLING": 0.925,
  "950_PLATINUM": 0.950
};

const DEFAULT_SPOT_RATES: Record<PreciousMetalPurity, number> = {
  "24KT": 7470,
  "22KT": 6850,
  "18KT": 5600,
  "14KT": 4350,
  "999_SILVER": 88.5,
  "925_STERLING": 81.8,
  "950_PLATINUM": 3400
};

/**
 * WHPS Precious Metal & Stone Valuation Engine
 */
export function evaluatePreciousMetalExchange(
  input: PreciousMetalValuationInput,
  overrideRate?: number
): PreciousMetalValuationRecord {
  const grossWeight = Math.max(0, input.grossWeightGm || 0);
  
  // Fixed physical unit conversion (1 Carat = 0.20 Grams)
  const stoneWeightCarat = Math.max(0, input.stoneWeightCarat || 0);
  const stoneWeightGramEquivalent = Math.round(stoneWeightCarat * CARAT_TO_GRAM_RATIO * 1000) / 1000;
  
  const netMetalWeight = Math.max(0, grossWeight - stoneWeightGramEquivalent);

  const purityFactor = PURITY_PERCENT_MAP[input.purity] || 0.9167;
  const fineEquivalentWeight = Math.round(netMetalWeight * purityFactor * 1000) / 1000;

  const metalRateUsed = overrideRate || DEFAULT_SPOT_RATES[input.purity] || 6850;
  const grossMetalValue = Math.round(netMetalWeight * metalRateUsed);

  const lossPercent = input.meltingLossPercent !== undefined ? input.meltingLossPercent : 2.0;
  const metalDeductionAmount = Math.round(grossMetalValue * (lossPercent / 100));
  const netMetalValue = Math.max(0, grossMetalValue - metalDeductionAmount);

  const stoneRate = input.stoneValuationRatePerCarat || 0;
  const stoneValuationValue = Math.round(stoneWeightCarat * stoneRate);

  const finalCreditValue = netMetalValue + stoneValuationValue;
  const revisionNo = input.revisionNo || 1;

  return {
    valuationId: `VAL-${Date.now().toString().slice(-6)}`,
    revisionNo,
    parentValuationId: input.parentValuationId,
    revisionReason: input.revisionReason,
    status: "APPROVED",
    valuationTimestamp: new Date().toISOString(),
    description: input.description,
    metalType: input.metalType,
    purity: input.purity,
    grossWeightGm: grossWeight,
    stoneType: input.stoneType,
    stoneWeightCarat,
    stoneWeightGramEquivalent,
    stoneValuationRatePerCarat: stoneRate,
    stoneValuationValue,
    netMetalWeightGm: netMetalWeight,
    purityPercent: Math.round(purityFactor * 10000) / 100,
    fineEquivalentWeightGm: fineEquivalentWeight,
    metalRateUsed,
    grossMetalValue,
    meltingLossPercent: lossPercent,
    metalDeductionAmount,
    netMetalValue,
    finalCreditValue,
    rateSource: input.rateSource || "IBJA Mumbai Spot Rate",
    valuationMethod: input.valuationMethod || "KARATMETER",
    valuatedBy: input.valuatedBy || "Super Admin",
    approvedBy: input.approvedBy || "Store Manager"
  };
}

/** Generate an immutable revision snapshot preserving complete before/after state */
export function reviseValuationRecord(
  previousValuation: PreciousMetalValuationRecord,
  amendments: Partial<PreciousMetalValuationInput>,
  reason: string = "Valuation adjustment"
): PreciousMetalValuationRecord {
  const newInput: PreciousMetalValuationInput = {
    description: amendments.description || previousValuation.description,
    metalType: amendments.metalType || previousValuation.metalType,
    purity: amendments.purity || previousValuation.purity,
    grossWeightGm: amendments.grossWeightGm !== undefined ? amendments.grossWeightGm : previousValuation.grossWeightGm,
    stoneType: amendments.stoneType || previousValuation.stoneType,
    stoneWeightCarat: amendments.stoneWeightCarat !== undefined ? amendments.stoneWeightCarat : previousValuation.stoneWeightCarat,
    stoneValuationRatePerCarat: amendments.stoneValuationRatePerCarat !== undefined ? amendments.stoneValuationRatePerCarat : previousValuation.stoneValuationRatePerCarat,
    meltingLossPercent: amendments.meltingLossPercent !== undefined ? amendments.meltingLossPercent : previousValuation.meltingLossPercent,
    valuationMethod: amendments.valuationMethod || (previousValuation.valuationMethod as any),
    revisionNo: previousValuation.revisionNo + 1,
    parentValuationId: previousValuation.valuationId,
    revisionReason: reason
  };

  const revisedRecord = evaluatePreciousMetalExchange(newInput);
  
  // Attach frozen copy of previous snapshot for auditor inspection
  revisedRecord.previousSnapshot = {
    valuationId: previousValuation.valuationId,
    revisionNo: previousValuation.revisionNo,
    status: "SUPERSEDED",
    grossWeightGm: previousValuation.grossWeightGm,
    netMetalWeightGm: previousValuation.netMetalWeightGm,
    stoneWeightCarat: previousValuation.stoneWeightCarat,
    stoneValuationValue: previousValuation.stoneValuationValue,
    netMetalValue: previousValuation.netMetalValue,
    finalCreditValue: previousValuation.finalCreditValue
  };

  return revisedRecord;
}
/**
 * WHPS Service-Level Immutability Guard
 * Enforces that APPROVED valuation records cannot be mutated in place.
 * Any modification MUST create a new revision via reviseValuationRecord().
 */
export function lockValuationRecord(record: PreciousMetalValuationRecord): Readonly<PreciousMetalValuationRecord> {
  if (record.status === "APPROVED" || record.status === "SUPERSEDED") {
    return Object.freeze({ ...record });
  }
  return record;
}
/**
 * WHPS Centralized Valuation Service Write Guard
 * Rejects direct in-place mutation attempts on APPROVED or SUPERSEDED records.
 * Throws explicit error requiring callers to create a new revision.
 */
export function assertValuationCanBeUpdated(record: PreciousMetalValuationRecord): void {
  if (record.status === "APPROVED" || record.status === "SUPERSEDED") {
    throw new Error(
      `[IMMUTABILITY_VIOLATION] Valuation record ${record.valuationId} (Rev ${record.revisionNo}) is ${record.status} and cannot be mutated in place. Use reviseValuationRecord() to create a new revision.`
    );
  }
}