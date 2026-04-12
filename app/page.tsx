import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, Sparkles, Send, Smartphone, 
  Zap, ArrowRight, MessageSquare, ClipboardList
} from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-[#091515]/60 backdrop-blur-2xl border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-lg shadow-primary/20 animate-float">
              <ShoppingBag size={24} />
            </div>
            <span className="text-xl md:text-2xl font-black italic tracking-tighter font-heading text-white">
              Soko<span className="text-primary">Snap</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6 text-white font-bold">
            {!userId && (
              <Link href="/sign-in" className="hidden sm:block text-sm hover:text-primary transition-colors">
                Login
              </Link>
            )}
            <Button asChild size="lg" className="rounded-full px-5 md:px-8 h-10 md:h-11 text-sm md:text-base font-black bg-primary hover:bg-primary/90 text-primary-foreground border-none shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
              <Link href={userId ? "/dashboard" : "/sign-up"}>
                {userId ? "Go to Dashboard" : "Get Started"}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] min-h-[500px]">
          <div className="container mx-auto px-6 relative z-10 py-2 md:py-4">
            <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-primary text-xs md:text-sm font-black border border-white/10 animate-fade-in uppercase tracking-widest">
                <Sparkles size={16} className="animate-pulse" />
                <span>AI-Powered Marketplace</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight font-display leading-[0.9] text-white animate-slide-up text-brand-gradient">
                Chat to Store <br />
                in seconds.
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-medium leading-relaxed animate-slide-up [animation-delay:100ms] px-2 md:px-0">
                Paste your product list from WhatsApp. <br className="hidden md:block" />
                Get a professional store with M-Pesa checkout instantly.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 md:pt-10 animate-slide-up [animation-delay:200ms]">
                <Button asChild size="xl" className="h-14 md:h-16 px-10 md:px-12 text-lg font-black rounded-[2rem] w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:scale-[1.03] active:scale-95">
                  <Link href={userId ? "/dashboard" : "/sign-up"}>
                    Build your store free <ArrowRight className="ml-3" strokeWidth={3} />
                  </Link>
                </Button>
                <Link href="#how" className="text-base md:text-lg font-black text-white hover:text-primary transition-colors flex items-center gap-3">
                  See how it works <Zap size={22} className="text-primary fill-primary" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* The Direct Flow (Modified for Consistency) */}
        <section id="how" className="py-40 border-t border-white/5">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
              <div className="flex flex-col items-center text-center space-y-8 p-10 rounded-[3rem] bg-white/5 backdrop-blur-xl border border-white/10 group hover:border-primary/30 hover:bg-white/[0.07] transition-all duration-500 animate-slide-up">
                <div className="w-24 h-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  <MessageSquare size={40} strokeWidth={2.5} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-white">1. Paste Chat</h3>
                  <p className="text-white/40 font-bold text-lg leading-relaxed">
                    Copy your stock list from WhatsApp or Facebook chat.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-8 p-10 rounded-[3rem] bg-white/5 backdrop-blur-xl border border-white/10 group hover:border-primary/30 hover:bg-white/[0.07] transition-all duration-500 animate-slide-up [animation-delay:100ms]">
                <div className="w-24 h-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  <ClipboardList size={40} strokeWidth={2.5} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-white">2. AI Build</h3>
                  <p className="text-white/40 font-bold text-lg leading-relaxed">
                    Our AI creates your catalog and M-Pesa link automatically.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-8 p-10 rounded-[3rem] bg-white/5 backdrop-blur-xl border border-white/10 group hover:border-primary/30 hover:bg-white/[0.07] transition-all duration-500 animate-slide-up [animation-delay:200ms]">
                <div className="w-24 h-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  <Smartphone size={40} strokeWidth={2.5} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-white">3. Get Paid</h3>
                  <p className="text-white/40 font-bold text-lg leading-relaxed">
                    Share your link. Customers pay via STK push instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-16 border-t border-white/5">
        <div className="container mx-auto px-6 flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            <span className="font-heading text-lg font-black italic tracking-tighter text-white">
              Soko<span className="text-primary">Snap</span>
            </span>
          </div>
          
          <p className="text-sm font-medium text-white/40 text-center">
            © {new Date().getFullYear()} SokoSnap. Built for micro-merchants in Kenya.
          </p>

          <div className="flex gap-8">
            <Link href="/privacy" className="text-sm font-medium text-white/40 hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-sm font-medium text-white/40 hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
