export interface KarigarJobInput {
  jobNo: string;
  orderType: "CUSTOM_MANUFACTURING" | "REPAIR_WORK";
  customerName: string;
  karigarName: string;
  metalPurity: "24KT" | "22KT" | "18KT" | "14KT";
  designBrief: string;
  issuedGoldWeightGm: number;
  issuedStonesCarat?: number;
  expectedFinishedWeightGm: number;
  actualFinishedWeightGm?: number;
  allowedWastagePercent?: number; // Default 2.5%
  labourRatePerGm?: number;
}

export interface KarigarJobReconciliation {
  jobNo: string;
  orderType: string;
  customerName: string;
  karigarName: string;
  metalPurity: string;
  designBrief: string;
  
  // Material Reconciliation
  issuedGoldWeightGm: number;
  issuedStonesCarat: number;
  expectedFinishedWeightGm: number;
  actualFinishedWeightGm: number;
  
  // Wastage & Losses
  actualWastageGm: number;
  allowedWastageGm: number;
  excessWastageGm: number;
  isWastageApproved: boolean;
  
  // Financial Costing
  labourRatePerGm: number;
  labourCost: number;
  materialValueIssued: number;
  finalJobCost: number;
  
  qcStatus: "PENDING" | "PASSED" | "REJECTED";
  status: "GOLD_ISSUED" | "CASTING" | "STONE_SETTING" | "HALLMARKING" | "QC_PASSED" | "COMPLETED";
}

const GOLD_RATES: Record<string, number> = {
  "24KT": 7470,
  "22KT": 6850,
  "18KT": 5600,
  "14KT": 4350
};

/**
 * WHPS Karigar Manufacturing & Material Reconciliation Engine
 * Tracks gold issued to Karigars, finished weight returned, wastage benchmarks, and labour costing.
 */
export function reconcileKarigarJob(input: KarigarJobInput): KarigarJobReconciliation {
  const issuedGold = Math.max(0, input.issuedGoldWeightGm || 0);
  const issuedStones = Math.max(0, input.issuedStonesCarat || 0);
  const actualFinished = Math.max(0, input.actualFinishedWeightGm || input.expectedFinishedWeightGm || 0);

  const actualWastageGm = Math.max(0, Math.round((issuedGold - actualFinished) * 1000) / 1000);
  
  const allowedLossPercent = input.allowedWastagePercent !== undefined ? input.allowedWastagePercent : 2.5;
  const allowedWastageGm = Math.round(issuedGold * (allowedLossPercent / 100) * 1000) / 1000;
  const excessWastageGm = Math.max(0, Math.round((actualWastageGm - allowedWastageGm) * 1000) / 1000);
  const isWastageApproved = excessWastageGm === 0;

  const ratePerGm = input.labourRatePerGm || 450; // ₹450/g Karigar making charge
  const labourCost = Math.round(actualFinished * ratePerGm);

  const goldSpotRate = GOLD_RATES[input.metalPurity] || 6850;
  const materialValueIssued = Math.round(issuedGold * goldSpotRate);
  const finalJobCost = materialValueIssued + labourCost;

  return {
    jobNo: input.jobNo || `JOB-${Date.now().toString().slice(-6)}`,
    orderType: input.orderType,
    customerName: input.customerName,
    karigarName: input.karigarName,
    metalPurity: input.metalPurity,
    designBrief: input.designBrief,
    issuedGoldWeightGm: issuedGold,
    issuedStonesCarat: issuedStones,
    expectedFinishedWeightGm: input.expectedFinishedWeightGm,
    actualFinishedWeightGm: actualFinished,
    actualWastageGm,
    allowedWastageGm,
    excessWastageGm,
    isWastageApproved,
    labourRatePerGm: ratePerGm,
    labourCost,
    materialValueIssued,
    finalJobCost,
    qcStatus: isWastageApproved ? "PASSED" : "PENDING",
    status: actualFinished > 0 ? "QC_PASSED" : "GOLD_ISSUED"
  };
}