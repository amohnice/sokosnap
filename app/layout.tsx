import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontHeading = Syne({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "SokoSnap – Chat to Store",
  description: "Turn any messy product list into a beautiful digital catalog with M-Pesa checkout",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable, fontHeading.variable)}>
        <body className="flex min-h-screen flex-col relative overflow-x-hidden">
          {/* Global Design System Background */}
          <div className="fixed inset-0 bg-background pointer-events-none -z-20" />
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
          
          <div className="relative z-0 flex min-h-screen flex-col">
            {children}
          </div>
          <Toaster 
            theme="dark" 
            position="bottom-right" 
            toastOptions={{
              className: "z-[9999] rounded-2xl border-white/10 bg-[#091515]/95",
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
