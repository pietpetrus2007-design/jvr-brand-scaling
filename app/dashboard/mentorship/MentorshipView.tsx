"use client"
import { useState } from "react"

interface CallRequest {
  id: string
  topic: string
  message: string
  preferredTime: string
  status: string
  createdAt: string
}

interface Props {
  initialRequests: CallRequest[]
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  done: "bg-green-500/15 text-green-400 border-green-500/30",
}

export default function MentorshipView({ initialRequests }: Props) {
  const [requests, setRequests] = useState<CallRequest[]>(initialRequests)
  const [topic, setTopic] = useState("")
  const [message, setMessage] = useState("")
  const [preferredTime, setPreferredTime] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!topic.trim() || !message.trim() || !preferredTime.trim()) return
    setSending(true)
    setError("")
    try {
      const res = await fetch("/api/mentorship/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, message, preferredTime })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Something went wrong"); setSending(false); return }
      setRequests(prev => [data.request, ...prev])
      setTopic(""); setMessage(""); setPreferredTime("")
      setSent(true)
      setTimeout(() => setSent(false), 4000)
    } catch {
      setError("Failed to submit. Try again.")
    }
    setSending(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-white font-black text-2xl">🎯 Your Mentorship</h1>
        <p className="text-[#888] text-sm mt-1">You have direct access to JvR. Use it.</p>
      </div>

      {/* What's included */}
      <div className="bg-[#FF6B00]/8 border border-[#FF6B00]/20 rounded-2xl p-5 space-y-3">
        <h2 className="text-white font-bold text-sm uppercase tracking-widest text-[#FF6B00]">What's Included</h2>
        <ul className="space-y-2 text-sm text-[#ccc]">
          <li className="flex items-start gap-2"><span className="text-[#FF6B00] mt-0.5">✓</span> Full course access (Part 1, 2 & 3)</li>
          <li className="flex items-start gap-2"><span className="text-[#FF6B00] mt-0.5">✓</span> Community chat rooms (Wins, Q&A, Just Chatting)</li>
          <li className="flex items-start gap-2"><span className="text-[#FF6B00] mt-0.5">✓</span> AI assistant — lesson Q&A and general help</li>
          <li className="flex items-start gap-2"><span className="text-[#FF6B00] mt-0.5">✓</span> Group calls with JvR</li>
          <li className="flex items-start gap-2"><span className="text-[#FF6B00] mt-0.5">✓</span> 1-on-1 chat with JvR</li>
          <li className="flex items-start gap-2"><span className="text-[#FF6B00] mt-0.5">✓</span> Private call requests — get direct time with JvR</li>
        </ul>
      </div>

      {/* Request a call */}
      <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-5">
        <h2 className="text-white font-bold text-base mb-1">Request a Private Call</h2>
        <p className="text-[#888] text-sm mb-5">Tell JvR what you need help with and when works for you.</p>

        {sent && (
          <div className="mb-4 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm font-medium">
            ✓ Request sent — JvR will get back to you shortly.
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-[#888] text-xs font-semibold uppercase tracking-widest mb-1.5 block">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Struggling with getting replies on outreach"
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] outline-none focus:border-[#FF6B00]/50 transition-colors"
              style={{ fontSize: '16px' }}
            />
          </div>
          <div>
            <label className="text-[#888] text-xs font-semibold uppercase tracking-widest mb-1.5 block">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Give JvR some context about where you're at and what you need..."
              rows={4}
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] outline-none focus:border-[#FF6B00]/50 transition-colors resize-none"
              style={{ fontSize: '16px' }}
            />
          </div>
          <div>
            <label className="text-[#888] text-xs font-semibold uppercase tracking-widest mb-1.5 block">Preferred Time</label>
            <input
              type="text"
              value={preferredTime}
              onChange={e => setPreferredTime(e.target.value)}
              placeholder="e.g. Weekday mornings, or Saturday afternoon"
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] outline-none focus:border-[#FF6B00]/50 transition-colors"
              style={{ fontSize: '16px' }}
            />
          </div>
          <button
            type="submit"
            disabled={sending || !topic.trim() || !message.trim() || !preferredTime.trim()}
            className="w-full bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-40 text-white font-bold py-3 rounded-xl text-sm transition-colors"
          >
            {sending ? "Sending..." : "Request Call →"}
          </button>
        </form>
      </div>

      {/* Past requests */}
      {requests.length > 0 && (
        <div>
          <h2 className="text-white font-bold text-sm mb-3">Your Requests</h2>
          <div className="space-y-3">
            {requests.map(r => (
              <div key={r.id} className="bg-[#0a0a0a] border border-white/8 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="text-white text-sm font-semibold">{r.topic}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold capitalize flex-shrink-0 ${STATUS_STYLES[r.status] || STATUS_STYLES.pending}`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-[#888] text-xs mb-1">{r.message}</p>
                <p className="text-[#555] text-xs">⏰ {r.preferredTime}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
