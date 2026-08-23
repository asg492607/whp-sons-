import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logAuditEvent } from "@/lib/auth";

export async function GET() {
  try {
    const customers = await db.customer.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        sales: {
          take: 5,
          orderBy: { saleDate: "desc" },
          include: { items: true }
        },
        appointments: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { branch: true }
        },
        quotations: {
          take: 5,
          orderBy: { createdAt: "desc" }
        },
        repairTickets: {
          take: 5,
          orderBy: { createdAt: "desc" }
        }
      }
    });

    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const customer = await db.customer.create({
      data: {
        name: `${body.firstName} ${body.lastName}`.trim(),
        phone: body.phone,
        email: body.email,
        primaryBranchId: body.branchId || null,
        loyaltyTier: "SILVER",
        loyaltyPoints: 100
      }
    });

    await logAuditEvent({
      action: "CUSTOMER_CREATED",
      module: "CRM",
      entityType: "Customer",
      entityId: customer.id
    });

    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}