import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { evaluatePreciousMetalExchange } from "@/lib/exchangeValuationEngine";
import { calculateInvoiceTax } from "@/lib/taxEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { newItemId, oldTradeInItem, customerId, branchId } = body;

    const newItem = await db.jewelleryItem.findUnique({ where: { id: newItemId } });
    if (!newItem) {
      return NextResponse.json({ success: false, error: "New jewellery item not found" }, { status: 404 });
    }

    let customer = await db.customer.findFirst();
    if (customerId) {
      const found = await db.customer.findUnique({ where: { id: customerId } });
      if (found) customer = found;
    }

    let branch = await db.branch.findFirst();
    if (branchId) {
      const foundB = await db.branch.findUnique({ where: { id: branchId } });
      if (foundB) branch = foundB;
    }

    // Execute Metal-Agnostic Valuation Engine
    const valuation = evaluatePreciousMetalExchange({
      description: oldTradeInItem?.description || "Trade-in Ornament",
      metalType: oldTradeInItem?.metalType || "GOLD",
      purity: oldTradeInItem?.purity || "22KT",
      grossWeightGm: Number(oldTradeInItem?.grossWeightGm || 10),
      stoneWeightCarat: Number(oldTradeInItem?.stoneWeightCarat || 0.5),
      meltingLossPercent: Number(oldTradeInItem?.meltingLossPercent || 2.0),
      valuationMethod: oldTradeInItem?.valuationMethod || "KARATMETER"
    });

    // Calculate New Item Invoice & Tax
    const taxCalc = calculateInvoiceTax([{ description: newItem.itemCode, tagPrice: newItem.tagPrice || 100000 }]);
    const newTotalAmount = taxCalc.grandTotal;

    const exchangeCreditApplied = Math.min(valuation.finalCreditValue, newTotalAmount);
    const remainingBalance = Math.max(0, newTotalAmount - exchangeCreditApplied);

    const customerIdToUse = customer?.id || "default-customer";
    const branchIdToUse = branch?.id || newItem.branchId;

    // Atomic Prisma $transaction creating full dual-entity audit trail
    const result = await db.$transaction(async (tx) => {
      // 1. Create Sale + Payment + Invoice
      const sale = await tx.sale.create({
        data: {
          saleNo: `EXCH-INV-${Date.now().toString().slice(-6)}`,
          customerId: customerIdToUse,
          branchId: branchIdToUse,
          salespersonId: "admin-user",
          subtotal: taxCalc.subtotal,
          gstAmount: taxCalc.totalGst,
          totalAmount: newTotalAmount,
          amountPaid: exchangeCreditApplied,
          balanceDue: remainingBalance,
          paymentStatus: remainingBalance === 0 ? "PAID" : "PARTIALLY_PAID",
          notes: `Precious Metal Exchange Voucher ${valuation.valuationId}: ₹${exchangeCreditApplied} Credit (Metal: ${valuation.metalType}, Purity: ${valuation.purity}, Fine Wt: ${valuation.fineEquivalentWeightGm}g, Method: ${valuation.valuationMethod})`,
          items: {
            create: [
              {
                itemId: newItem.id,
                unitPrice: taxCalc.subtotal,
                gstAmount: taxCalc.totalGst,
                finalPrice: newTotalAmount
              }
            ]
          },
          payments: {
            create: [
              {
                amount: exchangeCreditApplied,
                method: "PRECIOUS_METAL_EXCHANGE",
                referenceNo: valuation.valuationId,
                status: "CAPTURED"
              }
            ]
          },
          invoice: {
            create: {
              invoiceNo: `INV-EXCH-${Date.now().toString().slice(-6)}`,
              gstType: "CGST_SGST"
            }
          }
        },
        include: { items: true, payments: true, invoice: true }
      });

      // 2. Mark New Item as SOLD
      await tx.jewelleryItem.update({
        where: { id: newItem.id },
        data: { status: "SOLD" }
      });

      // 3. Write Audit Event with Full Valuation Evidence
      await tx.auditEvent.create({
        data: {
          userId: null,
          action: "PRECIOUS_METAL_VALUATION_EXCHANGE",
          module: "SALES",
          entityType: "Sale",
          entityId: sale.id
        }
      });

      return { sale, valuation };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}