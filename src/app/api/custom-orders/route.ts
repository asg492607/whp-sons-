import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const orders = await db.repairTicket.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        item: { include: { product: true } },
        customer: true,
        assignments: { include: { karigar: true } }
      }
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, customerId, description, estimatedCost, karigarName } = body;

    let customer = await db.customer.findFirst();
    if (customerId) {
      const found = await db.customer.findUnique({ where: { id: customerId } });
      if (found) customer = found;
    }

    const ticketNo = `WORK-${Date.now().toString().slice(-6)}`;

    let branch = await db.branch.findFirst();

    const customerIdToUse = customer?.id || "default-customer-id";

    const result = await db.$transaction(async (tx) => {
      const ticket = await tx.repairTicket.create({
        data: {
          ticketNo,
          itemId,
          customerId: customerIdToUse,
          branchId: branch?.id || "default-branch-id",
          receivedBy: "Super Admin",
          description: description || "Bespoke Custom Jewellery Manufacturing Work Order",
          estimatedCost: Number(estimatedCost || 15000),
          status: "IN_PROGRESS"
        }
      });

      if (itemId) {
        await tx.jewelleryItem.update({
          where: { id: itemId },
          data: { status: "UNDER_REPAIR" }
        });
      }

      await tx.auditEvent.create({
        data: {
          userId: null,
          action: "KARIGAR_WORK_ORDER_CREATED",
          module: "MANUFACTURING",
          entityType: "RepairTicket",
          entityId: ticket.id
        }
      });

      return ticket;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}