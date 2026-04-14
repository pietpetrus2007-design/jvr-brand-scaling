"use client"

import { useEffect } from "react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-white font-bold text-xl">Something went wrong</h2>
        <p className="text-[#888] text-sm">Don't worry — your progress is safe. Try refreshing.</p>
        <button
          onClick={reset}
          className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
