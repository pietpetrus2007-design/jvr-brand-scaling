"use client"

import { useState, useEffect } from "react"
import SlideViewer from "./SlideViewer"
import LessonQA from "./LessonQA"

interface Resource {
  id: string
  label: string
  url: string
  order: number
}

interface Lesson {
  id: string
  title: string
  description: string
  videoUrl: string
  slideUrl: string
  slidePages: number
  order: number
  resources: Resource[]
}

interface Module {
  id: string
  title: string
  description: string
  order: number
  part: number
  lessons: Lesson[]
}

interface Props {
  completedIds: string[]
  userId: string
}

const PARTS = [
  { value: 1, label: "Part 1: Get Clients" },
  { value: 2, label: "Part 2: Paid Ads" },
  { value: 3, label: "Part 3: Payment Structure" },
]

function getEmbedUrl(url: string): string | null {
  if (!url) return null
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return url
}

export default function CourseView({ completedIds: initial, userId }: Props) {
  const [completedIds, setCompletedIds] = useState(new Set(initial))
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [completing, setCompleting] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'lesson'>('list')
  const [activePart, setActivePart] = useState(1)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setSelectedLesson(null)
    setSelectedModule(null)
    setMobileView('list')
    fetch(`/api/modules?part=${activePart}`)
      .then((r) => r.json())
      .then((data) => {
        setModules(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [activePart])

  function handleLessonClick(lesson: Lesson, mod?: Module) {
    setSelectedLesson(lesson)
    if (mod) setSelectedModule(mod)
    setMobileView('lesson')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function getNextLesson(lessonId: string): Lesson | null {
    const allLessons = modules.flatMap(m => m.lessons)
    const idx = allLessons.findIndex(l => l.id === lessonId)
    return idx >= 0 && idx < allLessons.length - 1 ? allLessons[idx + 1] : null
  }

  async function markComplete(lessonId: string) {
    if (completedIds.has(lessonId)) return
    setCompleting(true)
    await fetch(`/api/lessons/${lessonId}/complete`, { method: "POST" })
    setCompletedIds((prev) => new Set([...prev, lessonId]))
    setCompleting(false)
    const next = getNextLesson(lessonId)
    if (next) {
      setTimeout(() => handleLessonClick(next), 400)
    }
  }

  const embedUrl = selectedLesson?.videoUrl ? getEmbedUrl(selectedLesson.videoUrl) : null

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0)
  const totalDone = modules.reduce((acc, m) => acc + m.lessons.filter((l) => completedIds.has(l.id)).length, 0)
  const overallPct = totalLessons > 0 ? Math.round((totalDone / totalLessons) * 100) : 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Part Switcher */}
      <div className="overflow-x-auto">
        <div className="flex gap-0 border-b border-white/10 min-w-max">
          {PARTS.map((p) => (
            <button
              key={p.value}
              onClick={() => setActivePart(p.value)}
              className={`px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-150 border-b-2 -mb-px ${
                activePart === p.value
                  ? "text-[#FF6B00] border-[#FF6B00]"
                  : "text-[#888] border-transparent hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className={`lg:w-72 flex-shrink-0 space-y-4 ${mobileView === 'lesson' ? 'hidden lg:block' : 'block'}`}>
          <div>
            <h2 className="text-lg font-bold text-white">Course Content</h2>
            {!loading && totalLessons > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-[#888] mb-1.5">
                  <span>{totalDone}/{totalLessons} completed</span>
                  <span className="text-[#FF6B00] font-semibold">{overallPct}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF6B00] rounded-full transition-all duration-500"
                    style={{ width: `${overallPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#0a0a0a] border border-white/8 rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            modules.map((mod) => {
              const done = mod.lessons.filter((l) => completedIds.has(l.id)).length
              const total = mod.lessons.length
              const pct = total > 0 ? Math.round((done / total) * 100) : 0
              return (
                <div
                  key={mod.id}
                  className="bg-[#0a0a0a] border border-white/8 rounded-xl overflow-hidden border-l-2 border-l-[#FF6B00]/40"
                >
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm leading-snug">{mod.title}</h3>
                    {mod.description && (
                      <p className="text-[#666] text-xs mt-1 leading-relaxed">{mod.description}</p>
                    )}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#666]">{done}/{total} lessons</span>
                        <span className="text-[#FF6B00] font-medium">{pct}%</span>
                      </div>
                      <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FF6B00] rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-white/5">
                    {mod.lessons.map((lesson) => {
                      const isSelected = selectedLesson?.id === lesson.id
                      const isDone = completedIds.has(lesson.id)
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson, mod)}
                          className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-all duration-150 border-b border-white/5 last:border-0 ${
                            isSelected
                              ? "bg-[#FF6B00]/12 text-white"
                              : "text-[#888] hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors duration-150 ${
                              isDone ? "bg-[#FF6B00] border-[#FF6B00]" : "border-white/20"
                            }`}
                          >
                            {isDone && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          <span className="truncate text-xs leading-relaxed">{lesson.title}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </aside>

        {/* Main area */}
        <div className={`flex-1 min-w-0 ${mobileView === 'list' ? 'hidden lg:block' : 'block'}`}>
          {selectedLesson ? (
            <div className="space-y-6">
              {/* Back button (mobile only) */}
              <button
                onClick={() => setMobileView('list')}
                className="lg:hidden flex items-center gap-1.5 text-sm font-semibold text-[#FF6B00] hover:text-[#e05e00] transition-colors duration-150"
              >
                ← Back to Course
              </button>
              {/* Slide Viewer */}
              {selectedLesson.slideUrl && selectedLesson.slidePages > 0 && (
                <div className="space-y-2">
                  <p className="text-white font-semibold text-sm">📄 Lesson Slides</p>
                  <SlideViewer publicId={selectedLesson.slideUrl} pages={selectedLesson.slidePages} />
                </div>
              )}

              {/* Video player */}
              {embedUrl ? (
                <div className="relative w-full aspect-video bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/8 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : !selectedLesson.slideUrl ? (
                <div className="relative w-full aspect-video bg-[#0a0a0a] rounded-2xl border border-white/8 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <svg className="w-10 h-10 text-[#333] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-[#555] text-sm">Content coming soon</p>
                  </div>
                </div>
              ) : null}

              {/* Resources */}
              {selectedLesson.resources && selectedLesson.resources.length > 0 && (
                <div className="space-y-3">
                  <p className="text-white font-semibold text-sm">🔗 Resources</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedLesson.resources.map((r) => (
                      <a
                        key={r.id}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#111] border border-[#FF6B00]/30 text-[#FF6B00] rounded-lg text-sm hover:bg-[#FF6B00]/10 transition-colors"
                      >
                        {r.label} →
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Lesson info */}
              <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-6 space-y-4">
                <h1 className="text-2xl font-bold text-white">{selectedLesson.title}</h1>
                {selectedLesson.description && (
                  <p className="text-[#888] leading-relaxed">{selectedLesson.description}</p>
                )}
                <button
                  onClick={() => markComplete(selectedLesson.id)}
                  disabled={completedIds.has(selectedLesson.id) || completing}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-150 ${
                    completedIds.has(selectedLesson.id)
                      ? "bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30 cursor-default"
                      : "bg-[#FF6B00] hover:bg-[#e05e00] text-white shadow-[0_0_30px_rgba(255,107,0,0.3)] hover:shadow-[0_0_40px_rgba(255,107,0,0.45)]"
                  }`}
                >
                  {completedIds.has(selectedLesson.id)
                    ? "✓ Completed"
                    : completing
                    ? "Saving..."
                    : "Mark as Complete"}
                </button>
                {selectedModule && (
                  <LessonQA
                    lessonTitle={selectedLesson.title}
                    moduleTitle={selectedModule.title}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-center bg-[#0a0a0a] border border-white/8 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-[#FF6B00]/10 flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(255,107,0,0.2)]">
                <svg className="w-8 h-8 text-[#FF6B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-white font-bold text-lg">Pick a lesson to start</p>
              <p className="text-[#888] text-sm mt-1">Choose any lesson from the sidebar to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
