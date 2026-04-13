"use client"

import { useState } from "react"

interface Lesson {
  id: string
  title: string
  description: string
  videoUrl: string
  order: number
}

interface Module {
  id: string
  title: string
  description: string
  order: number
  lessons: Lesson[]
}

interface Props {
  modules: Module[]
  completedIds: string[]
  userId: string
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return url
}

export default function CourseView({ modules, completedIds: initial, userId }: Props) {
  const [completedIds, setCompletedIds] = useState(new Set(initial))
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [completing, setCompleting] = useState(false)

  async function markComplete(lessonId: string) {
    if (completedIds.has(lessonId)) return
    setCompleting(true)
    await fetch(`/api/lessons/${lessonId}/complete`, { method: "POST" })
    setCompletedIds((prev) => new Set([...prev, lessonId]))
    setCompleting(false)
  }

  const embedUrl = selectedLesson ? getEmbedUrl(selectedLesson.videoUrl) : null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      {/* Sidebar — module list */}
      <aside className="lg:w-72 flex-shrink-0 space-y-4">
        <h2 className="text-lg font-semibold text-white">Course Content</h2>
        {modules.map((mod) => {
          const done = mod.lessons.filter((l) => completedIds.has(l.id)).length
          const total = mod.lessons.length
          const pct = total > 0 ? Math.round((done / total) * 100) : 0
          return (
            <div key={mod.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="p-4">
                <h3 className="text-white font-semibold text-sm">{mod.title}</h3>
                <p className="text-[#888] text-xs mt-1">{mod.description}</p>
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-[#888] mb-1">
                    <span>{done}/{total} lessons</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF6B00] rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
              <div className="border-t border-white/5">
                {mod.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-colors border-b border-white/5 last:border-0 ${
                      selectedLesson?.id === lesson.id ? "bg-[#FF6B00]/10 text-white" : "text-[#888] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${completedIds.has(lesson.id) ? "bg-[#FF6B00] border-[#FF6B00]" : "border-white/20"}`}>
                      {completedIds.has(lesson.id) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="truncate">{lesson.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </aside>

      {/* Main — video + lesson detail */}
      <div className="flex-1 min-w-0">
        {selectedLesson ? (
          <div className="space-y-6">
            {/* Video player */}
            {embedUrl ? (
              <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="relative w-full aspect-video bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                <p className="text-[#888] text-sm">No video added yet.</p>
              </div>
            )}
            {/* Lesson info */}
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-white">{selectedLesson.title}</h1>
              <p className="text-[#888] leading-relaxed">{selectedLesson.description}</p>
              <button
                onClick={() => markComplete(selectedLesson.id)}
                disabled={completedIds.has(selectedLesson.id) || completing}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  completedIds.has(selectedLesson.id)
                    ? "bg-[#FF6B00]/20 text-[#FF6B00] cursor-default"
                    : "bg-[#FF6B00] hover:bg-[#e05e00] text-white"
                }`}
              >
                {completedIds.has(selectedLesson.id) ? "✓ Completed" : completing ? "Saving..." : "Mark as Complete"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#FF6B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white font-semibold">Select a lesson to start</p>
            <p className="text-[#888] text-sm mt-1">Choose any lesson from the sidebar</p>
          </div>
        )}
      </div>
    </div>
  )
}
