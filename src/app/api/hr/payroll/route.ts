import { NextResponse } from "next/server";
import { calculateEmployeePayroll } from "@/lib/payrollEngine";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      take: 10,
      include: { user: true, department: true, designation: true }
    });

    const payrolls = employees.map((emp) =>
      calculateEmployeePayroll({
        employeeCode: emp.employeeCode,
        employeeName: emp.user?.name || "Showroom Executive",
        department: emp.department?.name || "Retail Operations",
        designation: emp.designation?.name || "Senior Sales Consultant",
        monthlyBasicSalary: 35000,
        monthlyHra: 14000,
        monthlyAllowances: 6000,
        workingDaysInMonth: 26,
        daysPresent: 25,
        paidLeaveDays: 1,
        salesCommissionIncentive: 8500
      })
    );

    return NextResponse.json({ success: true, data: payrolls });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = calculateEmployeePayroll(body);

    await prisma.auditEvent.create({
      data: {
        userId: null,
        action: "PAYROLL_SLIP_GENERATED",
        module: "HR",
        entityType: "Payroll",
        entityId: result.employeeCode
      }
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}