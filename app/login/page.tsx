"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError("Invalid email or password.")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Subtle glow behind card */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 45%, rgba(255,107,0,0.1) 0%, transparent 65%)",
        }}
      />
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-10 text-center">
          <Link href="/" className="inline-block">
            <span className="font-bold text-2xl tracking-tight">
              <span className="text-[#FF6B00]">JvR</span>
              <span className="text-white"> Brand Scaling</span>
            </span>
          </Link>
          <h1 className="text-white font-bold text-2xl mt-4">Welcome back</h1>
          <p className="text-[#888] text-sm mt-1">Sign in to your account to continue</p>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6B00] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.1)] transition-all duration-150"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors duration-150 text-base"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        {/* Two clear options below form */}
        <div className="mt-5 space-y-3">
          <div className="bg-[#0a0a0a] border border-white/8 rounded-xl px-5 py-4 flex items-center justify-between hover:border-white/15 transition-colors duration-150">
            <span className="text-sm text-[#888]">Don&apos;t have access yet?</span>
            <a
              href="https://brandscaling.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white font-semibold hover:text-[#FF6B00] transition-colors duration-150 flex items-center gap-1"
            >
              Get Access →
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}
