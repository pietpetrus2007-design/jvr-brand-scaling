"use client"

import { useState } from "react"

interface ProgressEntry {
  id: string
  dmsSent: number
  whatsappsSent: number
  emailsSent: number
  coldCalls: number
  replies: number
  pendingClients: number
  clientsAcquired: number
  paymentsReceived: number
  paymentsValue: number
  moodScore: number
  notes: string | null
  createdAt: string
}

interface Props {
  unlocked: boolean
  completionPct: number
  initialEntries: ProgressEntry[]
}

const EMPTY_FORM = {
  dmsSent: "",
  whatsappsSent: "",
  emailsSent: "",
  coldCalls: "",
  replies: "",
  pendingClients: "",
  clientsAcquired: "",
  paymentsReceived: "",
  paymentsValue: "",
  moodScore: 7,
  notes: "",
}

function moodEmoji(score: number) {
  if (score <= 3) return "😔"
  if (score <= 6) return "😐"
  if (score <= 8) return "😊"
  return "🔥"
}

function formatEntryDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const todayStr = now.toDateString()
  const yest = new Date(now); yest.setDate(yest.getDate() - 1)
  if (d.toDateString() === todayStr) return "Today"
  if (d.toDateString() === yest.toDateString()) return "Yesterday"
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })
}

function numInput(label: string, key: string, value: string, onChange: (k: string, v: string) => void) {
  return (
    <div key={key} className="space-y-1">
      <label className="text-xs text-[#888] font-medium">{label}</label>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(key, e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF6B00] transition-colors duration-150"
        placeholder="0"
      />
    </div>
  )
}

export default function TrackerView({ unlocked, completionPct, initialEntries }: Props) {
  const [entries, setEntries] = useState<ProgressEntry[]>(initialEntries)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function setField(k: string, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch("/api/tracker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dmsSent: Number(form.dmsSent) || 0,
        whatsappsSent: Number(form.whatsappsSent) || 0,
        emailsSent: Number(form.emailsSent) || 0,
        coldCalls: Number(form.coldCalls) || 0,
        replies: Number(form.replies) || 0,
        pendingClients: Number(form.pendingClients) || 0,
        clientsAcquired: Number(form.clientsAcquired) || 0,
        paymentsReceived: Number(form.paymentsReceived) || 0,
        paymentsValue: Number(form.paymentsValue) || 0,
        moodScore: form.moodScore,
        notes: form.notes,
      }),
    })
    if (res.ok) {
      const entry = await res.json()
      setEntries((prev) => [entry, ...prev])
      setForm(EMPTY_FORM)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  // Totals
  const totalDms = entries.reduce((s, e) => s + e.dmsSent, 0)
  const totalClients = entries.reduce((s, e) => s + e.clientsAcquired, 0)
  const totalRevenue = entries.reduce((s, e) => s + e.paymentsValue, 0)

  if (!unlocked) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-3xl">
          🔒
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Progress Tracker — Locked</h1>
          <p className="text-[#888] mt-2 text-sm">
            Complete the full course to unlock your personal progress tracker.
          </p>
        </div>
        <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#888]">Course progress</span>
            <span className="text-white font-bold">{completionPct}%</span>
          </div>
          <div className="w-full bg-white/8 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-[#FF6B00] transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <p className="text-[#888] text-xs pt-1">
            Keep going! You&apos;re {completionPct}% through the course.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Progress Tracker</h1>
        <p className="text-[#888] text-sm mt-1">Log your daily outreach and client activity.</p>
      </div>

      {/* Log form */}
      <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-6 space-y-6">
        <h2 className="text-white font-bold">Log Your Progress</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {numInput("Social Media DMs Sent", "dmsSent", form.dmsSent, setField)}
          {numInput("WhatsApp Messages Sent", "whatsappsSent", form.whatsappsSent, setField)}
          {numInput("Emails Sent", "emailsSent", form.emailsSent, setField)}
          {numInput("Cold Calls Made", "coldCalls", form.coldCalls, setField)}
          {numInput("Replies Received", "replies", form.replies, setField)}
          {numInput("Pending Clients", "pendingClients", form.pendingClients, setField)}
          {numInput("Clients Acquired", "clientsAcquired", form.clientsAcquired, setField)}
          {numInput("Payments Received (count)", "paymentsReceived", form.paymentsReceived, setField)}
          <div className="space-y-1">
            <label className="text-xs text-[#888] font-medium">Payment Value (R)</label>
            <input
              type="text"
              inputMode="decimal"
              value={form.paymentsValue}
              onChange={(e) => setField("paymentsValue", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF6B00] transition-colors duration-150"
              placeholder="0"
            />
          </div>
        </div>

        {/* Mood slider */}
        <div className="space-y-2">
          <label className="text-xs text-[#888] font-medium">
            How are you feeling? {moodEmoji(form.moodScore)} {form.moodScore}/10
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={form.moodScore}
            onChange={(e) => setForm((p) => ({ ...p, moodScore: Number(e.target.value) }))}
            className="w-full accent-[#FF6B00]"
          />
          <div className="flex justify-between text-xs text-[#555]">
            <span>😔 1</span>
            <span>10 🔥</span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs text-[#888] font-medium">Notes (optional)</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF6B00] transition-colors duration-150 resize-none"
            placeholder="Any extra notes for today..."
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors duration-150"
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save Entry"}
        </button>
      </form>

      {/* History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-white font-bold">Your History</h2>
          {entries.length > 0 && (
            <p className="text-xs text-[#888]">
              Total:{" "}
              <span className="text-white font-semibold">{totalDms} DMs</span>
              {" | "}
              <span className="text-white font-semibold">{totalClients} clients</span>
              {" | "}
              <span className="text-[#FF6B00] font-semibold">R{totalRevenue.toLocaleString()}</span>
              {" "}revenue
            </p>
          )}
        </div>

        {entries.length === 0 ? (
          <p className="text-[#555] text-sm text-center py-10">No entries yet. Log your first day above!</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-5 space-y-3 hover:border-white/12 transition-colors duration-150">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold text-sm">{formatEntryDate(entry.createdAt)}</span>
                <span className="text-lg" title={`Mood: ${entry.moodScore}/10`}>
                  {moodEmoji(entry.moodScore)}{" "}
                  <span className="text-xs text-[#888] align-middle">{entry.moodScore}/10</span>
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center">
                {[
                  ["DMs", entry.dmsSent],
                  ["WA", entry.whatsappsSent],
                  ["Email", entry.emailsSent],
                  ["Calls", entry.coldCalls],
                  ["Replies", entry.replies],
                  ["Clients", entry.clientsAcquired],
                  ["Revenue", `R${entry.paymentsValue.toLocaleString()}`],
                ].map(([label, val]) => (
                  <div key={label as string} className="bg-white/4 rounded-xl py-2 px-1">
                    <p className="text-[#FF6B00] font-bold text-sm">{val}</p>
                    <p className="text-[#555] text-xs mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              {entry.notes && (
                <p className="text-[#888] text-xs border-t border-white/5 pt-3">{entry.notes}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
