import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Store from "@/lib/models/Store";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { name, price, description, imageUrl, stockCount } = body;

    await dbConnect();
    const store = await Store.findOne({ userId });
    if (!store) return new NextResponse("Store not found", { status: 404 });

    const product = await Product.findOneAndUpdate(
      { _id: id, storeId: store._id },
      {
        name,
        price,
        description,
        imageUrl,
        stockCount: stockCount || 0,
      },
      { new: true }
    );

    if (!product) return new NextResponse("Product not found", { status: 404 });

    return NextResponse.json(product);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    await dbConnect();
    const store = await Store.findOne({ userId });
    if (!store) return new NextResponse("Store not found", { status: 404 });

    const product = await Product.findOneAndDelete({
      _id: id,
      storeId: store._id,
    });

    if (!product) return new NextResponse("Product not found", { status: 404 });

    return NextResponse.json(product);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
