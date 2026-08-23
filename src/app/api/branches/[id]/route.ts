import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const branch = await db.branch.findUnique({
      where: { id },
      include: {
        employees: {
          include: {
            user: true,
            department: true,
            designation: true,
            attendance: {
              take: 5,
              orderBy: { date: "desc" }
            }
          }
        },
        inventoryLocations: {
          include: {
            items: {
              take: 10,
              include: { product: true }
            }
          }
        },
        leads: {
          take: 10,
          orderBy: { createdAt: "desc" }
        },
        appointments: {
          take: 10,
          orderBy: { createdAt: "desc" }
        },
        sales: {
          take: 10,
          orderBy: { saleDate: "desc" },
          include: { customer: true }
        }
      }
    });

    if (!branch) {
      return NextResponse.json({ success: false, error: "Branch not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: branch });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}