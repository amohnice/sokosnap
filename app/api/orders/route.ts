import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import Store from "@/lib/models/Store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, buyerPhone, items, totalAmount } = body;

    if (!slug || !buyerPhone || !items || !totalAmount) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    await dbConnect();
    const store = await Store.findOne({ slug });
    if (!store) return new NextResponse("Store not found", { status: 404 });

    // Create the order
    const order = await Order.create({
      storeId: store._id,
      buyerPhone,
      items,
      totalAmount,
      status: 'PENDING',
    });

    // In a real app, this is where we'd trigger the M-Pesa STK Push
    // For now, we simulate success

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDERS_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const buyerPhone = searchParams.get("phone");

    if (!buyerPhone) {
      return new NextResponse("Phone number required", { status: 400 });
    }

    await dbConnect();
    const orders = await Order.find({ buyerPhone }).sort({ createdAt: -1 });
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
