"use client";

import { UserButton } from "@clerk/nextjs";
import { ExternalLink, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardNavbarProps {
  storeSlug?: string;
}

export function DashboardNavbar({ storeSlug }: DashboardNavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#091515]/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <ShoppingBag size={18} />
          </div>
          <span className="font-heading text-xl font-black italic tracking-tighter text-white">
            Soko<span className="text-primary">Snap</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {storeSlug && (
            <Button variant="ghost" size="sm" asChild className="text-white hover:text-primary hover:bg-white/5 font-bold rounded-xl h-10 px-4">
              <a href={`/store/${storeSlug}`} target="_blank">
                <ExternalLink size={16} className="mr-2" /> View Store
              </a>
            </Button>
          )}
          <div className="h-8 w-[1px] bg-white/5 mx-1 hidden md:block" />
          <UserButton 
            appearance={{
              elements: {
                userButtonAvatarBox: "h-9 w-9 rounded-xl border border-white/10 shadow-xl",
                userButtonPopoverCard: "bg-[#091515] border border-white/10 backdrop-blur-3xl",
              }
            }}
          />
        </div>
      </div>
    </nav>
  );
}
