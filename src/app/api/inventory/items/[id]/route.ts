import { calculateJewelleryTax } from "@/lib/taxEngine";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, note, toBranchId, customerId } = body;

    const item = await db.jewelleryItem.findUnique({
      where: { id },
      include: { location: true, product: true }
    });

    if (!item) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    // Find or fallback customer for complete business records
    let customer = null;
    if (customerId) {
      customer = await db.customer.findUnique({ where: { id: customerId } });
    }
    if (!customer) {
      customer = await db.customer.findFirst();
    }
    if (!customer) {
      customer = await db.customer.create({
        data: {
          name: "Walk-in VIP Customer",
          phone: "+919800000000",
          loyaltyTier: "SILVER"
        }
      });
    }

    // Execute ATOMIC Prisma $transaction
    const result = await db.$transaction(async (tx) => {
      let updatedStatus = item.status;
      let targetBranchId = item.branchId;
      let createdRecord: any = null;

      if (action === "RESERVE") {
        updatedStatus = "RESERVED";
        // 1. Create Reservation Record
        createdRecord = await tx.reservation.create({
          data: {
            itemId: item.id,
            customerId: customer.id,
            branchId: item.branchId,
            reservedBy: "Super Admin",
            reservedAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 Days Expiry
            status: "ACTIVE",
            notes: note || "Reserved for private VIP store consultation"
          }
        });
      } else if (action === "TRANSFER") {
        updatedStatus = "IN_TRANSIT";
        targetBranchId = toBranchId || item.branchId;

        // 2. Create StockTransfer & StockTransferItem Records
        createdRecord = await tx.stockTransfer.create({
          data: {
            transferNo: `TRF-${Date.now().toString().slice(-6)}`,
            fromBranchId: item.branchId,
            toBranchId: targetBranchId,
            initiatedBy: "Super Admin",
            status: "DISPATCHED",
            totalItems: 1,
            totalValue: item.tagPrice || 0,
            notes: note || `Stock Transfer initiated to branch ${targetBranchId}`,
            items: {
              create: [
                {
                  itemId: item.id,
                  dispatchStatus: "IN_TRANSIT",
                  notes: "Dispatched in transit"
                }
              ]
            }
          },
          include: { items: true }
        });
      } else if (action === "REPAIR") {
        updatedStatus = "UNDER_REPAIR";
        // 3. Create RepairTicket Record
        createdRecord = await tx.repairTicket.create({
          data: {
            ticketNo: `RPR-${Date.now().toString().slice(-6)}`,
            customerId: customer.id,
            branchId: item.branchId,
            itemId: item.id,
            receivedBy: "Super Admin",
            description: note || "Polishing & HUID hallmarking verification",
            estimatedCost: 1500.0,
            status: "IN_PROGRESS"
          }
        });
      } else if (action === "SELL") {
        updatedStatus = "SOLD";
        const taxResult = calculateJewelleryTax({
          tagPrice: item.tagPrice || 100000,
          metalType: item.metalType,
          makingCharge: item.makingCharge
        });
        const tagPrice = taxResult.subtotal;
        const gstAmount = taxResult.totalGst;
        const totalAmount = taxResult.grandTotal;

        // 4. Create Sale + SaleItem + Invoice + Payment Records
        const sale = await tx.sale.create({
          data: {
            saleNo: `INV-${Date.now().toString().slice(-6)}`,
            customerId: customer.id,
            branchId: item.branchId,
            salespersonId: "admin-user",
            subtotal: tagPrice,
            gstAmount: gstAmount,
            totalAmount: totalAmount,
            amountPaid: totalAmount,
            balanceDue: 0,
            paymentStatus: "PAID",
            notes: note || "Completed sale transaction",
            items: {
              create: [
                {
                  itemId: item.id,
                  unitPrice: tagPrice,
                  gstAmount: gstAmount,
                  finalPrice: totalAmount
                }
              ]
            },
            payments: {
              create: [
                {
                  amount: totalAmount,
                  method: "UPI / CARD",
                  status: "CAPTURED",
                  capturedBy: "Super Admin"
                }
              ]
            },
            invoice: {
              create: {
                invoiceNo: `TAX-${Date.now().toString().slice(-6)}`,
                gstType: "CGST_SGST"
              }
            }
          },
          include: { items: true, payments: true, invoice: true }
        });
        createdRecord = sale;
      }

      // Update JewelleryItem Status & Branch
      const updatedItem = await tx.jewelleryItem.update({
        where: { id },
        data: {
          status: updatedStatus,
          branchId: targetBranchId
        },
        include: { product: true, location: true }
      });

      // Write Audit Event inside transaction
      await tx.auditEvent.create({
        data: {
          userId: null,
          action: `ITEM_${action}`,
          module: "INVENTORY",
          entityType: "JewelleryItem",
          entityId: item.id
        }
      });

      return { updatedItem, createdRecord };
    });

    return NextResponse.json({ success: true, data: result.updatedItem, record: result.createdRecord });
  } catch (error: any) {
    console.error("Atomic Inventory Transaction Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}