"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Step = "code" | "details"

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  basic: { label: "Basic", color: "text-white" },
  community: { label: "Community", color: "text-blue-400" },
  mentorship: { label: "Mentorship", color: "text-[#FF6B00]" },
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("code")
  const [code, setCode] = useState("")
  const [validatedTier, setValidatedTier] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function validateCode(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await fetch("/api/invite/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error || "Invalid invite code.")
      return
    }
    setValidatedTier(data.tier || null)
    setStep("details")
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, name, email, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error || "Registration failed.")
      return
    }
    router.push("/login?registered=1")
  }

  const tierInfo = validatedTier ? TIER_LABELS[validatedTier] : null

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 40%, rgba(255,107,0,0.1) 0%, transparent 65%)",
        }}
      />
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <span className="font-bold text-2xl tracking-tight">
              <span className="text-[#FF6B00]">JvR</span>
              <span className="text-white"> Brand Scaling</span>
            </span>
          </Link>
        </div>

        {/* Invite code banner — always visible on step 1 */}
        {step === "code" && (
          <div className="mb-6 bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-2xl px-5 py-4">
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">🎟️</span>
              <div>
                <p className="text-white font-bold text-sm">Have an invite code?</p>
                <p className="text-[#aaa] text-sm mt-0.5">
                  Enter it below to get started — your code was sent after purchase.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step indicators */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`flex items-center gap-2 ${step === "code" ? "opacity-100" : "opacity-60"}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-150 ${step === "code" ? "bg-[#FF6B00] text-white" : "bg-[#FF6B00]/20 text-[#FF6B00]"}`}>
              1
            </div>
            <span className={`text-xs font-medium ${step === "code" ? "text-white" : "text-[#888]"}`}>Invite Code</span>
          </div>
          <div className="flex-1 h-px bg-white/10" />
          <div className={`flex items-center gap-2 ${step === "details" ? "opacity-100" : "opacity-40"}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-150 ${step === "details" ? "bg-[#FF6B00] text-white" : "bg-white/10 text-[#555]"}`}>
              2
            </div>
            <span className={`text-xs font-medium ${step === "details" ? "text-white" : "text-[#555]"}`}>Your Account</span>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 space-y-5">
          <div className="mb-1">
            <h2 className="text-white font-bold text-xl">
              {step === "code" ? "Enter Your Invite Code" : "Create Your Account"}
            </h2>
            <p className="text-[#888] text-sm mt-1">
              {step === "code"
                ? "Your code was included in your purchase confirmation."
                : "Almost there — fill in your details below."}
            </p>
          </div>

          {/* Tier unlock badge after validation */}
          {step === "details" && tierInfo && (
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-green-400 text-lg">✅</span>
              <div>
                <p className="text-white text-sm font-semibold">
                  <span className={tierInfo.color}>{tierInfo.label}</span> access unlocked!
                </p>
                <p className="text-[#888] text-xs mt-0.5">Code verified — complete registration below</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {step === "code" ? (
            <form onSubmit={validateCode} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#aaa]">Invite Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-lg font-mono tracking-widest focus:outline-none focus:border-[#FF6B00] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.1)] transition-all duration-150 placeholder:text-[#444] text-center"
                  placeholder="BASIC-001"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors duration-150 text-base"
              >
                {loading ? "Verifying..." : "Verify Code →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#aaa]">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6B00] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.1)] transition-all duration-150"
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#aaa]">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6B00] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.1)] transition-all duration-150"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#aaa]">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6B00] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.1)] transition-all duration-150"
                  placeholder="Minimum 8 characters"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors duration-150 text-base"
              >
                {loading ? "Creating account..." : "Create Account →"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("code"); setError("") }}
                className="w-full text-sm text-[#888] hover:text-white transition-colors duration-150 py-1"
              >
                ← Back to code entry
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-[#888] mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-[#FF6B00] font-semibold hover:text-[#ff8533] transition-colors duration-150">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
