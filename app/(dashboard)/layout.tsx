import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Store from "@/lib/models/Store";
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  await dbConnect();
  const store = await Store.findOne({ userId });

  // If on onboarding, don't redirect to onboarding
  // This is a simplified check. For a more robust one, we'd check the pathname.
  // But since layout.tsx doesn't have pathname, we can do it in the page or use a wrapper.
  
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 relative">{children}</main>
      <Toaster />
    </div>
  );
}
