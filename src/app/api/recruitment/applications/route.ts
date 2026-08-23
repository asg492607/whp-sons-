import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, hashPassword, logAuditEvent } from "@/lib/auth";

export async function GET() {
  try {
    const applications = await prisma.jobApplication.findMany({
      include: { job: { include: { department: true, designation: true, branch: true } } },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ success: true, data: applications });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    const { applicationId, offeredCtc } = await req.json();

    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { job: true }
    });

    if (!application) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    // Check if user already exists or create new employee user account
    let user = await prisma.user.findUnique({
      where: { email: application.email }
    });

    if (!user) {
      const defaultPassword = await hashPassword("Welcome@WHP2026");
      user = await prisma.user.create({
        data: {
          name: application.applicantName,
          email: application.email,
          phone: application.phone,
          passwordHash: defaultPassword,
          type: "INTERNAL",
          status: "ACTIVE"
        }
      });
    }

    const employeeCode = `EMP-WHP-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Employee record from Job Application
    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        applicationId: application.id,
        employeeCode,
        branchId: application.job.branchId || (await prisma.branch.findFirst())!.id,
        departmentId: application.job.departmentId,
        designationId: application.job.designationId,
        joinedAt: new Date(),
        currentCtc: parseFloat(offeredCtc || "500000"),
        status: "ACTIVE"
      }
    });

    // Update Application Status to JOINED
    await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: "JOINED" }
    });

    await logAuditEvent({
      userId: currentUser?.userId,
      action: "CANDIDATE_ONBOARDED_TO_EMPLOYEE",
      module: "RECRUITMENT",
      entityType: "Employee",
      entityId: employee.id,
      newValue: { employeeCode, email: user.email }
    });

    return NextResponse.json({
      success: true,
      data: {
        employee,
        user: { id: user.id, name: user.name, email: user.email }
      }
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}