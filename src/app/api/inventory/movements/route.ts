import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, logAuditEvent } from "@/lib/auth";

export async function GET() {
  try {
    const movements = await prisma.inventoryMovement.findMany({
      include: {
        item: { include: { product: true } },
        fromLocation: true,
        toLocation: true
      },
      orderBy: { movedAt: "desc" },
      take: 50
    });
    return NextResponse.json({ success: true, data: movements });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const { itemId, toLocationId, movementType, notes } = await req.json();

    const item = await prisma.jewelleryItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    const fromLocationId = item.locationId;

    // Perform atomic transaction: create movement log & update item location
    const [movement, updatedItem] = await prisma.$transaction([
      prisma.inventoryMovement.create({
        data: {
          itemId,
          movementType: movementType || "VAULT_TO_SHOWCASE",
          fromBranchId: item.branchId,
          toBranchId: item.branchId,
          fromLocationId,
          toLocationId,
          movedBy: user?.name || "Store Admin",
          notes,
          itemValueAtMove: item.tagPrice
        }
      }),
      prisma.jewelleryItem.update({
        where: { id: itemId },
        data: { locationId: toLocationId }
      })
    ]);

    await logAuditEvent({
      userId: user?.userId,
      action: "ITEM_LOCATION_MOVED",
      module: "INVENTORY",
      entityType: "JewelleryItem",
      entityId: itemId,
      oldValue: { locationId: fromLocationId },
      newValue: { locationId: toLocationId }
    });

    return NextResponse.json({ success: true, data: { movement, updatedItem } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}