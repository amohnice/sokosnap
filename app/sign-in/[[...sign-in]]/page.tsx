import { CustomSignIn } from "@/components/auth/custom-sign-in";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="flex min-[100dvh] flex-col items-center justify-center bg-background relative overflow-hidden py-6">
      {/* Background Decorative Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="z-10 w-full max-w-[420px] px-6 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <Link href="/" className="group flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-primary p-2 rounded-xl text-primary-foreground">
              <ShoppingBag size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">SokoSnap</span>
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight">Welcome Back</h1>
            <p className="text-white/60 font-medium">Continue building your micro-marketplace</p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
          <div className="relative bg-[#091515]/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden p-6 sm:p-8">
            <CustomSignIn />
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white font-bold text-sm transition-colors">
            <ArrowLeft size={16} /> Back to Landing
          </Link>
        </div>
      </div>
    </div>
  );
}
