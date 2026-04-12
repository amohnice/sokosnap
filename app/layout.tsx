import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "SokoSnap – Chat to Store",
  description: "Turn any messy product list into a beautiful digital catalog with M-Pesa checkout",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height: "100%" }} className={cn("font-sans", geist.variable)}>
      <body style={{ minHeight: "100%", display: "flex", flexDirection: "column", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
