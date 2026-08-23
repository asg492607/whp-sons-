import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        branch: true,
        customer: true
      },
      orderBy: { scheduledAt: "desc" }
    });
    return NextResponse.json({ success: true, data: appointments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, branchId, date, time, purpose } = body;

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { phone }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name,
          phone,
          email,
          primaryBranchId: branchId,
          acquisitionSource: "APPOINTMENT_FORM"
        }
      });
    }

    // Combine date and time
    const scheduledAt = new Date(`${date}T${time || "11:00"}:00`);

    const appointment = await prisma.appointment.create({
      data: {
        customerId: customer.id,
        branchId,
        scheduledAt,
        purpose: purpose || "BROWSE",
        status: "SCHEDULED"
      }
    });

    return NextResponse.json({ success: true, data: appointment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}