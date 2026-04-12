import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import Store from "@/lib/models/Store";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    await dbConnect();
    const store = await Store.findOne({ userId });
    if (!store) return NextResponse.json([]);

    const orders = await Order.find({ storeId: store._id }).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("[ORDERS_SELLER_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
