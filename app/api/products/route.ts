import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Store from "@/lib/models/Store";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    await dbConnect();
    const store = await Store.findOne({ userId });
    if (!store) return NextResponse.json([]);

    const products = await Product.find({ storeId: store._id }).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { name, price, description, imageUrl, stockCount } = body;

    await dbConnect();
    const store = await Store.findOne({ userId });
    if (!store) return new NextResponse("Store not found", { status: 404 });

    const product = await Product.create({
      storeId: store._id,
      name,
      price,
      description,
      imageUrl,
      stockCount: stockCount || 0,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCTS_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
