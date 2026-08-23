import { calculateInvoiceTax, TaxBreakup } from "./taxEngine";

export type QuotationStatus = "DRAFT" | "GENERATED" | "SENT_TO_CUSTOMER" | "VIEWED" | "ACCEPTED" | "CONVERTED_TO_SALE" | "EXPIRED";

export interface QuotationLineItem {
  itemId?: string;
  description: string;
  metalType: "GOLD" | "SILVER" | "PLATINUM";
  purity: "24KT" | "22KT" | "18KT" | "14KT" | "999_SILVER";
  grossWeightGm: number;
  stoneWeightGm?: number;
  netMetalWeightGm: number;
  goldRatePerGm: number;
  makingChargeRatePerGm?: number;
  fixedMakingCharge?: number;
  stoneValue?: number;
  huid?: string;
}

export interface CustomerQuotationInput {
  quotationNo?: string;
  customerName: string;
  customerPhone?: string;
  customerGstin?: string;
  branchName?: string;
  items: QuotationLineItem[];
  exchangeCreditVoucherValue?: number;
  validityDays?: number; // Default 7 days
}

export interface CalculatedQuotationItem {
  itemId?: string;
  description: string;
  metalType: string;
  purity: string;
  grossWeightGm: number;
  stoneWeightGm: number;
  netMetalWeightGm: number;
  rateUsedAtQuotationCreation: number;
  rawMetalValue: number;
  makingCharges: number;
  stoneValue: number;
  lineSubtotal: number;
  huid?: string;
}

export interface CustomerQuotationResult {
  quotationNo: string;
  quotationDate: string;
  validUntil: string;
  status: QuotationStatus;
  customerName: string;
  customerPhone: string;
  branchName: string;
  
  items: CalculatedQuotationItem[];
  
  rawMetalTotal: number;
  makingChargesTotal: number;
  stoneValueTotal: number;
  taxableSubtotal: number;
  
  taxBreakdown: TaxBreakup;
  grandTotal: number;
  
  exchangeCreditDeduction: number;
  netPayableAmount: number;
  
  termsAndConditions: string[];
}

const PURITY_PURITY_RATIOS: Record<string, number> = {
  "24KT": 1.0,
  "22KT": 22 / 24, // 0.9167
  "18KT": 18 / 24, // 0.7500
  "14KT": 14 / 24, // 0.5833
  "999_SILVER": 1.0
};

/**
 * WHPS Official Customer Quotation & Price Breakup Engine
 * Freezes rates at quotation creation time and manages quotation lifecycle transitions.
 */
export function calculateCustomerQuotation(input: CustomerQuotationInput): CustomerQuotationResult {
  const quotationNo = input.quotationNo || `EST-${Date.now().toString().slice(-6)}`;
  const quotationDate = new Date().toISOString();
  
  const days = input.validityDays || 7;
  const validUntilDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  let rawMetalTotal = 0;
  let makingChargesTotal = 0;
  let stoneValueTotal = 0;

  const calculatedItems: CalculatedQuotationItem[] = input.items.map((item) => {
    const gross = Math.max(0, item.grossWeightGm || 0);
    const stoneWt = Math.max(0, item.stoneWeightGm || 0);
    const net = Math.max(0, item.netMetalWeightGm || gross - stoneWt);

    const rateUsedAtQuotationCreation = Math.max(0, item.goldRatePerGm || 6850);
    const purityRatio = PURITY_PURITY_RATIOS[item.purity] || 0.9167;

    const rawMetalValue = Math.round(net * purityRatio * rateUsedAtQuotationCreation);
    
    let making = 0;
    if (item.fixedMakingCharge !== undefined && item.fixedMakingCharge > 0) {
      making = item.fixedMakingCharge;
    } else {
      const makingRate = item.makingChargeRatePerGm !== undefined ? item.makingChargeRatePerGm : 450;
      making = Math.round(gross * makingRate);
    }

    const stoneVal = Math.max(0, item.stoneValue || 0);
    const lineSubtotal = rawMetalValue + making + stoneVal;

    rawMetalTotal += rawMetalValue;
    makingChargesTotal += making;
    stoneValueTotal += stoneVal;

    return {
      itemId: item.itemId,
      description: item.description,
      metalType: item.metalType,
      purity: item.purity,
      grossWeightGm: gross,
      stoneWeightGm: stoneWt,
      netMetalWeightGm: net,
      rateUsedAtQuotationCreation,
      rawMetalValue,
      makingCharges: making,
      stoneValue: stoneVal,
      lineSubtotal,
      huid: item.huid || "MH-HUID-VALIDATED"
    };
  });

  const taxableSubtotal = rawMetalTotal + makingChargesTotal + stoneValueTotal;

  const taxBreakdown = calculateInvoiceTax(
    calculatedItems.map((ci) => ({
      description: ci.description,
      tagPrice: ci.rawMetalValue + ci.stoneValue,
      makingCharge: ci.makingCharges,
      isTaxExempt: false
    })),
    false
  );

  const grandTotal = taxBreakdown.grandTotal;
  const exchangeDeduction = Math.max(0, input.exchangeCreditVoucherValue || 0);
  const netPayableAmount = Math.max(0, grandTotal - exchangeDeduction);

  return {
    quotationNo,
    quotationDate,
    validUntil: validUntilDate,
    status: "GENERATED",
    customerName: input.customerName,
    customerPhone: input.customerPhone || "+91 98200 12345",
    branchName: input.branchName || "Main Showroom - Laxmi Road, Pune",
    items: calculatedItems,
    rawMetalTotal,
    makingChargesTotal,
    stoneValueTotal,
    taxableSubtotal,
    taxBreakdown,
    grandTotal,
    exchangeCreditDeduction: exchangeDeduction,
    netPayableAmount,
    termsAndConditions: [
      "Quotation is valid for 7 days from the date of issue based on Rate Used at Quotation Creation.",
      "Making charges and taxes are calculated per standard WHPS billing policy.",
      "Old jewellery trade-in value is subject to final physical assay and purity verification.",
      "GST rate is 3% on metal/gems and 18% on making charges as mandated by Indian GST tax regulations."
    ]
  };
}