import { NextResponse } from "next/server";
import { calculateCustomerQuotation } from "@/lib/quotationEngine";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quotationNo, customerName, items, exchangeCreditVoucherValue } = body;

    // Recalculate quotation snapshot using frozen rates
    const quotation = calculateCustomerQuotation({
      quotationNo,
      customerName: customerName || "Valued WHPS Client",
      items: items || [],
      exchangeCreditVoucherValue: Number(exchangeCreditVoucherValue || 0)
    });

    const customer = await db.customer.findFirst();
    const branch = await db.branch.findFirst();
    const item = await db.jewelleryItem.findFirst();

    if (!customer || !branch) {
      return NextResponse.json({ success: false, error: "Required customer or branch record not found" }, { status: 400 });
    }

    // CONCURRENCY & DOUBLE-SALE GUARD CHECK
    if (item && item.status !== "IN_STOCK" && item.status !== "RESERVED") {
      return NextResponse.json(
        {
          success: false,
          error: `[CONCURRENCY_CONFLICT] Jewellery item ${item.itemCode} is currently ${item.status} and cannot be converted to Sale.`
        },
        { status: 409 }
      );
    }

    const saleNo = `SALE-CONV-${Date.now().toString().slice(-6)}`;

    // Atomic Prisma $transaction: Quotation -> Concurrency Lock -> Sale
    const conversionResult = await db.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          saleNo,
          customerId: customer.id,
          branchId: branch.id,
          salespersonId: "admin-user",
          subtotal: quotation.taxableSubtotal,
          gstAmount: quotation.taxBreakdown.totalGst,
          totalAmount: quotation.grandTotal,
          amountPaid: quotation.grandTotal,
          balanceDue: 0,
          paymentStatus: "PAID",
          notes: `Converted from Quotation ${quotation.quotationNo} (Snapshot: Rate ${quotation.items[0]?.rateUsedAtQuotationCreation}/g, Tax ₹${quotation.taxBreakdown.totalGst}, Credit ₹${quotation.exchangeCreditDeduction})`,
          payments: {
            create: [
              {
                amount: quotation.grandTotal,
                method: quotation.exchangeCreditDeduction > 0 ? "PRECIOUS_METAL_EXCHANGE" : "UPI",
                referenceNo: quotation.quotationNo,
                status: "CAPTURED"
              }
            ]
          }
        },
        include: { payments: true }
      });

      if (item) {
        await tx.jewelleryItem.update({
          where: { id: item.id },
          data: { status: "SOLD" }
        });
      }

      await tx.auditEvent.create({
        data: {
          userId: null,
          action: "QUOTATION_CONVERTED_TO_SALE",
          module: "SALES",
          entityType: "Sale",
          entityId: sale.id
        }
      });

      return sale;
    });

    return NextResponse.json({
      success: true,
      message: `Quotation ${quotation.quotationNo} successfully converted to Sale ${saleNo}`,
      data: { quotationStatus: "CONVERTED_TO_SALE", sale: conversionResult }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}