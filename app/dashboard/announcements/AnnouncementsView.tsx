"use client"
import { useEffect } from "react"

interface Announcement {
  id: string
  title: string
  content: string
  imageUrl: string | null
  createdAt: string
  user: { name: string }
}

interface Props {
  announcements: Announcement[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function AnnouncementsView({ announcements }: Props) {
  useEffect(() => {
    fetch('/api/announcements/seen', { method: 'POST' })
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">Announcements</h1>
        <p className="text-[#888] text-sm mt-2">Updates and news from the JvR team</p>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-20 bg-[#0a0a0a] border border-white/8 rounded-2xl">
          <p className="text-[#555]">No announcements yet. Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="bg-[#0a0a0a] border border-white/8 rounded-2xl overflow-hidden border-t-2 border-t-[#FF6B00]"
            >
              {a.imageUrl && (
                <a href={a.imageUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={a.imageUrl}
                    alt={a.title}
                    className="w-full max-h-64 object-cover hover:opacity-90 transition-opacity duration-150"
                  />
                </a>
              )}
              <div className="p-6">
                <h2 className="text-white font-bold text-xl leading-snug">{a.title}</h2>
                <p className="text-[#aaa] text-sm mt-3 leading-relaxed whitespace-pre-wrap">{a.content}</p>
                <div className="mt-5 pt-4 border-t border-white/8 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#FF6B00]/15 text-[#FF6B00] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#FF6B00]/25">
                      Admin
                    </span>
                    <span className="text-sm text-white font-medium">{a.user.name}</span>
                  </div>
                  <span className="text-xs text-[#555]">{formatDate(a.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
