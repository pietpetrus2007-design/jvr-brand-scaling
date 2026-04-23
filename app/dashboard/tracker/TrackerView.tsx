"use client"

import { useState } from "react"

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

const inputCls =
  "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF6B00] transition-colors duration-150"

export default function TrackerView({ unlocked, completionPct, initialEntries, leaderboard, communityRevenue, communityPayments }: Props) {
  const [entries, setEntries] = useState<ProgressEntry[]>(initialEntries)
  const [paymentsReceived, setPaymentsReceived] = useState("")
  const [paymentsValue, setPaymentsValue] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showAll, setShowAll] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch("/api/tracker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessesOutreached: 0,
        conversationsStarted: 0,
        potentialClients: 0,
        activeClients: 0,
        paymentsReceived: Number(paymentsReceived) || 0,
        paymentsValue: Number(paymentsValue) || 0,
        moodScore: 7,
        notes,
      }),
    })
    if (res.ok) {
      const entry = await res.json()
      setEntries((prev) => [entry, ...prev])
      setPaymentsReceived("")
      setPaymentsValue("")
      setNotes("")
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  const totalRevenue = entries.reduce((s, e) => s + e.paymentsValue, 0)
  const totalPayments = entries.reduce((s, e) => s + e.paymentsReceived, 0)
  const visibleEntries = showAll ? entries : entries.slice(0, 10)

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Revenue Tracker</h1>
        <p className="text-[#888] text-sm mt-1">Track your payments and total revenue over time.</p>
      </div>

      {/* Patience message */}
      <div className="bg-[#FF6B00]/8 border border-[#FF6B00]/20 rounded-2xl p-5">
        <p className="text-[#FF6B00] font-bold text-sm mb-1">Stay patient. Stay consistent.</p>
        <p className="text-[#aaa] text-sm leading-relaxed">
          Results don't come from one big effort — they come from showing up every day and doing the work. Keep outreaching. Keep following up. Every payment you log gets added to the community leaderboard.
        </p>
      </div>

      {/* Totals */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0d0d0d] border border-white/8 rounded-2xl p-5 text-center">
            <p className="text-[#FF6B00] font-black text-3xl">R{totalRevenue.toLocaleString()}</p>
            <p className="text-[#888] text-xs mt-1">Total Revenue</p>
          </div>
          <div className="bg-[#0d0d0d] border border-white/8 rounded-2xl p-5 text-center">
            <p className="text-white font-black text-3xl">{totalPayments}</p>
            <p className="text-[#888] text-xs mt-1">Payments Received</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[#0d0d0d] border border-white/8 rounded-2xl p-5 space-y-4">
        <h3 className="text-white font-bold text-sm">Log a Payment</h3>
        <div className="space-y-1">
          <label className="text-xs text-[#888] font-medium">Number of Payments Received</label>
          <input
            type="number"
            min="0"
            value={paymentsReceived}
            onChange={(e) => setPaymentsReceived(e.target.value)}
            className={inputCls}
            placeholder="0"
            style={{ fontSize: '16px' }}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[#888] font-medium">Revenue Amount (R)</label>
          <input
            type="number"
            min="0"
            value={paymentsValue}
            onChange={(e) => setPaymentsValue(e.target.value)}
            className={inputCls}
            placeholder="0"
            style={{ fontSize: '16px' }}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[#888] font-medium">Notes (optional)</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputCls} resize-none`}
            placeholder="e.g. First client from Instagram outreach"
            style={{ fontSize: '16px' }}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-colors duration-150"
        >
          {saving ? "Saving..." : "Log Payment"}
        </button>
        {saved && (
          <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-semibold py-1">
            <span className="text-lg">✅</span> Logged!
          </div>
        )}
      </form>

      {/* Community Leaderboard */}
      <div className="bg-[#0d0d0d] border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-sm">🏆 Community Leaderboard</h3>
            <p className="text-[#555] text-xs mt-0.5">Every payment logged counts toward the total.</p>
          </div>
        </div>
        {/* Community totals */}
        <div className="grid grid-cols-2 border-b border-white/8">
          <div className="px-5 py-4 text-center border-r border-white/8">
            <p className="text-[#FF6B00] font-black text-2xl">R{communityRevenue.toLocaleString()}</p>
            <p className="text-[#555] text-xs mt-0.5">Total Community Revenue</p>
          </div>
          <div className="px-5 py-4 text-center">
            <p className="text-white font-black text-2xl">{communityPayments}</p>
            <p className="text-[#555] text-xs mt-0.5">Total Payments</p>
          </div>
        </div>
        {/* Top earners */}
        {leaderboard.length === 0 ? (
          <p className="text-[#555] text-sm text-center py-6">No payments logged yet — be the first.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {leaderboard.map((entry) => (
              <div key={entry.rank} className={`flex items-center gap-3 px-5 py-3.5 ${entry.isMe ? 'bg-[#FF6B00]/5' : ''}`}>
                <span className={`text-sm font-black w-6 text-center flex-shrink-0 ${
                  entry.rank === 1 ? 'text-yellow-400' :
                  entry.rank === 2 ? 'text-[#aaa]' :
                  entry.rank === 3 ? 'text-amber-600' : 'text-[#444]'
                }`}>
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${entry.isMe ? 'text-[#FF6B00]' : 'text-white'}`}>
                    {entry.name} {entry.isMe && <span className="text-xs font-normal text-[#FF6B00]">(you)</span>}
                  </p>
                  <p className="text-[#555] text-xs">{entry.payments} payment{entry.payments !== 1 ? 's' : ''}</p>
                </div>
                <p className="text-[#FF6B00] font-bold text-sm flex-shrink-0">R{entry.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      {entries.length === 0 ? (
        <p className="text-[#555] text-sm text-center py-10">No payments logged yet. Your first one is coming.</p>
      ) : (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-[#444] font-semibold">History</p>
          {visibleEntries.map((entry) => (
            <div key={entry.id} className="bg-[#0d0d0d] border border-white/8 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-white font-semibold text-sm">{formatEntryDate(entry.createdAt)}</p>
                {entry.notes && <p className="text-[#888] text-xs mt-0.5">{entry.notes}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[#FF6B00] font-bold text-sm">R{entry.paymentsValue.toLocaleString()}</p>
                <p className="text-[#555] text-xs">{entry.paymentsReceived} payment{entry.paymentsReceived !== 1 ? "s" : ""}</p>
              </div>
            </div>
          ))}
          {entries.length > 10 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full text-sm text-[#888] hover:text-white border border-white/8 hover:border-white/16 rounded-xl py-3 transition-colors duration-150"
            >
              Show more ({entries.length - 10} more)
            </button>
          )}
        </div>
      )}
    </div>
  )
}
