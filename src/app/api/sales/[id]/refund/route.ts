import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateInvoiceTax, calculateTaxReversal } from "@/lib/taxEngine";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { reason, itemId } = body;

    const sale = await db.sale.findUnique({
      where: { id },
      include: { items: true, invoice: true, payments: true }
    });

    if (!sale) {
      return NextResponse.json({ success: false, error: "Sale not found" }, { status: 404 });
    }

    // Calculate Tax Reversal using Tax Engine
    const taxCalc = calculateInvoiceTax(
      sale.items.map((i) => ({ description: "Returned Item", tagPrice: i.unitPrice }))
    );
    const reversal = calculateTaxReversal(taxCalc);

    // Atomic Prisma $transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Create Refund Record
      const refund = await tx.refund.create({
        data: {
          saleId: sale.id,
          amount: sale.totalAmount,
          reason: reason || "Customer return & tax credit note",
          method: "ORIGINAL_PAYMENT",
          status: "APPROVED",
          initiatedBy: "Super Admin",
          processedAt: new Date()
        }
      });

      // 2. Update Sale Status
      const updatedSale = await tx.sale.update({
        where: { id: sale.id },
        data: { paymentStatus: "REFUNDED" }
      });

      // 3. Return Inventory Items to IN_STOCK
      if (itemId) {
        await tx.jewelleryItem.update({
          where: { id: itemId },
          data: { status: "IN_STOCK" }
        });
      } else if (sale.items.length > 0) {
        for (const item of sale.items) {
          await tx.jewelleryItem.update({
            where: { id: item.itemId },
            data: { status: "IN_STOCK" }
          });
        }
      }

      // 4. Audit Log
      await tx.auditEvent.create({
        data: {
          userId: null,
          action: "SALE_REFUND_TAX_REVERSAL",
          module: "SALES",
          entityType: "Sale",
          entityId: sale.id
        }
      });

      return { refund, updatedSale, reversal };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}