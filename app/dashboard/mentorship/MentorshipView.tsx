"use client"
import { useState, useEffect, useRef } from "react"

interface CallRequest {
  id: string
  topic: string
  message: string
  preferredTime: string
  status: string
  createdAt: string
}

interface Message {
  id: string
  content: string
  imageUrl?: string | null
  createdAt: string
  room: string
  targetUserId?: string | null
  user: { id: string; name: string; tier: string; role?: string }
}

interface Props {
  initialRequests: CallRequest[]
  userId: string
  userName: string
  userTier: string
  userRole: string
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  done: "bg-green-500/15 text-green-400 border-green-500/30",
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function MentorshipView({ initialRequests, userId, userName, userTier, userRole }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [chatInput, setChatInput] = useState("")
  const [chatSending, setChatSending] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const isAdmin = userRole === "admin"

  async function fetchMessages() {
    try {
      const res = await fetch(`/api/messages?room=private`)
      if (res.ok) {
        const data = await res.json()
        // For non-admin: only show messages to/from this user
        if (!isAdmin) {
          setMessages(data.filter((m: Message) =>
            m.user.id === userId || m.targetUserId === userId
          ))
        } else {
          setMessages(data)
        }
      }
    } catch {}
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function clearImage() {
    setImagePreview(null)
    setImageFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function sendChatMessage(e: React.FormEvent) {
    e.preventDefault()
    if ((!chatInput.trim() && !imageFile) || chatSending) return
    setChatSending(true)

    let uploadedUrl: string | null = null
    if (imageFile) {
      setUploading(true)
      const fd = new FormData()
      fd.append("file", imageFile)
      fd.append("upload_preset", "jvr_community")
      const res = await fetch("https://api.cloudinary.com/v1_1/dwnfccsje/image/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok && data.secure_url) uploadedUrl = data.secure_url
      setUploading(false)
    }

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: chatInput.trim(), room: "private", imageUrl: uploadedUrl }),
    })
    setChatInput("")
    clearImage()
    setChatSending(false)
    fetchMessages()
  }
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

      {/* 1-on-1 Chat */}
      <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl overflow-hidden flex flex-col" style={{ height: '420px' }}>
        <div className="px-4 py-3 border-b border-white/8 flex items-center gap-2">
          <span className="text-base">👤</span>
          <span className="text-white font-bold text-sm">1-on-1 with JvR</span>
          <span className="ml-auto text-[#555] text-xs">Private</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-[#555] text-sm py-8">No messages yet. Say hello 👋</div>
          )}
          {messages.map((msg) => {
            const isMe = msg.user.id === userId
            return (
              <div key={msg.id} className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
                <div className="w-7 h-7 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/30 flex items-center justify-center text-[#FF6B00] text-xs font-bold flex-shrink-0">
                  {msg.user.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div className={`rounded-2xl px-3 py-2 text-sm ${
                    isMe ? "bg-[#FF6B00] text-white" : "bg-[#111] text-white border border-white/8"
                  }`}>
                    {msg.content && <p>{msg.content}</p>}
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="" className="rounded-lg max-w-full mt-1" style={{ maxHeight: 200 }} />
                    )}
                  </div>
                  <span className="text-[#555] text-xs px-1">{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendChatMessage} className="px-4 py-3 border-t border-white/8">
          {imagePreview && (
            <div className="mb-2 relative inline-block">
              <img src={imagePreview} alt="" className="h-16 w-16 object-cover rounded-lg border border-white/10" />
              <button type="button" onClick={clearImage} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">×</button>
            </div>
          )}
          <div className="flex gap-2 items-end">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[#555] hover:text-[#888] transition-colors text-lg pb-0.5">📎</button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Message JvR..."
              className="flex-1 bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] outline-none focus:border-[#FF6B00]/50 transition-colors"
              style={{ fontSize: '16px' }}
            />
            <button
              type="submit"
              disabled={chatSending || uploading || (!chatInput.trim() && !imageFile)}
              className="bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-40 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              {chatSending || uploading ? "..." : "→"}
            </button>
          </div>
        </form>
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
