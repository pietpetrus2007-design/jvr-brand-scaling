"use client"
import { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"

interface Props {
  lessonTitle: string
  moduleTitle: string
}

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function LessonQA({ lessonTitle, moduleTitle }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [locked, setLocked] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Clear when lesson changes
  useEffect(() => {
    setMessages([])
  }, [lessonTitle])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!input.trim() || loading) return
    const q = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: q }])
    setLoading(true)
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          lessonContext: `${moduleTitle} — ${lessonTitle}`,
          history: messages
        })
      })
      if (res.status === 403) {
        setLocked(true)
        setMessages([])
        setLoading(false)
        return
      }
      const data = await res.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.answer || data.error || "Sorry, something went wrong." }])
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't connect. Try again." }])
    }
    setLoading(false)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() }
  }

  if (locked) {
    return (
      <div className="mt-6 border-t border-white/8 pt-6">
        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
          🤖 Questions about this lesson?
        </h3>
        <div className="bg-[#111] border border-white/8 rounded-xl p-4 text-center">
          <p className="text-[#888] text-sm mb-3">The AI assistant is available for Community and Mentorship members.</p>
          <a href="https://brandscaling.co.za/products/upgrade-from-basic-to-community" className="inline-block bg-blue-500 hover:bg-blue-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] active:scale-95">⚡ Upgrade to Community →</a>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 border-t border-white/8 pt-6">
      <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
        🤖 Questions about this lesson?
        <span className="text-[#555] font-normal text-xs">AI answers in context of this lesson</span>
      </h3>

      {messages.length > 0 && (
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                m.role === 'user'
                  ? 'bg-[#FF6B00] text-white rounded-br-sm'
                  : 'bg-[#111] border border-white/8 text-[#ccc] rounded-bl-sm'
              }`}>
                {m.role === 'assistant' ? (
                  <ReactMarkdown
                    components={{
                      p: ({children}) => <p className="mb-1 last:mb-0 text-xs leading-relaxed">{children}</p>,
                      strong: ({children}) => <strong className="font-bold text-white">{children}</strong>,
                      ul: ({children}) => <ul className="list-disc ml-3 mb-1 space-y-0.5 text-xs">{children}</ul>,
                      li: ({children}) => <li>{children}</li>,
                    }}
                  >{m.content}</ReactMarkdown>
                ) : m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#111] border border-white/8 px-3 py-2 rounded-xl rounded-bl-sm">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#555] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#555] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#555] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="flex gap-2 bg-[#111] border border-white/10 rounded-xl px-3 py-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`Ask about "${lessonTitle}"...`}
          disabled={loading}
          className="flex-1 bg-transparent text-white placeholder-[#444] outline-none text-sm disabled:opacity-50"
          style={{ fontSize: '16px' }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="text-[#FF6B00] font-bold text-sm disabled:opacity-30 hover:text-[#e05e00] transition-colors"
        >
          Ask →
        </button>
      </div>
    </div>
  )
}
