import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      where: { isDeleted: false },
      include: {
        inventoryLocations: true,
        _count: {
          select: {
            employees: true,
            sales: true,
            leads: true
          }
        }
      },
      orderBy: { code: "asc" }
    });
    return NextResponse.json({ success: true, data: branches });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}