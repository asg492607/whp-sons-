import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      include: {
        category: true,
        collection: true,
        media: true,
        items: {
          where: { isDeleted: false },
          include: {
            location: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sku, name, categoryId, metalType, purity, minWeightGm, maxWeightGm, description } = body;

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        categoryId,
        metalType,
        purity,
        minWeightGm: parseFloat(minWeightGm || 0),
        maxWeightGm: parseFloat(maxWeightGm || 0),
        description,
        status: "ACTIVE"
      }
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}