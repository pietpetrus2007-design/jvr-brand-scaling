"use client"

export default function MentorshipView() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-white font-black text-2xl">🎯 Mentorship</h1>
        <p className="text-[#888] text-sm mt-1">You have direct access to JvR. Use it.</p>
      </div>

      <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-8 flex flex-col items-center text-center gap-5">
        <div className="w-16 h-16 rounded-full bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center text-3xl">
          💬
        </div>
        <div>
          <p className="text-white font-bold text-lg">WhatsApp JvR directly</p>
          <p className="text-[#888] text-sm mt-1">Got a question? Need feedback? Send a voice note or message.</p>
        </div>
        <a
          href="https://wa.me/27783432655"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-8 py-3.5 rounded-xl text-base transition-colors w-full max-w-xs text-center"
        >
          078 343 2655
        </a>
      </div>
    </div>
  )
}
