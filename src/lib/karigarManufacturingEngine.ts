export type ManufacturingMethod = "CASTING" | "HANDMADE" | "MACHINE_STAMPED" | "BESPOKE_NAGAS";

export interface ManufacturingStandardRule {
  category: string;
  metal: "GOLD" | "SILVER" | "PLATINUM";
  purity: "24KT" | "22KT" | "18KT" | "14KT";
  method: ManufacturingMethod;
  allowedWastagePercent: number;
  allowedLabourRatePerGm: number;
}

/** Configurable WHPS Manufacturing Standards Master */
export const MANUFACTURING_STANDARDS_MASTER: ManufacturingStandardRule[] = [
  { category: "Saaj / Necklace", metal: "GOLD", purity: "22KT", method: "BESPOKE_NAGAS", allowedWastagePercent: 3.5, allowedLabourRatePerGm: 550 },
  { category: "Bangles", metal: "GOLD", purity: "22KT", method: "CASTING", allowedWastagePercent: 2.0, allowedLabourRatePerGm: 350 },
  { category: "Rings / Earrings", metal: "GOLD", purity: "22KT", method: "HANDMADE", allowedWastagePercent: 2.5, allowedLabourRatePerGm: 450 },
  { category: "Chains", metal: "GOLD", purity: "22KT", method: "MACHINE_STAMPED", allowedWastagePercent: 1.5, allowedLabourRatePerGm: 250 },
  { category: "Diamond Mounts", metal: "GOLD", purity: "18KT", method: "CASTING", allowedWastagePercent: 3.0, allowedLabourRatePerGm: 600 }
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
  
  // Material Issuance
  issuedGoldWeightGm: number;
  issuedStonesCarat?: number;
  
  // Material Returns
  returnedFinishedWeightGm?: number;
  scrapRecoveredGm?: number;
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
  
  // Material Control
  issuedGoldWeightGm: number;
  returnedFinishedWeightGm: number;
  scrapRecoveredGm: number;
  totalAccountedGoldGm: number;
  
  issuedStonesCarat: number;
  returnedStonesCarat: number;
  stonesConsumedCarat: number;
  
  // Wastage Analysis
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
 * WHPS Manufacturing Standards Engine
 * Lookup benchmark rule from MANUFACTURING_STANDARDS_MASTER based on Category + Metal + Purity + Method.
 */
export function lookupManufacturingStandard(
  category: string,
  metal: "GOLD" | "SILVER" | "PLATINUM",
  purity: "24KT" | "22KT" | "18KT" | "14KT",
  method: ManufacturingMethod
): ManufacturingStandardRule {
  const match = MANUFACTURING_STANDARDS_MASTER.find(
    (rule) =>
      rule.category.toLowerCase().includes(category.toLowerCase()) ||
      category.toLowerCase().includes(rule.category.toLowerCase())
  );

  return match || {
    category,
    metal,
    purity,
    method,
    allowedWastagePercent: 2.5,
    allowedLabourRatePerGm: 450
  };
}

/**
 * Reconciles Karigar Jobs with complete Material Control, Benchmark Analysis & Costing
 */
export function reconcileKarigarJob(input: KarigarJobInput): KarigarJobReconciliation {
  const standardRule = lookupManufacturingStandard(input.category, input.metal, input.purity, input.method);

  const issuedGold = Math.max(0, input.issuedGoldWeightGm || 0);
  const scrap = Math.max(0, input.scrapRecoveredGm || 0);
  const finished = Math.max(0, input.returnedFinishedWeightGm || input.expectedFinishedWeightGm || 0);

  const totalAccountedGold = Math.round((finished + scrap) * 1000) / 1000;
  const actualWastageGm = Math.max(0, Math.round((issuedGold - totalAccountedGold) * 1000) / 1000);

  const allowedLossPercent = standardRule.allowedWastagePercent;
  const allowedWastageGm = Math.round(issuedGold * (allowedLossPercent / 100) * 1000) / 1000;
  const excessWastageGm = Math.max(0, Math.round((actualWastageGm - allowedWastageGm) * 1000) / 1000);
  const isWastageApproved = excessWastageGm === 0;

  // Stones Disambiguation
  const issuedStones = Math.max(0, input.issuedStonesCarat || 0);
  const returnedStones = Math.max(0, input.returnedStonesCarat || 0);
  const stonesConsumedCarat = Math.max(0, issuedStones - returnedStones);

  // Labour & Financial Costing
  const labourRate = standardRule.allowedLabourRatePerGm;
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
    
    issuedGoldWeightGm: issuedGold,
    returnedFinishedWeightGm: finished,
    scrapRecoveredGm: scrap,
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
    approver: input.approver || "Manufacturing Manager"
  };
}