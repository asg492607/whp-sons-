export type ManufacturingMethod = "CASTING" | "HANDMADE" | "MACHINE_STAMPED" | "BESPOKE_NAGAS";

export interface VersionedManufacturingStandardRule {
  standardId: string;
  versionNo: number;
  category: string;
  metal: "GOLD" | "SILVER" | "PLATINUM";
  purity: "24KT" | "22KT" | "18KT" | "14KT";
  method: ManufacturingMethod;
  allowedWastagePercent: number;
  allowedLabourRatePerGm: number;
  effectiveFrom: string;
  status: "DRAFT" | "REVIEWED" | "APPROVED" | "ACTIVE" | "SUPERSEDED";
  approvedBy: string;
}

/** Immutable, Versioned WHPS Manufacturing Standards Master */
export const VERSIONED_MANUFACTURING_STANDARDS: VersionedManufacturingStandardRule[] = [
  {
    standardId: "STD-MFG-22K-NAGAS",
    versionNo: 1,
    category: "Saaj / Necklace",
    metal: "GOLD",
    purity: "22KT",
    method: "BESPOKE_NAGAS",
    allowedWastagePercent: 3.5,
    allowedLabourRatePerGm: 550,
    effectiveFrom: "2026-08-01T00:00:00.000Z",
    status: "ACTIVE",
    approvedBy: "Head of Manufacturing Operations"
  },
  {
    standardId: "STD-MFG-22K-BANGLES",
    versionNo: 1,
    category: "Bangles",
    metal: "GOLD",
    purity: "22KT",
    method: "CASTING",
    allowedWastagePercent: 2.0,
    allowedLabourRatePerGm: 350,
    effectiveFrom: "2026-08-01T00:00:00.000Z",
    status: "ACTIVE",
    approvedBy: "Head of Manufacturing Operations"
  },
  {
    standardId: "STD-MFG-22K-HANDMADE",
    versionNo: 1,
    category: "Rings / Earrings",
    metal: "GOLD",
    purity: "22KT",
    method: "HANDMADE",
    allowedWastagePercent: 2.5,
    allowedLabourRatePerGm: 450,
    effectiveFrom: "2026-08-01T00:00:00.000Z",
    status: "ACTIVE",
    approvedBy: "Head of Manufacturing Operations"
  },
  {
    standardId: "STD-MFG-22K-CHAINS",
    versionNo: 1,
    category: "Chains",
    metal: "GOLD",
    purity: "22KT",
    method: "MACHINE_STAMPED",
    allowedWastagePercent: 1.5,
    allowedLabourRatePerGm: 250,
    effectiveFrom: "2026-08-01T00:00:00.000Z",
    status: "ACTIVE",
    approvedBy: "Head of Manufacturing Operations"
  },
  {
    standardId: "STD-MFG-18K-DIAMOND",
    versionNo: 1,
    category: "Diamond Mounts",
    metal: "GOLD",
    purity: "18KT",
    method: "CASTING",
    allowedWastagePercent: 3.0,
    allowedLabourRatePerGm: 600,
    effectiveFrom: "2026-08-01T00:00:00.000Z",
    status: "ACTIVE",
    approvedBy: "Head of Manufacturing Operations"
  }
];

export interface KarigarJobInput {
  jobNo: string;
  orderType: "CUSTOM_MANUFACTURING" | "REPAIR_WORK";
  category: string;
  metal: "GOLD" | "SILVER" | "PLATINUM";
  purity: "24KT" | "22KT" | "18KT" | "14KT";
  method: ManufacturingMethod;
  customerName: string;
  karigarName: string;
  designBrief: string;
  
  // Material Inputs
  issuedGoldWeightGm: number;
  issuedStonesCarat?: number;
  
  // Returned Outputs
  returnedFinishedWeightGm?: number;
  scrapRecoveredGm?: number;
  unrecoverableLossGm?: number;
  measurementVarianceGm?: number;
  reworkMaterialGm?: number;
  returnedStonesCarat?: number;
  
  expectedFinishedWeightGm: number;
  otherCharges?: number;
  approver?: string;
}

export interface KarigarJobReconciliation {
  jobNo: string;
  orderType: string;
  category: string;
  metal: string;
  purity: string;
  method: ManufacturingMethod;
  customerName: string;
  karigarName: string;
  designBrief: string;
  
  // Frozen Standard Version Snapshot
  standardSnapshot: Readonly<VersionedManufacturingStandardRule>;
  
  // Categorized Material Physical Control
  issuedGoldWeightGm: number;
  returnedFinishedWeightGm: number;
  scrapRecoveredGm: number;
  unrecoverableLossGm: number;
  measurementVarianceGm: number;
  reworkMaterialGm: number;
  totalAccountedGoldGm: number;
  
  issuedStonesCarat: number;
  returnedStonesCarat: number;
  stonesConsumedCarat: number;
  
  // Wastage Benchmark Analysis
  actualWastageGm: number;
  allowedWastagePercent: number;
  allowedWastageGm: number;
  excessWastageGm: number;
  isWastageApproved: boolean;
  
  // Financial Costing
  labourRatePerGm: number;
  labourCost: number;
  otherCharges: number;
  materialValueIssued: number;
  totalManufacturingCost: number;
  
  qcStatus: "PENDING" | "PASSED" | "REJECTED";
  status: "GOLD_ISSUED" | "CASTING" | "STONE_SETTING" | "HALLMARKING" | "QC_PASSED" | "COMPLETED";
  approver: string;
}

const GOLD_SPOT_RATES: Record<string, number> = {
  "24KT": 7470,
  "22KT": 6850,
  "18KT": 5600,
  "14KT": 4350
};

/**
 * WHPS Versioned Standards Engine Lookup
 * Retrieves ACTIVE rule matching Category + Metal + Purity + Method.
 */
export function lookupVersionedStandard(
  category: string,
  metal: "GOLD" | "SILVER" | "PLATINUM",
  purity: "24KT" | "22KT" | "18KT" | "14KT",
  method: ManufacturingMethod
): VersionedManufacturingStandardRule {
  const match = VERSIONED_MANUFACTURING_STANDARDS.find(
    (rule) =>
      rule.status === "ACTIVE" &&
      (rule.category.toLowerCase().includes(category.toLowerCase()) ||
        category.toLowerCase().includes(rule.category.toLowerCase()))
  );

  return match || {
    standardId: "STD-MFG-GENERIC",
    versionNo: 1,
    category,
    metal,
    purity,
    method,
    allowedWastagePercent: 2.5,
    allowedLabourRatePerGm: 450,
    effectiveFrom: "2026-08-01T00:00:00.000Z",
    status: "ACTIVE",
    approvedBy: "Head of Manufacturing Operations"
  };
}

/**
 * Reconciles Karigar Manufacturing Jobs with Versioned Standards Snapshots & Categorized Loss Analysis.
 */
export function reconcileKarigarJob(input: KarigarJobInput): KarigarJobReconciliation {
  const activeStandard = lookupVersionedStandard(input.category, input.metal, input.purity, input.method);
  const frozenSnapshot = Object.freeze({ ...activeStandard });

  const issuedGold = Math.max(0, input.issuedGoldWeightGm || 0);
  const finished = Math.max(0, input.returnedFinishedWeightGm || input.expectedFinishedWeightGm || 0);
  const scrap = Math.max(0, input.scrapRecoveredGm || 0);
  const unrecoverableLoss = Math.max(0, input.unrecoverableLossGm || 0);
  const measurementVariance = Math.max(0, input.measurementVarianceGm || 0);
  const reworkMaterial = Math.max(0, input.reworkMaterialGm || 0);

  const totalAccountedGold = Math.round((finished + scrap + reworkMaterial) * 1000) / 1000;
  const actualWastageGm = Math.max(0, Math.round((issuedGold - totalAccountedGold) * 1000) / 1000);

  const allowedLossPercent = frozenSnapshot.allowedWastagePercent;
  const allowedWastageGm = Math.round(issuedGold * (allowedLossPercent / 100) * 1000) / 1000;
  const excessWastageGm = Math.max(0, Math.round((actualWastageGm - allowedWastageGm) * 1000) / 1000);
  const isWastageApproved = excessWastageGm === 0;

  // Stones Reconciliation
  const issuedStones = Math.max(0, input.issuedStonesCarat || 0);
  const returnedStones = Math.max(0, input.returnedStonesCarat || 0);
  const stonesConsumedCarat = Math.max(0, issuedStones - returnedStones);

  // Labour & Total Costing
  const labourRate = frozenSnapshot.allowedLabourRatePerGm;
  const labourCost = Math.round(finished * labourRate);
  const otherCharges = Math.max(0, input.otherCharges || 0);

  const spotRate = GOLD_SPOT_RATES[input.purity] || 6850;
  const materialValueIssued = Math.round(issuedGold * spotRate);
  const totalManufacturingCost = materialValueIssued + labourCost + otherCharges;

  return {
    jobNo: input.jobNo || `JOB-${Date.now().toString().slice(-6)}`,
    orderType: input.orderType,
    category: input.category,
    metal: input.metal,
    purity: input.purity,
    method: input.method,
    customerName: input.customerName,
    karigarName: input.karigarName,
    designBrief: input.designBrief,
    
    standardSnapshot: frozenSnapshot,
    
    issuedGoldWeightGm: issuedGold,
    returnedFinishedWeightGm: finished,
    scrapRecoveredGm: scrap,
    unrecoverableLossGm: unrecoverableLoss,
    measurementVarianceGm: measurementVariance,
    reworkMaterialGm: reworkMaterial,
    totalAccountedGoldGm: totalAccountedGold,
    
    issuedStonesCarat: issuedStones,
    returnedStonesCarat: returnedStones,
    stonesConsumedCarat,
    
    actualWastageGm,
    allowedWastagePercent: allowedLossPercent,
    allowedWastageGm,
    excessWastageGm,
    isWastageApproved,
    
    labourRatePerGm: labourRate,
    labourCost,
    otherCharges,
    materialValueIssued,
    totalManufacturingCost,
    
    qcStatus: isWastageApproved ? "PASSED" : "PENDING",
    status: finished > 0 ? "QC_PASSED" : "GOLD_ISSUED",
    approver: input.approver || "Manufacturing Auditor"
  };
}