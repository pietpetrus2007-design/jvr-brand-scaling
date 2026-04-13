"use client"

import { useState, useEffect, useRef } from "react"
import { TIER_ORDER, UPGRADE_LINKS } from "@/lib/utils"

interface Message {
  id: string
  content: string
  createdAt: string
  room: string
  targetUserId?: string | null
  user: { id: string; name: string; tier: string }
}

interface Room {
  id: string
  label: string
  icon: string
  minTier: "basic" | "community" | "mentorship"
}

const ROOMS: Room[] = [
  { id: "wins", label: "Wins & Results", icon: "🏆", minTier: "basic" },
  { id: "chatting", label: "Just Chatting", icon: "💬", minTier: "community" },
  { id: "qa", label: "Q&A", icon: "❓", minTier: "community" },
  { id: "private", label: "1-on-1 with JvR", icon: "👤", minTier: "mentorship" },
]

const TIER_COLORS: Record<string, string> = {
  basic: "bg-white/10 text-white",
  community: "bg-blue-500/20 text-blue-400",
  mentorship: "bg-[#FF6B00]/20 text-[#FF6B00]",
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

interface Props {
  userId: string
  userName: string
  userTier: string
  userRole: string
}

export default function CommunityView({ userId, userName, userTier, userRole }: Props) {
  const [activeRoom, setActiveRoom] = useState("wins")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const userTierLevel = TIER_ORDER[userTier as keyof typeof TIER_ORDER] ?? 0
  const isAdmin = userRole === "admin"

  function canAccess(room: Room) {
    if (isAdmin) return true
    return userTierLevel >= TIER_ORDER[room.minTier]
  }

  function getUpgradeLink(room: Room) {
    if (room.minTier === "community") return UPGRADE_LINKS[userTier]?.community || UPGRADE_LINKS.basic.community
    if (room.minTier === "mentorship") return UPGRADE_LINKS[userTier]?.mentorship || UPGRADE_LINKS.basic.mentorship
    return null
  }

  async function fetchMessages() {
    try {
      const res = await fetch(`/api/messages?room=${activeRoom}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch {}
  }

  useEffect(() => {
    const current = ROOMS.find((r) => r.id === activeRoom)
    if (!current || !canAccess(current)) return
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [activeRoom])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim(), room: activeRoom }),
    })
    setInput("")
    setSending(false)
    fetchMessages()
  }

  const currentRoom = ROOMS.find((r) => r.id === activeRoom)!
  const hasAccess = canAccess(currentRoom)

  // Group private messages by student for admin view
  const groupedPrivate = activeRoom === "private" && isAdmin
    ? messages.reduce((acc, msg) => {
        const key = msg.user.id === userId ? (msg.targetUserId || "unknown") : msg.user.id
        if (!acc[key]) acc[key] = []
        acc[key].push(msg)
        return acc
      }, {} as Record<string, Message[]>)
    : null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 h-[calc(100vh-56px)]">
      {/* Sidebar */}
      <aside className="md:w-56 flex-shrink-0">
        <h2 className="text-xs uppercase tracking-widest text-[#555] font-semibold mb-3">Rooms</h2>
        <div className="space-y-1">
          {ROOMS.map((room) => {
            const accessible = canAccess(room)
            return (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2.5 transition-colors ${
                  activeRoom === room.id
                    ? "bg-[#FF6B00]/10 text-white border border-[#FF6B00]/30"
                    : accessible
                    ? "text-[#888] hover:bg-white/5 hover:text-white"
                    : "text-[#444] cursor-not-allowed"
                }`}
              >
                <span>{room.icon}</span>
                <span className="flex-1 truncate">{room.label}</span>
                {!accessible && <span className="text-[#444]">🔒</span>}
              </button>
            )
          })}
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-h-0 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2">
          <span className="text-lg">{currentRoom.icon}</span>
          <span className="text-white font-semibold text-sm">{currentRoom.label}</span>
        </div>

        {!hasAccess ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <span className="text-4xl">🔒</span>
            <div>
              <p className="text-white font-semibold">This room requires a higher tier</p>
              <p className="text-[#888] text-sm mt-1">Upgrade to unlock {currentRoom.label}</p>
            </div>
            {getUpgradeLink(currentRoom) && (
              <a
                href={getUpgradeLink(currentRoom)!}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                Upgrade Now
              </a>
            )}
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-center text-[#555] text-sm pt-8">No messages yet. Be the first!</p>
              )}
              {groupedPrivate ? (
                Object.entries(groupedPrivate).map(([studentId, msgs]) => {
                  const student = msgs.find((m) => m.user.id !== userId)?.user || msgs[0].user
                  return (
                    <div key={studentId} className="mb-6">
                      <p className="text-xs text-[#555] mb-2 font-semibold">Thread with {student.name}</p>
                      {msgs.map((msg) => (
                        <MessageItem key={msg.id} msg={msg} currentUserId={userId} />
                      ))}
                    </div>
                  )
                })
              ) : (
                messages.map((msg) => <MessageItem key={msg.id} msg={msg} currentUserId={userId} />)
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3 border-t border-white/10 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message #${currentRoom.label.toLowerCase()}...`}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF6B00] transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function MessageItem({ msg, currentUserId }: { msg: Message; currentUserId: string }) {
  const isOwn = msg.user.id === currentUserId
  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
      <div className="w-7 h-7 rounded-full bg-[#FF6B00]/20 flex items-center justify-center text-xs font-bold text-[#FF6B00] flex-shrink-0">
        {msg.user.name.charAt(0).toUpperCase()}
      </div>
      <div className={`max-w-[70%] space-y-1 ${isOwn ? "items-end flex flex-col" : ""}`}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white font-medium">{msg.user.name}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${TIER_COLORS[msg.user.tier] || "bg-white/10 text-white"}`}>
            {msg.user.tier}
          </span>
          <span className="text-xs text-[#555]">{formatTime(msg.createdAt)}</span>
        </div>
        <div className={`text-sm rounded-xl px-3 py-2 ${isOwn ? "bg-[#FF6B00]/20 text-white" : "bg-white/10 text-white"}`}>
          {msg.content}
        </div>
      </div>
    </div>
  )
}
