import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#091515]">
      <div className="text-center space-y-4">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white/60 font-medium animate-pulse">Completing authentication...</p>
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  );
}
