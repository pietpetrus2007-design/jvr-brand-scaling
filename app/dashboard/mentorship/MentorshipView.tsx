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
      {isAdmin ? (
        <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-5 flex items-center gap-3">
          <span className="text-2xl">👤</span>
          <div>
            <p className="text-white font-bold text-sm">1-on-1 Student Chats</p>
            <p className="text-[#888] text-xs mt-0.5">Manage all private student conversations in the <a href="/dashboard/community" className="text-[#FF6B00] underline">Community page</a> → 1-on-1 with JvR room.</p>
          </div>
        </div>
      ) : (
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
      )}

      {/* Upcoming Calls */}
      <div>
        <h2 className="text-white font-bold text-base mb-3">📞 Your Upcoming Calls</h2>
        {requests.filter(r => r.status === 'confirmed').length === 0 ? (
          <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-5 text-center">
            <p className="text-[#555] text-sm">No upcoming calls scheduled.</p>
            <p className="text-[#444] text-xs mt-2">DM JvR directly in the <span className="text-[#FF6B00]">1-on-1 chat above</span> to book a call.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.filter(r => r.status === 'confirmed').map(r => (
              <div key={r.id} className="bg-[#0a0a0a] border border-[#FF6B00]/30 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="text-white text-sm font-semibold">{r.topic}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full border font-semibold capitalize flex-shrink-0 bg-blue-500/15 text-blue-400 border-blue-500/30">
                    Confirmed
                  </span>
                </div>
                <p className="text-[#888] text-xs mb-1">{r.message}</p>
                <p className="text-[#555] text-xs">⏰ {r.preferredTime}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
