"use client"

import { useEffect, useState } from "react"
import JitsiCall from "./JitsiCall"

interface GroupCall {
  id: string
  title: string
  scheduledAt: string
  roomName: string
}

interface Props {
  userName: string
  isAdmin: boolean
}

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return null
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds }
}

export default function CallCountdown({ userName, isAdmin }: Props) {
  const [call, setCall] = useState<GroupCall | null | undefined>(undefined)
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft>>(null)
  const [showCall, setShowCall] = useState(false)

  useEffect(() => {
    fetch("/api/calls")
      .then((r) => r.json())
      .then((data) => setCall(data))
      .catch(() => setCall(null))
  }, [])

  useEffect(() => {
    if (!call) return
    const target = new Date(call.scheduledAt)
    const tick = () => setTimeLeft(getTimeLeft(target))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [call])

  if (call === undefined) return null
  if (!call) return null

  const isLive = timeLeft === null

  return (
    <>
      {showCall && (
        <JitsiCall
          roomName={call.roomName}
          userName={userName}
          isAdmin={isAdmin}
          onClose={() => setShowCall(false)}
        />
      )}
      <div className="mx-4 mt-4 bg-[#0f0f0f] border border-[#FF6B00]/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[#FF6B00] text-xs font-bold uppercase tracking-widest mb-1">
            {isLive ? "🔴 Live Now" : "📹 Upcoming Group Call"}
          </p>
          <p className="text-white font-semibold text-sm truncate">{call.title}</p>
          {!isLive && timeLeft && (
            <div className="flex gap-3 mt-2">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hrs", value: timeLeft.hours },
                { label: "Min", value: timeLeft.minutes },
                { label: "Sec", value: timeLeft.seconds },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-[#FF6B00] font-bold text-lg leading-none tabular-nums">
                    {String(value).padStart(2, "0")}
                  </p>
                  <p className="text-[#555] text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {isLive && (
          <button
            onClick={() => setShowCall(true)}
            className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors duration-150 flex-shrink-0"
          >
            Join Now →
          </button>
        )}
      </div>
    </>
  )
}
