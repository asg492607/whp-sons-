import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, logAuditEvent } from "@/lib/auth";

export async function GET() {
  try {
    const leaveRequests = await prisma.leaveRequest.findMany({
      include: {
        employee: {
          include: { user: true, department: true }
        },
        leaveType: true
      },
      orderBy: { createdAt: "desc" }
    });
    const leaveTypes = await prisma.leaveType.findMany();
    const employees = await prisma.employee.findMany({
      include: { user: true }
    });
    return NextResponse.json({ success: true, data: { leaveRequests, leaveTypes, employees } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const { employeeId, leaveTypeId, fromDate, toDate, days, reason } = await req.json();

    const request = await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveTypeId,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        days: parseFloat(days),
        reason,
        status: "PENDING"
      }
    });

    await logAuditEvent({
      userId: user?.userId,
      action: "LEAVE_APPLIED",
      module: "HR",
      entityType: "LeaveRequest",
      entityId: request.id,
      newValue: { days, fromDate, toDate }
    });

    return NextResponse.json({ success: true, data: request }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    const { requestId, status, rejectionReason } = await req.json();

    const existing = await prisma.leaveRequest.findUnique({
      where: { id: requestId },
      include: { employee: true }
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Leave request not found" }, { status: 404 });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        status,
        rejectionReason: rejectionReason || null,
        approvedAt: status === "APPROVED" ? new Date() : null,
        approverId: user?.userId || null
      }
    });

    // If approved, update attendance record
    if (status === "APPROVED") {
      await prisma.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId: existing.employeeId,
            date: new Date(existing.fromDate.setHours(0,0,0,0))
          }
        },
        update: { status: "ON_LEAVE" },
        create: {
          employeeId: existing.employeeId,
          branchId: existing.employee.branchId,
          date: new Date(existing.fromDate.setHours(0,0,0,0)),
          status: "ON_LEAVE",
          notes: `Approved leave: ${existing.reason || "Annual Leave"}`
        }
      });
    }

    await logAuditEvent({
      userId: user?.userId,
      action: `LEAVE_${status}`,
      module: "HR",
      entityType: "LeaveRequest",
      entityId: requestId,
      oldValue: { status: existing.status },
      newValue: { status, rejectionReason }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}