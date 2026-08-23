import { calculateInvoiceTax, TaxBreakup } from "./taxEngine";

export interface InvoiceDocumentData {
  invoiceNumber: string;
  invoiceDate: string;
  documentType: "TAX_INVOICE" | "CREDIT_NOTE" | "EXCHANGE_VOUCHER";
  companyDetails: {
    name: string;
    gstin: string;
    pan: string;
    corporateAddress: string;
    phone: string;
  };
  branchDetails: {
    name: string;
    code: string;
    city: string;
    gstin: string;
    phone: string;
  };
  customerDetails: {
    name: string;
    phone: string;
    city: string;
    gstin?: string;
  };
  items: Array<{
    itemCode: string;
    huid: string;
    description: string;
    grossWeightGm: number;
    purity: string;
    unitPrice: number;
    makingCharge: number;
  }>;
  taxBreakup: TaxBreakup;
  paymentDetails: {
    amountPaid: number;
    balanceDue: number;
    paymentStatus: string;
    payments: Array<{ amount: number; method: string; date: string }>;
  };
}

/**
 * WHPS Invoice & Credit Note Document Generator
 * Constructs official tax invoice data structure compliant with Indian GST & BIS HUID hallmarking regulations.
 */
export function generateInvoiceDocument(params: {
  saleNo: string;
  invoiceNo: string;
  documentType?: "TAX_INVOICE" | "CREDIT_NOTE" | "EXCHANGE_VOUCHER";
  branch: { name: string; code: string; city: string; gstin?: string; phone: string };
  customer: { name: string; phone: string; city: string };
  items: Array<{ itemCode: string; huid: string; description: string; grossWeightGm: number; purity: string; tagPrice: number; makingCharge?: number }>;
  isInterState?: boolean;
  payments?: Array<{ amount: number; method: string; date: string }>;
}): InvoiceDocumentData {
  const taxBreakup = calculateInvoiceTax(
    params.items.map((i) => ({
      description: i.description,
      tagPrice: i.tagPrice,
      makingCharge: i.makingCharge
    })),
    params.isInterState || false
  );

  const amountPaid = (params.payments || []).reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = Math.max(0, taxBreakup.grandTotal - amountPaid);
  const paymentStatus = balanceDue === 0 ? "PAID" : amountPaid > 0 ? "PARTIALLY_PAID" : "PENDING";

  return {
    invoiceNumber: params.invoiceNo,
    invoiceDate: new Date().toISOString().split("T")[0],
    documentType: params.documentType || "TAX_INVOICE",
    companyDetails: {
      name: "Waman Hari Pethe Jewellers Pvt Ltd",
      gstin: "27AAACW1234F1Z5",
      pan: "AAACW1234F",
      corporateAddress: "WHP House, Dadar West, Mumbai - 400028",
      phone: "+91 22 2430 1234"
    },
    branchDetails: {
      name: params.branch.name,
      code: params.branch.code,
      city: params.branch.city,
      gstin: params.branch.gstin || "27AAACW1234F1Z5",
      phone: params.branch.phone
    },
    customerDetails: {
      name: params.customer.name,
      phone: params.customer.phone,
      city: params.customer.city
    },
    items: params.items.map((i) => ({
      itemCode: i.itemCode,
      huid: i.huid,
      description: i.description,
      grossWeightGm: i.grossWeightGm,
      purity: i.purity,
      unitPrice: i.tagPrice,
      makingCharge: i.makingCharge || 0
    })),
    taxBreakup,
    paymentDetails: {
      amountPaid,
      balanceDue,
      paymentStatus,
      payments: params.payments || []
    }
  };
}