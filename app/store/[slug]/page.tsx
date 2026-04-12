import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Store from "@/lib/models/Store";
import Product from "@/lib/models/Product";
import StorefrontClient from "./StorefrontClient";
import { Metadata } from "next";

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const store = await Store.findOne({ slug });

  if (!store) return { title: "Store Not Found" };

  return {
    title: `${store.name} | SokoSnap Boutique`,
    description: store.tagline || `Shop quality products from ${store.name} on SokoSnap.`,
  };
}

export default async function StorefrontPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;

  await dbConnect();
  const store = await Store.findOne({ slug });

  if (!store) {
    notFound();
  }

  const products = await Product.find({ 
    storeId: store._id, 
    isActive: true 
  }).sort({ createdAt: -1 });

  // Convert Mongoose products to plain objects for client component
  const plainProducts = JSON.parse(JSON.stringify(products));
  const plainStore = JSON.parse(JSON.stringify(store));

  return (
    <StorefrontClient 
      store={plainStore} 
      products={plainProducts} 
    />
  );
}
