"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    mpesaNumber: "",
  });
  const [hostname, setHostname] = useState("sokosnap.com");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostname(window.location.host);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const err = await res.text();
        alert(err || "Something went wrong");
      }
    } catch (error) {
      alert("Error creating store");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-[100dvh] flex-col items-center justify-center relative py-10 px-6">
      <div className="z-10 w-full max-w-[440px] space-y-8">
        <div className="flex flex-col items-center text-center space-y-4 animate-slide-up">
          <div className="bg-primary p-3 rounded-2xl text-primary-foreground shadow-[0_0_25px_rgba(174,234,0,0.3)] animate-float">
            <ShoppingBag size={28} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight text-brand-gradient">
              Setup your store
            </h1>
            <p className="text-white/60 font-medium max-w-[280px]">
              Give your store a name and a custom link to share.
            </p>
          </div>
        </div>

        <div className="relative group animate-pop-in">
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 rounded-[3.2rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000" />
          
          <Card className="rounded-[3rem] border border-white/20 bg-[#091515]/80 backdrop-blur-2xl shadow-3xl overflow-hidden p-1">
            <div className="bg-white/5 p-6 sm:p-10 rounded-[2.75rem] space-y-8 border border-white/5 shadow-inner-soft">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white/70 font-semibold mb-1 block px-1">Store Name</Label>
                  <Input
                    id="name"
                    placeholder="My Awesome Shop"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-14 focus-visible:ring-primary rounded-2xl px-6 text-lg font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-white/70 font-semibold mb-1 block px-1 text-xs uppercase tracking-widest">Store Slug (URL Link)</Label>
                  <div className="relative flex items-center group/slug">
                    <div className="flex bg-white/5 border border-white/10 rounded-2xl h-14 items-center px-4 group focus-within:border-primary/50 transition-all w-full overflow-hidden">
                      <span className="text-white/30 font-bold text-xs sm:text-sm select-none shrink-0">
                        <span className="hidden sm:inline">{hostname}</span>/store/
                      </span>
                      <Input 
                        id="slug"
                        placeholder="my-shop"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        className="bg-transparent border-none text-white placeholder:text-white/10 h-10 pl-1 focus-visible:ring-0 focus-visible:outline-none font-black text-lg flex-1 min-w-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mpesa" className="text-white/70 font-semibold mb-1 block px-1">M-Pesa Number</Label>
                  <Input
                    id="mpesa"
                    placeholder="07XX XXX XXX"
                    required
                    value={formData.mpesaNumber}
                    onChange={(e) => setFormData({ ...formData, mpesaNumber: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-14 focus-visible:ring-primary rounded-2xl px-6 text-lg font-bold"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xl font-black h-16 mt-4 rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50" 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "Create Store"}
                </Button>
              </form>
            </div>
          </Card>
        </div>

        <p className="text-center text-white/30 text-sm font-bold animate-slide-up [animation-delay:200ms]">
          Manage your payments and inventory in one place.
        </p>
      </div>
    </div>
  );
}
