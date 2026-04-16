"use client"

import { useState, useRef, useEffect } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
}

const WELCOME: Message = {
  role: "assistant",
  content: "Hey! I'm your Brand Scaling AI assistant. Ask me anything about finding clients, running ads, pricing your services, or growing your income. I'm here to help. 🔥",
}

export default function AskView() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  async function send() {
    const question = input.trim()
    if (!question || loading) return
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: question }])
    setLoading(true)

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }])
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: err?.message || "Something went wrong. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="mb-5 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white">Ask the AI</h1>
        <p className="text-[#888] text-sm mt-1">Your Brand Scaling coach — available 24/7</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/30 flex items-center justify-center text-[10px] font-bold text-[#FF6B00] mr-2 mt-0.5">
                AI
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-[#FF6B00] text-white rounded-br-sm"
                  : "bg-[#1a1a1a] border border-white/8 text-[#e0e0e0] rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/30 flex items-center justify-center text-[10px] font-bold text-[#FF6B00] mr-2 mt-0.5">
              AI
            </div>
            <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#888] animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#888] animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#888] animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex-shrink-0">
        <div className="flex gap-2 items-end bg-[#111] border border-white/10 rounded-2xl p-2 focus-within:border-[#FF6B00]/50 transition-colors duration-150">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask anything about Brand Scaling..."
            rows={1}
            disabled={loading}
            className="flex-1 bg-transparent text-white placeholder-[#555] resize-none outline-none px-2 py-1.5 max-h-32 disabled:opacity-50"
            style={{ fontSize: '16px', overflowY: 'auto' }}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="flex-shrink-0 bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors duration-150"
          >
            Ask
          </button>
        </div>
        <p className="text-[#444] text-xs mt-2 text-center">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
