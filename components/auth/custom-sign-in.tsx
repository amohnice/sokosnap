"use client"

import { useState } from "react"
import { useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import Link from "next/link"

const AFTER_SIGN_IN_URL = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || "/dashboard";

export function CustomSignIn() {
  const clerk = useClerk()
  const [emailAddress, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clerk) return

    setIsLoading(true)

    try {
      const result = await clerk.client.signIn.create({
        identifier: emailAddress,
        password,
      })

      if (result.status === "complete") {
        await clerk.setActive({ session: result.createdSessionId })
        router.push(AFTER_SIGN_IN_URL)
      } else {
        toast.error("Further action required to complete sign-in.")
      }
    } catch (err: any) {
      toast.error(err.errors?.[0]?.longMessage || "Failed to sign in")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!clerk) return
    setIsGoogleLoading(true)
    try {
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback", // Standard Clerk callback route
        redirectUrlComplete: AFTER_SIGN_IN_URL,
      })
    } catch (err: any) {
      toast.error(err.errors?.[0]?.longMessage || "Failed to sign in with Google")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Button 
        variant="outline" 
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isLoading}
        className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 h-12 rounded-xl flex items-center justify-center gap-3 font-bold"
      >
        {isGoogleLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#0b1b1b] px-2 text-white/30 font-bold">or</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-white/70 font-semibold mb-1 block">Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            value={emailAddress} 
            onChange={(e) => setEmailAddress(e.target.value)} 
            autoComplete="email"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 focus-visible:ring-primary rounded-xl"
            placeholder="email@example.com"
            required 
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-white/70 font-semibold mb-1 block">Password</Label>
          <Input 
            id="password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="bg-white/5 border-white/10 text-white h-11 focus-visible:ring-primary rounded-xl"
            placeholder="••••••••"
            required 
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading || isGoogleLoading || !clerk} 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base font-black h-12 mt-4 rounded-xl shadow-lg shadow-primary/20 transition-transform active:scale-95"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
        </Button>

        <div className="text-center text-sm font-medium text-white/50 pt-2">
          Don't have an account?{' '}
          <Link href="/sign-up" className="text-primary hover:text-primary/80 font-bold transition-colors">
            Sign up
          </Link>
        </div>
      </form>
    </div>
  )
}
