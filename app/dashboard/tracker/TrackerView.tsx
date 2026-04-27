"use client"

import { useState, useEffect, useRef } from "react"

interface ProgressEntry {
  id: string
  paymentsReceived: number
  paymentsValue: number
  notes: string | null
  createdAt: string
}

interface LeaderboardEntry {
  rank: number
  name: string
  revenue: number
  payments: number
  isMe: boolean
}

interface Props {
  unlocked: boolean
  completionPct: number
  initialEntries: ProgressEntry[]
  leaderboard: LeaderboardEntry[]
  communityRevenue: number
  communityPayments: number
}

function formatEntryDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const yest = new Date(now)
  yest.setDate(yest.getDate() - 1)
  if (d.toDateString() === now.toDateString()) return "Today"
  if (d.toDateString() === yest.toDateString()) return "Yesterday"
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })
}

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const start = prev.current
    const diff = target - start
    if (diff === 0) return
    const startTime = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(start + diff * ease))
      if (progress < 1) requestAnimationFrame(tick)
      else prev.current = target
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return value
}

const inputCls =
  "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF6B00] transition-colors duration-150"

export default function TrackerView({ initialEntries, leaderboard, communityRevenue, communityPayments }: Props) {
  const [entries, setEntries] = useState<ProgressEntry[]>(initialEntries)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(leaderboard)
  const [commRevenue, setCommRevenue] = useState(communityRevenue)
  const [commPayments, setCommPayments] = useState(communityPayments)
  const [paymentsReceived, setPaymentsReceived] = useState("")
  const [paymentsValue, setPaymentsValue] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [celebrated, setCelebrated] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const animatedRevenue = useCountUp(commRevenue)
  const totalRevenue = entries.reduce((s, e) => s + e.paymentsValue, 0)
  const totalPayments = entries.reduce((s, e) => s + e.paymentsReceived, 0)
  const visibleEntries = showAll ? entries : entries.slice(0, 10)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!paymentsValue || Number(paymentsValue) <= 0) return
    setSaving(true)
    const res = await fetch("/api/tracker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessesOutreached: 0,
        conversationsStarted: 0,
        potentialClients: 0,
        activeClients: 0,
        paymentsReceived: Number(paymentsReceived) || 1,
        paymentsValue: Number(paymentsValue) || 0,
        moodScore: 7,
        notes,
      }),
    })
    if (res.ok) {
      const entry = await res.json()
      setEntries((prev) => [entry, ...prev])
      setCommRevenue(prev => prev + (Number(paymentsValue) || 0))
      setCommPayments(prev => prev + (Number(paymentsReceived) || 1))
      setPaymentsReceived("")
      setPaymentsValue("")
      setNotes("")
      setCelebrated(true)
      setTimeout(() => setCelebrated(false), 4000)
    }
    setSaving(false)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Revenue Tracker</h1>
        <p className="text-[#888] text-sm mt-1">Log your wins. Watch the community grow.</p>
      </div>

      {/* Community hero stat */}
      <div className="bg-black border border-[#FF6B00]/30 rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(255,107,0,0.12)]">
        <p className="text-xs uppercase tracking-[0.2em] text-[#FF6B00] font-semibold mb-2">Community Revenue</p>
        <p className="text-[#FF6B00] font-black text-5xl tracking-tight">
          R{animatedRevenue.toLocaleString()}
        </p>
        <p className="text-[#555] text-xs mt-2">{commPayments} payment{commPayments !== 1 ? 's' : ''} logged by students</p>
      </div>

      {/* My stats */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0d0d0d] border border-white/8 rounded-2xl p-4 text-center">
            <p className="text-[#FF6B00] font-black text-2xl">R{totalRevenue.toLocaleString()}</p>
            <p className="text-[#555] text-xs mt-1">My Revenue</p>
          </div>
          <div className="bg-[#0d0d0d] border border-white/8 rounded-2xl p-4 text-center">
            <p className="text-white font-black text-2xl">{totalPayments}</p>
            <p className="text-[#555] text-xs mt-1">My Payments</p>
          </div>
        </div>
      )}

      {/* Celebration */}
      {celebrated && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 text-center">
          <p className="text-3xl mb-2">🔥</p>
          <p className="text-green-400 font-bold text-base">Win logged!</p>
          <p className="text-[#888] text-sm mt-1">Your payment has been added to the community total.</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[#0d0d0d] border border-white/8 rounded-2xl p-5 space-y-4">
        <h3 className="text-white font-bold text-sm">Log a Win</h3>
        <div className="space-y-1">
          <label className="text-xs text-[#888] font-medium">Revenue Amount (R)</label>
          <input
            type="number"
            min="1"
            value={paymentsValue}
            onChange={(e) => setPaymentsValue(e.target.value)}
            className={inputCls}
            placeholder="e.g. 3500"
            style={{ fontSize: '16px' }}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[#888] font-medium">Number of Payments</label>
          <input
            type="number"
            min="1"
            value={paymentsReceived}
            onChange={(e) => setPaymentsReceived(e.target.value)}
            className={inputCls}
            placeholder="1"
            style={{ fontSize: '16px' }}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[#888] font-medium">What was this for? (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputCls}
            placeholder="e.g. First client — gym in Pretoria"
            style={{ fontSize: '16px' }}
          />
        </div>
        <button
          type="submit"
          disabled={saving || !paymentsValue || Number(paymentsValue) <= 0}
          className="w-full bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-40 text-white font-bold py-3.5 rounded-xl text-sm transition-all duration-150 hover:shadow-[0_0_20px_rgba(255,107,0,0.4)]"
        >
          {saving ? "Logging..." : "🔥 Log My Win"}
        </button>
      </form>

      {/* Patience message */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-4">
        <p className="text-white font-semibold text-sm mb-1">Stay patient. Stay consistent.</p>
        <p className="text-[#666] text-xs leading-relaxed">
          Results come from showing up every day. Every payment you log gets added to the community total above.
        </p>
      </div>

      {/* Leaderboard */}
      <div className="bg-[#0d0d0d] border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8">
          <h3 className="text-white font-bold text-sm">🏆 Top Earners</h3>
          <p className="text-[#555] text-xs mt-0.5">Students who are putting in the work.</p>
        </div>
        {leaderboard.length === 0 ? (
          <p className="text-[#555] text-sm text-center py-8">No wins logged yet — be the first.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {leaderboard.map((entry) => (
              <div key={entry.rank} className={`flex items-center gap-3 px-5 py-3.5 ${entry.isMe ? 'bg-[#FF6B00]/5' : ''}`}>
                <span className={`text-sm font-black w-7 text-center flex-shrink-0 ${
                  entry.rank === 1 ? 'text-yellow-400' :
                  entry.rank === 2 ? 'text-[#aaa]' :
                  entry.rank === 3 ? 'text-amber-600' : 'text-[#555]'
                }`}>
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${entry.isMe ? 'text-[#FF6B00]' : 'text-white'}`}>
                    {entry.name}{entry.isMe ? ' (you)' : ''}
                  </p>
                  <p className="text-[#555] text-xs">{entry.payments} payment{entry.payments !== 1 ? 's' : ''}</p>
                </div>
                <p className="text-[#FF6B00] font-bold text-sm flex-shrink-0">R{entry.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My win history */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-[#444] font-semibold">My Wins</p>
          {visibleEntries.map((entry) => (
            <div key={entry.id} className="bg-[#0d0d0d] border border-white/8 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔥</span>
                <div>
                  <p className="text-white font-semibold text-sm">R{entry.paymentsValue.toLocaleString()}</p>
                  {entry.notes
                    ? <p className="text-[#888] text-xs mt-0.5">{entry.notes}</p>
                    : <p className="text-[#555] text-xs mt-0.5">{formatEntryDate(entry.createdAt)}</p>
                  }
                </div>
              </div>
              <p className="text-[#555] text-xs flex-shrink-0">{formatEntryDate(entry.createdAt)}</p>
            </div>
          ))}
          {entries.length > 10 && !showAll && (
            <button onClick={() => setShowAll(true)} className="w-full text-sm text-[#888] hover:text-white border border-white/8 hover:border-white/16 rounded-xl py-3 transition-colors duration-150">
              Show more ({entries.length - 10} more)
            </button>
          )}
        </div>
      )}
    </div>
  )
}
