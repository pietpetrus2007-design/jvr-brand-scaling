"use client"
import { useState, useEffect } from "react"

export default function LaunchCountdown({ isAdmin }: { isAdmin: boolean }) {
  const [timeLeft, setTimeLeft] = useState({ days: 21, hours: 0, minutes: 0, seconds: 0, done: false })

  useEffect(() => {
    const target = new Date(process.env.NEXT_PUBLIC_LAUNCH_DATE || '2026-05-15T14:00:00+02:00')

    const tick = () => {
      const now = new Date()
      const diff = target.getTime() - now.getTime()
      if (diff <= 0) { setTimeLeft(t => ({ ...t, done: true })); return }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        done: false
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Admin or past launch = no lockout
  if (isAdmin || timeLeft.done) return null

  // Full page lockout
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black px-6 text-center">
      {/* Logo/Brand */}
      <div className="mb-8">
        <h1 className="text-[#FF6B00] font-black text-2xl tracking-wider uppercase">JvR Brand Scaling</h1>
        <p className="text-[#555] text-sm mt-1">Program Portal</p>
      </div>

      {/* Main message */}
      <h2 className="text-white font-black text-3xl sm:text-4xl mb-2 leading-tight">
        You&apos;re In Early.
      </h2>
      <p className="text-[#888] text-base mb-10 max-w-sm">
        The full program unlocks on <span className="text-white font-semibold">May 15, 2026</span>. Your account is ready — sit tight.
      </p>

      {/* Countdown */}
      <div className="flex gap-4 sm:gap-6 mb-10">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Minutes', value: timeLeft.minutes },
          { label: 'Seconds', value: timeLeft.seconds },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center">
            <div className="bg-[#111] border border-[#FF6B00]/30 rounded-xl px-4 sm:px-6 py-4 min-w-[70px] sm:min-w-[90px]">
              <span className="text-[#FF6B00] font-black text-3xl sm:text-4xl tabular-nums">
                {String(value).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[#555] text-xs mt-2 uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>

      {/* Message */}
      <p className="text-[#444] text-sm max-w-xs">
        While you wait — get your mindset right. The opportunity is real. Be ready to execute from day one.
      </p>
    </div>
  )
}
