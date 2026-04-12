import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Store from "@/lib/models/Store";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    await dbConnect();
    const store = await Store.findOne({ userId });
    
    return NextResponse.json(store);
  } catch (error) {
    console.error("[STORES_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { name, slug, mpesaNumber } = body;

    if (!name || !slug || !mpesaNumber) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    await dbConnect();

    // Check if slug is taken
    const existingStore = await Store.findOne({ slug });
    if (existingStore) {
      return new NextResponse("Slug already taken", { status: 400 });
    }

    const store = await Store.create({
      userId,
      name,
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      mpesaNumber,
    });

    return NextResponse.json(store);
  } catch (error) {
    console.error("[STORES_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { name, tagline, mpesaNumber } = body;

    await dbConnect();

    const store = await Store.findOneAndUpdate(
      { userId },
      { name, tagline, mpesaNumber },
      { new: true }
    );

    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error("[STORES_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
