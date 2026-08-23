export interface TaxConfig {
  metalGstRate: number; // e.g. 0.03 (3%)
  makingChargeGstRate: number; // e.g. 0.18 (18%)
}

export interface TaxLineItemInput {
  description: string;
  tagPrice: number;
  makingCharge?: number;
  metalType?: "GOLD" | "SILVER" | "PLATINUM" | "DIAMOND";
  isTaxExempt?: boolean;
}

export interface TaxLineResult {
  description: string;
  subtotal: number;
  makingChargeSubtotal: number;
  metalGst: number;
  makingChargeGst: number;
  lineTotalGst: number;
  lineGrandTotal: number;
}

export interface TaxBreakup {
  roundingPolicy: "EXACT_PAISE_WITH_ROUNDED_TOTAL";
  subtotal: number;
  makingChargeSubtotal: number;
  metalGst: number;
  makingChargeGst: number;
  totalGstUnrounded: number;
  totalGst: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundingAdjustment: number;
  grandTotal: number;
  lineResults: TaxLineResult[];
}

export const DEFAULT_TAX_CONFIG: TaxConfig = {
  metalGstRate: 0.03, // 3% Gold/Diamond GST
  makingChargeGstRate: 0.18 // 18% Making Charge GST
};

/**
 * WHPS Decoupled Enterprise Tax & Billing Engine
 * Explicit Policy:
 * 1. Line-level exact paise calculation (2 decimal places)
 * 2. Tax-component exact paise splitting (CGST/SGST 50-50, IGST 100%)
 * 3. Final invoice grand total rounded to nearest Rupee with tracking roundingAdjustment
 */
export function calculateInvoiceTax(
  items: TaxLineItemInput[],
  isInterState: boolean = false,
  config: TaxConfig = DEFAULT_TAX_CONFIG
): TaxBreakup {
  let totalSubtotal = 0;
  let totalMakingSubtotal = 0;
  let totalMetalGst = 0;
  let totalMakingGst = 0;

  const lineResults: TaxLineResult[] = items.map((item) => {
    const itemPrice = Math.round((item.tagPrice || 0) * 100) / 100;
    const makingPrice = Math.round((item.makingCharge || 0) * 100) / 100;

    let metalGst = 0;
    let makingGst = 0;

    if (!item.isTaxExempt) {
      metalGst = Math.round(itemPrice * config.metalGstRate * 100) / 100;
      makingGst = Math.round(makingPrice * config.makingChargeGstRate * 100) / 100;
    }

    const lineTotalGst = Math.round((metalGst + makingGst) * 100) / 100;
    const lineGrandTotal = Math.round((itemPrice + makingPrice + lineTotalGst) * 100) / 100;

    totalSubtotal += itemPrice;
    totalMakingSubtotal += makingPrice;
    totalMetalGst += metalGst;
    totalMakingGst += makingGst;

    return {
      description: item.description,
      subtotal: itemPrice,
      makingChargeSubtotal: makingPrice,
      metalGst,
      makingChargeGst: makingGst,
      lineTotalGst,
      lineGrandTotal
    };
  });

  const roundedSubtotal = Math.round(totalSubtotal * 100) / 100;
  const roundedMakingSubtotal = Math.round(totalMakingSubtotal * 100) / 100;
  const roundedMetalGst = Math.round(totalMetalGst * 100) / 100;
  const roundedMakingGst = Math.round(totalMakingGst * 100) / 100;

  const totalGstUnrounded = Math.round((roundedMetalGst + roundedMakingGst) * 100) / 100;
  const totalGst = Math.round(totalGstUnrounded * 100) / 100;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isInterState) {
    igst = totalGst;
  } else {
    cgst = Math.round((totalGst / 2) * 100) / 100;
    sgst = Math.round((totalGst - cgst) * 100) / 100;
  }

  const rawGrandTotal = roundedSubtotal + roundedMakingSubtotal + totalGst;
  const grandTotal = Math.round(rawGrandTotal);
  const roundingAdjustment = Math.round((grandTotal - rawGrandTotal) * 100) / 100;

  return {
    roundingPolicy: "EXACT_PAISE_WITH_ROUNDED_TOTAL",
    subtotal: roundedSubtotal,
    makingChargeSubtotal: roundedMakingSubtotal,
    metalGst: roundedMetalGst,
    makingChargeGst: roundedMakingGst,
    totalGstUnrounded,
    totalGst,
    cgst,
    sgst,
    igst,
    roundingAdjustment,
    grandTotal,
    lineResults
  };
}

/** Reversal Tax Calculator for Sale Refunds & Credit Notes */
export function calculateTaxReversal(originalTax: TaxBreakup): TaxBreakup {
  return {
    roundingPolicy: originalTax.roundingPolicy,
    subtotal: -originalTax.subtotal,
    makingChargeSubtotal: -originalTax.makingChargeSubtotal,
    metalGst: -originalTax.metalGst,
    makingChargeGst: -originalTax.makingChargeGst,
    totalGstUnrounded: -originalTax.totalGstUnrounded,
    totalGst: -originalTax.totalGst,
    cgst: -originalTax.cgst,
    sgst: -originalTax.sgst,
    igst: -originalTax.igst,
    roundingAdjustment: -originalTax.roundingAdjustment,
    grandTotal: -originalTax.grandTotal,
    lineResults: originalTax.lineResults.map((l) => ({
      ...l,
      subtotal: -l.subtotal,
      makingChargeSubtotal: -l.makingChargeSubtotal,
      metalGst: -l.metalGst,
      makingChargeGst: -l.makingChargeGst,
      lineTotalGst: -l.lineTotalGst,
      lineGrandTotal: -l.lineGrandTotal
    }))
  };
}

/** Legacy Single Item Wrapper */
export function calculateJewelleryTax(params: {
  tagPrice: number;
  metalType?: string;
  makingCharge?: number;
}) {
  const result = calculateInvoiceTax([
    {
      description: "Jewellery Item",
      tagPrice: params.tagPrice,
      makingCharge: params.makingCharge
    }
  ]);

  return {
    subtotal: result.subtotal,
    makingChargeGst: result.makingChargeGst,
    metalGst: result.metalGst,
    totalGst: result.totalGst,
    grandTotal: result.grandTotal,
    gstBreakup: {
      cgst: result.cgst,
      sgst: result.sgst
    }
  };
}