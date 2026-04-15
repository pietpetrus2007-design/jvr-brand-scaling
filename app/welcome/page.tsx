"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

function WelcomeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) setEmail(emailParam)
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setLoading(true)

    const res = await fetch("/api/welcome/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Something went wrong. Please try again.")
      setLoading(false)
      return
    }

    // Already activated — redirect to login
    if (data.redirect) {
      router.push("/login")
      return
    }

    // Activation succeeded — sign in
    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (signInRes?.error) {
      setError("Account activated but sign-in failed. Please go to the login page.")
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Background glow */}
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
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 space-y-5">
          {/* Header */}
          <div className="text-center space-y-1 pb-2">
            <h1 className="text-white font-bold text-2xl">Welcome to the Program 🎉</h1>
            <p className="text-[#888] text-sm">
              Your account is ready. Set your password to get started.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#aaa]">Confirm Password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6B00] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.1)] transition-all duration-150"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors duration-150 text-base mt-2"
            >
              {loading ? "Activating..." : "Activate Account"}
            </button>
          </form>
        </div>

        <div className="mt-5 text-center">
          <span className="text-sm text-[#888]">Already have an account?{" "}</span>
          <Link href="/login" className="text-sm text-[#FF6B00] font-semibold hover:text-[#ff8533] transition-colors duration-150">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function WelcomePage() {
  return (
    <Suspense>
      <WelcomeForm />
    </Suspense>
  )
}
