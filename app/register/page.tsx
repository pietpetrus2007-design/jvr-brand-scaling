"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Step = "code" | "details"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("code")
  const [code, setCode] = useState("")
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

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-white font-bold text-2xl tracking-tight">JvR Brand Scaling</Link>
          <p className="text-[#888] text-sm mt-2">
            {step === "code" ? "Enter your invite code" : "Create your account"}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-5">
          {/* Step indicators */}
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === "code" ? "bg-[#FF6B00] text-white" : "bg-[#FF6B00]/20 text-[#FF6B00]"}`}>1</div>
            <div className="flex-1 h-px bg-white/10" />
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === "details" ? "bg-[#FF6B00] text-white" : "bg-white/10 text-[#555]"}`}>2</div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {step === "code" ? (
            <form onSubmit={validateCode} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-[#888]">Invite Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6B00] transition-colors font-mono tracking-wider"
                  placeholder="BASIC-001"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? "Validating..." : "Continue"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-[#888]">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6B00] transition-colors"
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#888]">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6B00] transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#888]">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6B00] transition-colors"
                  placeholder="Min 8 characters"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("code"); setError("") }}
                className="w-full text-sm text-[#888] hover:text-white transition-colors"
              >
                ← Back
              </button>
            </form>
          )}

          <p className="text-center text-sm text-[#888]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#FF6B00] hover:text-[#ff8533]">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
