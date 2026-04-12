import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Store from "@/lib/models/Store";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { products } = body;

    if (!Array.isArray(products)) {
      return new NextResponse("Invalid request body", { status: 400 });
    }

    await dbConnect();
    const store = await Store.findOne({ userId });
    if (!store) return new NextResponse("Store not found", { status: 404 });

    const productsToInsert = products.map((p: any) => ({
      ...p,
      storeId: store._id,
      stockCount: p.stockCount || 0,
      isActive: true,
    }));

    await Product.insertMany(productsToInsert);

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("[PRODUCTS_BULK_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
