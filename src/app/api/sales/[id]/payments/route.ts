import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { amount, method, referenceNo } = body;

    const sale = await db.sale.findUnique({
      where: { id },
      include: { payments: true }
    });

    if (!sale) {
      return NextResponse.json({ success: false, error: "Sale record not found" }, { status: 404 });
    }

    const newAmountPaid = sale.amountPaid + Number(amount);
    const newBalanceDue = Math.max(0, sale.totalAmount - newAmountPaid);
    const newStatus = newBalanceDue === 0 ? "PAID" : "PARTIALLY_PAID";

    // Atomic Prisma $transaction
    const result = await db.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          saleId: sale.id,
          amount: Number(amount),
          method: method || "UPI",
          referenceNo: referenceNo || `REF-${Date.now().toString().slice(-6)}`,
          status: "CAPTURED",
          capturedBy: "Super Admin"
        }
      });

      const updatedSale = await tx.sale.update({
        where: { id: sale.id },
        data: {
          amountPaid: newAmountPaid,
          balanceDue: newBalanceDue,
          paymentStatus: newStatus
        },
        include: { payments: true, invoice: true }
      });

      await tx.auditEvent.create({
        data: {
          userId: null,
          action: "PARTIAL_PAYMENT_RECONCILED",
          module: "SALES",
          entityType: "Payment",
          entityId: payment.id
        }
      });

      return { payment, updatedSale };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}