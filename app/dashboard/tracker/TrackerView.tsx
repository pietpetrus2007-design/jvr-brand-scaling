"use client"

import { useState } from "react"

interface ProgressEntry {
  id: string
  businessesOutreached: number
  conversationsStarted: number
  potentialClients: number
  activeClients: number
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
  businessesOutreached: "",
  conversationsStarted: "",
  potentialClients: "",
  activeClients: "",
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
  const yest = new Date(now)
  yest.setDate(yest.getDate() - 1)
  if (d.toDateString() === now.toDateString()) return "Today"
  if (d.toDateString() === yest.toDateString()) return "Yesterday"
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })
}

const inputCls =
  "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF6B00] transition-colors duration-150"

function Section({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0d0d0d] border border-white/8 rounded-2xl p-5 space-y-4">
      <h3 className="text-[#FF6B00] font-bold text-sm tracking-wide uppercase">
        {emoji} {title}
      </h3>
      {children}
    </div>
  )
}

function NumField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-[#888] font-medium">{label}</label>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
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
  const [showAll, setShowAll] = useState(false)

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
        businessesOutreached: Number(form.businessesOutreached) || 0,
        conversationsStarted: Number(form.conversationsStarted) || 0,
        potentialClients: Number(form.potentialClients) || 0,
        activeClients: Number(form.activeClients) || 0,
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

  const totalOutreached = entries.reduce((s, e) => s + e.businessesOutreached, 0)
  const totalActiveClients = entries.reduce((s, e) => s + e.activeClients, 0)
  const totalRevenue = entries.reduce((s, e) => s + e.paymentsValue, 0)

  const visibleEntries = showAll ? entries : entries.slice(0, 10)

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
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Progress Tracker</h1>
        <p className="text-[#888] text-sm mt-1">Log your daily outreach and client activity.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Section emoji="🎯" title="Outreach">
          <NumField
            label="Businesses Outreached"
            value={form.businessesOutreached}
            onChange={(v) => setField("businessesOutreached", v)}
          />
        </Section>

        <Section emoji="💬" title="Pipeline">
          <NumField
            label="Conversations Started"
            value={form.conversationsStarted}
            onChange={(v) => setField("conversationsStarted", v)}
          />
          <NumField
            label="Potential Clients"
            value={form.potentialClients}
            onChange={(v) => setField("potentialClients", v)}
          />
          <NumField
            label="Active Clients"
            value={form.activeClients}
            onChange={(v) => setField("activeClients", v)}
          />
        </Section>

        <Section emoji="💰" title="Revenue">
          <NumField
            label="Payments Received"
            value={form.paymentsReceived}
            onChange={(v) => setField("paymentsReceived", v)}
          />
          <div className="space-y-1">
            <label className="text-xs text-[#888] font-medium">Total Revenue (R)</label>
            <input
              type="text"
              inputMode="decimal"
              value={form.paymentsValue}
              onChange={(e) => setField("paymentsValue", e.target.value)}
              className={inputCls}
              placeholder="0"
            />
          </div>
        </Section>

        <Section emoji="🧠" title="Mindset">
          <div className="space-y-3">
            <label className="text-xs text-[#888] font-medium">
              How are you feeling?{" "}
              <span className="text-xl align-middle">{moodEmoji(form.moodScore)}</span>{" "}
              <span className="text-white font-bold">{form.moodScore}/10</span>
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
              <span>1 😔</span>
              <span>🔥 10</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[#888] font-medium">Notes (optional)</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              className={`${inputCls} resize-none`}
              placeholder="Any extra notes for today..."
            />
          </div>
        </Section>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-colors duration-150"
        >
          {saving ? "Saving..." : "Save Progress Entry"}
        </button>

        {saved && (
          <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-semibold py-1">
            <span className="text-lg">✅</span> Entry saved!
          </div>
        )}
      </form>

      {/* History */}
      <div className="space-y-4">
        {entries.length > 0 && (
          <div className="bg-[#0d0d0d] border border-white/8 rounded-2xl px-5 py-4 text-sm text-[#888]">
            All time —{" "}
            <span className="text-white font-semibold">{totalOutreached}</span> outreached{" "}
            <span className="text-white/30 mx-1">|</span>{" "}
            <span className="text-white font-semibold">{totalActiveClients}</span> active clients{" "}
            <span className="text-white/30 mx-1">|</span>{" "}
            <span className="text-[#FF6B00] font-semibold">R{totalRevenue.toLocaleString()}</span> revenue
          </div>
        )}

        {entries.length === 0 ? (
          <p className="text-[#555] text-sm text-center py-10">No entries yet. Log your first day above!</p>
        ) : (
          <>
            {visibleEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-[#0d0d0d] border border-white/8 rounded-2xl p-5 space-y-3 hover:border-white/12 transition-colors duration-150"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold text-sm">{formatEntryDate(entry.createdAt)}</span>
                  <span className="text-lg" title={`Mood: ${entry.moodScore}/10`}>
                    {moodEmoji(entry.moodScore)}{" "}
                    <span className="text-xs text-[#888] align-middle">{entry.moodScore}/10</span>
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    ["Outreached", entry.businessesOutreached],
                    ["Active Clients", entry.activeClients],
                    ["Payments", entry.paymentsReceived],
                    ["Revenue", `R${entry.paymentsValue.toLocaleString()}`],
                  ].map(([label, val]) => (
                    <div key={label as string} className="bg-white/4 rounded-xl py-2.5 px-1">
                      <p className="text-[#FF6B00] font-bold text-sm">{val}</p>
                      <p className="text-[#555] text-xs mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
                {entry.notes && (
                  <p className="text-[#888] text-xs border-t border-white/5 pt-3">{entry.notes}</p>
                )}
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
          </>
        )}
      </div>
    </div>
  )
}
