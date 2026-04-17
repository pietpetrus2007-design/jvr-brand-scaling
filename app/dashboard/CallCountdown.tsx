"use client"

import { useEffect, useState } from "react"
import JitsiCall from "./JitsiCall"

interface GroupCall {
  id: string
  title: string
  scheduledAt: string
  roomName: string
  startedAt: string | null
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

  function fetchCall() {
    fetch("/api/calls")
      .then((r) => r.json())
      .then((data) => setCall(data))
      .catch(() => setCall(null))
  }

  useEffect(() => {
    fetchCall()
    // Poll every 15 seconds to detect when a call goes live
    const pollId = setInterval(fetchCall, 15_000)
    return () => clearInterval(pollId)
  }, [])

  useEffect(() => {
    if (!call) return
    // If already started, no countdown needed
    if (call.startedAt) {
      setTimeLeft(null)
      return
    }
    const target = new Date(call.scheduledAt)
    const tick = () => setTimeLeft(getTimeLeft(target))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [call])

  if (call === undefined) return null
  if (!call) return null

  const isLive = !!call.startedAt || timeLeft === null

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
          {isLive ? (
            <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
              Live Now
            </p>
          ) : (
            <p className="text-[#FF6B00] text-xs font-bold uppercase tracking-widest mb-1">
              📹 Upcoming Group Call
            </p>
          )}
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
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors duration-150 flex-shrink-0 animate-pulse"
          >
            🔴 Join Now →
          </button>
        )}
      </div>
    </>
  )
}
