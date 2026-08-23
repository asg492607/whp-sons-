import { NextResponse } from "next/server";
import { calculateCustomerQuotation } from "@/lib/quotationEngine";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, items, exchangeCreditVoucherValue } = body;

    const quotation = calculateCustomerQuotation({
      customerName: customerName || "Valued WHPS Client",
      customerPhone,
      items: items || [
        {
          description: "22K Traditional Kolhapuri Saaj",
          metalType: "GOLD",
          purity: "22KT",
          grossWeightGm: 30.0,
          netMetalWeightGm: 29.5,
          goldRatePerGm: 6850,
          makingChargeRatePerGm: 500,
          stoneValue: 15000
        }
      ],
      exchangeCreditVoucherValue: Number(exchangeCreditVoucherValue || 0)
    });

    // Record audit trail
    await db.auditEvent.create({
      data: {
        userId: null,
        action: "CUSTOMER_QUOTATION_GENERATED",
        module: "SALES",
        entityType: "Quotation",
        entityId: quotation.quotationNo
      }
    });

    return NextResponse.json({ success: true, data: quotation });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}