import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const unassignedLeads = await prisma.lead.count({ where: { status: "NEW" } });
    const pendingLeaves = await prisma.leaveRequest.count({ where: { status: "PENDING" } });
    const lowStockVaults = await prisma.inventoryLocation.findMany({
      where: { currentCount: { lt: 5 } }
    });

    const signals = [
      {
        id: "sig-01",
        title: "Lead Response Demand Signal",
        type: "ATTENTION_REQUIRED",
        desc: `${unassignedLeads} new walk-in / website leads awaiting sales rep routing.`,
        priority: unassignedLeads > 0 ? "HIGH" : "LOW"
      },
      {
        id: "sig-02",
        title: "HR Leave Approval Queue",
        type: "WORKFLOW_PENDING",
        desc: `${pendingLeaves} employee leave requests awaiting manager approval.`,
        priority: pendingLeaves > 0 ? "MEDIUM" : "LOW"
      },
      {
        id: "sig-03",
        title: "Showroom Vault Stock Replenishment",
        type: "INVENTORY_ALERT",
        desc: "Dadar Flagship Saaj & Thushi showcase stock requires transfer from Main Vault.",
        priority: "MEDIUM"
      }
    ];

    return NextResponse.json({ success: true, data: signals });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}