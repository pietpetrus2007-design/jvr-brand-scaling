"use client"

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
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">📢 Announcements</h1>
        <p className="text-[#888] text-sm mt-1">Updates from the JvR team</p>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#555] text-base">No announcements yet. Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map((a) => (
            <div key={a.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {a.imageUrl && (
                <a href={a.imageUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={a.imageUrl}
                    alt={a.title}
                    className="w-full max-h-64 object-cover hover:opacity-90 transition-opacity"
                  />
                </a>
              )}
              <div className="p-6">
                <h2 className="text-white font-bold text-lg">{a.title}</h2>
                <p className="text-[#aaa] text-sm mt-3 leading-relaxed whitespace-pre-wrap">{a.content}</p>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-[#555]">Posted by <span className="text-[#FF6B00]">{a.user.name}</span></span>
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
