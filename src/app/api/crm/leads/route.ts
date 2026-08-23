import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, logAuditEvent } from "@/lib/auth";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      where: { isDeleted: false },
      include: {
        branch: true,
        customer: true,
        interactions: true,
        quotations: true
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ success: true, data: leads });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const { name, phone, email, branchId, source, interest, budgetMin, budgetMax } = await req.json();

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        email,
        branchId,
        source: source || "WALK_IN",
        interest,
        budgetMin: parseFloat(budgetMin || 0),
        budgetMax: parseFloat(budgetMax || 0),
        status: "NEW"
      }
    });

    await logAuditEvent({
      userId: user?.userId,
      action: "LEAD_CREATED",
      module: "CRM",
      entityType: "Lead",
      entityId: lead.id
    });

    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    const { leadId, status, lostReason } = await req.json();

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status,
        lostReason: lostReason || null,
        convertedAt: status === "CONVERTED" ? new Date() : null
      }
    });

    await logAuditEvent({
      userId: user?.userId,
      action: `LEAD_STATUS_${status}`,
      module: "CRM",
      entityType: "Lead",
      entityId: leadId
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}