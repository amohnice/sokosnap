import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import Store from "@/lib/models/Store";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { status } = await req.json();
    if (!status) return new NextResponse("Status is required", { status: 400 });

    await dbConnect();
    
    // Ensure the order belongs to the user's store
    const store = await Store.findOne({ userId });
    if (!store) {
      console.error("[ORDER_PATCH] Store not found for user:", userId);
      return new NextResponse("Store not found", { status: 404 });
    }


    const order = await Order.findOneAndUpdate(
      { 
        _id: new mongoose.Types.ObjectId(orderId), 
        storeId: store._id 
      },
      { status },
      { new: true }
    );

    if (!order) {
      console.error("[ORDER_PATCH] Order not found or ownership mismatch. OrderID:", orderId, "StoreID:", store._id);
      return new NextResponse("Order not found or ownership mismatch", { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDER_PATCH] Critical Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
