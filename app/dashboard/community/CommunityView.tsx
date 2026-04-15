"use client"

import { useState, useEffect, useRef } from "react"
import { TIER_ORDER, getUpgradeUrl } from "@/lib/utils"

interface Message {
  id: string
  content: string
  imageUrl?: string | null
  createdAt: string
  room: string
  targetUserId?: string | null
  user: { id: string; name: string; tier: string; role?: string }
}

interface StudentThread {
  id: string
  name: string
  tier: string
  lastMessage: string
  lastTime: string
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

const AVATAR_COLORS: Record<string, string> = {
  basic: "bg-[#888]/20 text-[#888] border-[#888]/30",
  community: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  mentorship: "bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30",
}

const TIER_BADGE: Record<string, string> = {
  basic: "bg-white/10 text-white",
  community: "bg-blue-500/15 text-blue-400",
  mentorship: "bg-[#FF6B00]/15 text-[#FF6B00]",
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

interface Props {
  userId: string
  userEmail?: string
  userName: string
  userTier: string
  userRole: string
}

export default function CommunityView({ userId, userName, userEmail, userTier, userRole }: Props) {
  const [activeRoom, setActiveRoom] = useState("wins")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [lastReadAt, setLastReadAt] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const userTierLevel = TIER_ORDER[userTier as keyof typeof TIER_ORDER] ?? 0
  const isAdmin = userRole === "admin"

  function canAccess(room: Room) {
    if (isAdmin) return true
    return userTierLevel >= TIER_ORDER[room.minTier]
  }

  function getUpgradeLink(room: Room) {
    if (room.minTier === "community") return getUpgradeUrl(userTier, 'community', userEmail)
    if (room.minTier === "mentorship") return getUpgradeUrl(userTier, 'mentorship', userEmail)
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

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if ((!input.trim() && !imageFile) || sending) return
    setSending(true)

    let uploadedUrl: string | null = null
    if (imageFile) {
      setUploading(true)
      const fd = new FormData()
      fd.append("file", imageFile)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (res.ok) {
        const data = await res.json()
        uploadedUrl = data.url
      }
      setUploading(false)
    }

    const targetUserId = isAdmin && activeRoom === "private" && selectedStudentId ? selectedStudentId : undefined

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim(), room: activeRoom, imageUrl: uploadedUrl, targetUserId }),
    })
    setInput("")
    clearImage()
    setSending(false)
    fetchMessages()
  }

  const currentRoom = ROOMS.find((r) => r.id === activeRoom)!
  const hasAccess = canAccess(currentRoom)

  const isAdminPrivate = isAdmin && activeRoom === "private"

  // Build student thread list for admin private view
  const studentThreads: StudentThread[] = isAdminPrivate
    ? Object.values(
        messages.reduce((acc, msg) => {
          const isStudentMsg = msg.user.id !== userId
          const studentId = isStudentMsg ? msg.user.id : (msg.targetUserId || null)
          if (!studentId) return acc
          const student = isStudentMsg ? msg.user : null
          const existing = acc[studentId]
          if (!existing) {
            acc[studentId] = {
              id: studentId,
              name: student?.name || "Unknown",
              tier: student?.tier || "basic",
              lastMessage: msg.content || (msg.imageUrl ? "📷 Image" : ""),
              lastTime: msg.createdAt,
            }
          } else {
            if (student) {
              existing.name = student.name
              existing.tier = student.tier
            }
            if (new Date(msg.createdAt) > new Date(existing.lastTime)) {
              existing.lastMessage = msg.content || (msg.imageUrl ? "📷 Image" : "")
              existing.lastTime = msg.createdAt
            }
          }
          return acc
        }, {} as Record<string, StudentThread>)
      ).sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime())
    : []

  // Filter messages for selected student thread
  const threadMessages = isAdminPrivate && selectedStudentId
    ? messages.filter(
        (msg) =>
          (msg.user.id === selectedStudentId) ||
          (msg.user.id === userId && msg.targetUserId === selectedStudentId)
      )
    : messages

  const selectedStudent = studentThreads.find((s) => s.id === selectedStudentId)

  function selectStudent(studentId: string) {
    setSelectedStudentId(studentId)
    setLastReadAt((prev) => ({ ...prev, [studentId]: new Date().toISOString() }))
  }

  function hasUnread(studentId: string): boolean {
    const readAt = lastReadAt[studentId]
    if (!readAt) return true
    return messages.some(
      (msg) => msg.user.id === studentId && new Date(msg.createdAt) > new Date(readAt)
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-5 h-[calc(100vh-56px)]">
      {/* Room sidebar */}
      <aside className="md:w-52 flex-shrink-0">
        <p className="text-xs uppercase tracking-widest text-[#444] font-semibold mb-3 px-1">Rooms</p>
        <div className="space-y-1">
          {ROOMS.map((room) => {
            const accessible = canAccess(room)
            const isActive = activeRoom === room.id
            return (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2.5 transition-all duration-150 ${
                  isActive
                    ? "bg-[#FF6B00]/12 text-white border border-[#FF6B00]/30 shadow-[0_0_15px_rgba(255,107,0,0.12)]"
                    : accessible
                    ? "text-[#888] hover:bg-white/5 hover:text-white"
                    : "text-[#444] cursor-not-allowed"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 w-0.5 h-full bg-[#FF6B00] rounded-r" />
                )}
                <span className="text-base">{room.icon}</span>
                <span className="flex-1 truncate font-medium">{room.label}</span>
                {!accessible && (
                  <svg className="w-3.5 h-3.5 text-[#444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a] border border-white/8 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/8 flex items-center gap-2.5">
          <span className="text-lg">{currentRoom.icon}</span>
          <span className="text-white font-bold text-sm">{currentRoom.label}</span>
        </div>

        {!hasAccess ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#555]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-lg">This room requires a higher tier</p>
              <p className="text-[#888] text-sm mt-1.5 max-w-xs mx-auto">
                Upgrade your access to unlock <span className="text-white">{currentRoom.label}</span> and connect with the community.
              </p>
            </div>
            {getUpgradeLink(currentRoom) && (
              <a
                href={getUpgradeLink(currentRoom)!}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-colors duration-150 shadow-[0_0_30px_rgba(255,107,0,0.35)]"
              >
                Upgrade Now →
              </a>
            )}
          </div>
        ) : isAdminPrivate ? (
          /* WhatsApp-style admin private view */
          <div className="flex flex-1 min-h-0">
            {/* Student list sidebar */}
            <div className="w-[200px] flex-shrink-0 border-r border-white/8 flex flex-col min-h-0">
              <p className="text-xs uppercase tracking-widest text-[#444] font-semibold px-3 py-2.5 border-b border-white/5">Students</p>
              <div className="flex-1 overflow-y-auto">
                {studentThreads.length === 0 ? (
                  <p className="text-[#555] text-xs text-center p-4">No conversations yet</p>
                ) : (
                  studentThreads.map((s) => {
                    const isSelected = selectedStudentId === s.id
                    const unread = hasUnread(s.id)
                    return (
                      <button
                        key={s.id}
                        onClick={() => selectStudent(s.id)}
                        className={`w-full text-left px-3 py-2.5 flex items-start gap-2 transition-all duration-150 border-l-2 ${
                          isSelected
                            ? "bg-[#FF6B00]/10 border-[#FF6B00]"
                            : "border-transparent hover:bg-white/5"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${AVATAR_COLORS[s.tier] || AVATAR_COLORS.basic}`}>
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-white font-semibold truncate flex-1">{s.name}</span>
                            {unread && !isSelected && (
                              <span className="w-2 h-2 rounded-full bg-[#FF6B00] flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-[#555] truncate">{s.lastMessage || "..."}</p>
                          <p className="text-[9px] text-[#444]">{formatTime(s.lastTime)}</p>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Thread view */}
            <div className="flex-1 flex flex-col min-h-0">
              {!selectedStudentId ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-[#555] text-sm">Select a student to view their thread</p>
                </div>
              ) : (
                <>
                  {/* Thread header */}
                  <div className="px-4 py-2.5 border-b border-white/8 flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold ${AVATAR_COLORS[selectedStudent?.tier || "basic"]}`}>
                      {selectedStudent?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-white font-semibold">{selectedStudent?.name}</span>
                  </div>

                  {/* Thread messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {threadMessages.length === 0 && (
                      <p className="text-center text-[#555] text-sm pt-8">No messages yet.</p>
                    )}
                    {threadMessages.map((msg) => (
                      <MessageItem key={msg.id} msg={msg} currentUserId={userId} />
                    ))}
                    <div ref={bottomRef} />
                  </div>

                  {/* Image preview */}
                  {imagePreview && (
                    <div className="px-4 pt-3 border-t border-white/8">
                      <div className="relative inline-block">
                        <img src={imagePreview} alt="Preview" className="max-h-28 rounded-xl object-cover border border-white/15" />
                        <button type="button" onClick={clearImage} className="absolute -top-2 -right-2 w-5 h-5 bg-black border border-white/20 rounded-full text-xs text-[#888] hover:text-white flex items-center justify-center transition-colors duration-150">×</button>
                      </div>
                    </div>
                  )}

                  {/* Reply input */}
                  <form onSubmit={sendMessage} className="p-3 border-t border-white/8 flex gap-2 items-center">
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleImageSelect} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/5 hover:bg-[#FF6B00]/10 border border-white/8 hover:border-[#FF6B00]/30 flex items-center justify-center transition-all duration-150" title="Upload image">
                      <svg className="w-4 h-4 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={`Reply to ${selectedStudent?.name}...`}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF6B00] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.1)] transition-all duration-150 placeholder:text-[#555]"
                    />
                    <button type="submit" disabled={(!input.trim() && !imageFile) || sending} className="bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors duration-150 flex-shrink-0">
                      {uploading ? "..." : sending ? "..." : "Send"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 && (
                <p className="text-center text-[#555] text-sm pt-8">No messages yet. Be the first!</p>
              )}
              {messages.map((msg) => <MessageItem key={msg.id} msg={msg} currentUserId={userId} />)}
              <div ref={bottomRef} />
            </div>

            {/* Image preview */}
            {imagePreview && (
              <div className="px-4 pt-3 border-t border-white/8">
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-28 rounded-xl object-cover border border-white/15"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-black border border-white/20 rounded-full text-xs text-[#888] hover:text-white flex items-center justify-center transition-colors duration-150"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3 border-t border-white/8 flex gap-2 items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/5 hover:bg-[#FF6B00]/10 border border-white/8 hover:border-[#FF6B00]/30 flex items-center justify-center transition-all duration-150"
                title="Upload image"
              >
                <svg className="w-4 h-4 text-[#888] hover:text-[#FF6B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message ${currentRoom.label}...`}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF6B00] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.1)] transition-all duration-150 placeholder:text-[#555]"
              />
              <button
                type="submit"
                disabled={(!input.trim() && !imageFile) || sending}
                className="bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors duration-150 flex-shrink-0"
              >
                {uploading ? "..." : sending ? "..." : "Send"}
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
  const isAdmin = msg.user.role === 'admin'
  const avatarStyle = isAdmin ? 'bg-red-500/20 border-red-500/50 text-red-400' : (AVATAR_COLORS[msg.user.tier] || AVATAR_COLORS.basic)
  const badgeStyle = isAdmin ? 'bg-red-500/20 text-red-400 border border-red-500/30' : (TIER_BADGE[msg.user.tier] || TIER_BADGE.basic)

  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
      <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarStyle}`}>
        {msg.user.name.charAt(0).toUpperCase()}
      </div>
      <div className={`max-w-[72%] space-y-1.5 ${isOwn ? "items-end flex flex-col" : ""}`}>
        <div className={`flex items-center gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
          <span className="text-xs text-white font-semibold">{msg.user.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${badgeStyle}`}>
            {isAdmin ? 'Admin' : msg.user.tier}
          </span>
          <span className="text-xs text-[#444]">{formatTime(msg.createdAt)}</span>
        </div>
        {msg.content && (
          <div className={`text-sm rounded-2xl px-4 py-2.5 leading-relaxed ${isOwn ? "bg-[#FF6B00]/18 text-white rounded-tr-sm" : "bg-white/8 text-white rounded-tl-sm"}`}>
            {msg.content}
          </div>
        )}
        {msg.imageUrl && (
          <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={msg.imageUrl}
              alt="Shared image"
              className="max-h-[280px] rounded-2xl object-cover cursor-pointer hover:opacity-90 transition-opacity duration-150 border border-white/10"
            />
          </a>
        )}
      </div>
    </div>
  )
}
