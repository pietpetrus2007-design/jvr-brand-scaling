"use client"
import { useState, useEffect } from "react"

export default function LaunchCountdown({ isAdmin }: { isAdmin: boolean }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, done: false })

  useEffect(() => {
    const target = new Date(process.env.NEXT_PUBLIC_LAUNCH_DATE || '2026-05-11T00:00:00+02:00')

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

  if (isAdmin || timeLeft.done) return null

  return (
    <div
      style={{ background: 'linear-gradient(90deg, #111 0%, #1a0a00 100%)', borderBottom: '1px solid rgba(255,107,0,0.3)' }}
      className="w-full px-4 py-3 text-center"
    >
      <p className="text-white text-sm font-semibold">
        🚀 Full course content unlocks in{" "}
        <span className="text-[#FF6B00] font-black">{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
        {" "}— you&apos;re in early! 🔥
      </p>
    </div>
  )
}
