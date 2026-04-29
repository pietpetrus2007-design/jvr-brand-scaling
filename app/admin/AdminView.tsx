"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"


interface Resource { id: string; label: string; url: string; order: number }
interface Lesson { id: string; title: string; description: string; videoUrl: string; slideUrl: string; slidePages: number; order: number; resources: Resource[] }
interface Module { id: string; title: string; description: string; order: number; lessons: Lesson[] }
interface InviteCode { id: string; code: string; tier: string; usedAt: string | null; usedBy: { name: string; email: string } | null }
interface Student { id: string; name: string; email: string; tier: string; createdAt: string; _count: { progress: number } }
interface Announcement { id: string; title: string; content: string; imageUrl: string | null; createdAt: string; user: { name: string } }
interface TrackerEntry {
  id: string; userId: string; businessesOutreached: number; conversationsStarted: number
  potentialClients: number; activeClients: number; paymentsReceived: number
  paymentsValue: number; moodScore: number; notes: string | null
  createdAt: string; user: { name: string; email: string }
}

interface GroupCall {
  id: string
  title: string
  scheduledAt: string
  joinUrl: string
  isActive: boolean
  startedAt: string | null
  inviteAll: boolean
}

interface CallReq {
  id: string; topic: string; message: string; preferredTime: string; status: string; createdAt: string
  user: { name: string; email: string }
}

interface Props {
  modules: Module[]
  codes: InviteCode[]
  totalStudents: number
  totalCompletions: number
  students: Student[]
  announcements: Announcement[]
  trackerEntries: TrackerEntry[]
  calls: GroupCall[]
  callRequests: CallReq[]
  adminName: string
}

const TIER_BADGE: Record<string, string> = {
  basic: "bg-white/10 text-white",
  community: "bg-blue-500/15 text-blue-400",
  mentorship: "bg-[#FF6B00]/15 text-[#FF6B00]",
}

type Tab = "modules" | "codes" | "students" | "announcements" | "tracker" | "calls" | "call-requests"

function StudentDetail({ student, onBack }: { student: Student; onBack: () => void }) {
  const [stats, setStats] = useState<{ revenue: number; payments: number; wins: {id:string;paymentsValue:number;paymentsReceived:number;notes:string|null;createdAt:string}[] } | null>(null)

  useEffect(() => {
    fetch(`/api/admin/student-stats/${student.id}`).then(r => r.json()).then(setStats)
  }, [student.id])

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-[#888] hover:text-white text-sm flex items-center gap-1 transition-colors">← Back to students</button>
      <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-white font-bold text-xl">{student.name}</h2>
            <p className="text-[#888] text-sm">{student.email}</p>
            <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${TIER_BADGE[student.tier]}`}>{student.tier}</span>
          </div>
          <div className="text-right">
            <p className="text-[#FF6B00] font-bold text-2xl">{student._count.progress}</p>
            <p className="text-[#555] text-xs">lessons completed</p>
          </div>
        </div>
        <p className="text-[#555] text-xs">Joined {new Date(student.createdAt).toLocaleDateString()}</p>
      </div>

      {stats ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-4 text-center">
              <p className="text-[#FF6B00] font-black text-2xl">R{stats.revenue.toLocaleString()}</p>
              <p className="text-[#555] text-xs mt-1">Total Revenue</p>
            </div>
            <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-4 text-center">
              <p className="text-white font-black text-2xl">{stats.payments}</p>
              <p className="text-[#555] text-xs mt-1">Payments Logged</p>
            </div>
          </div>
          {stats.wins.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-[#444] font-semibold">Payment History</p>
              {stats.wins.map(w => (
                <div key={w.id} className="bg-[#0a0a0a] border border-white/8 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-white font-semibold text-sm">R{w.paymentsValue.toLocaleString()}</p>
                    {w.notes && <p className="text-[#888] text-xs mt-0.5">{w.notes}</p>}
                  </div>
                  <p className="text-[#555] text-xs flex-shrink-0">{new Date(w.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#555] text-sm text-center py-6">No payments logged yet.</p>
          )}
        </>
      ) : (
        <p className="text-[#555] text-sm text-center py-6">Loading...</p>
      )}
    </div>
  )
}

export default function AdminView({ modules: init, codes: initCodes, totalStudents, totalCompletions, students, announcements: initAnnouncements, trackerEntries: initTrackerEntries, calls: initCalls, callRequests: initCallRequests, adminName }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("modules")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [modules, setModules] = useState(init)
  const [codes, setCodes] = useState(initCodes)
  const [announcements, setAnnouncements] = useState(initAnnouncements)
  const [trackerEntries] = useState(initTrackerEntries)
  const [calls, setCalls] = useState(initCalls)
  const [callRequests, setCallRequests] = useState<CallReq[]>(initCallRequests)
  const [newCall, setNewCall] = useState({ title: "", scheduledAt: "", joinUrl: "" })
  const [instantJoinUrl, setInstantJoinUrl] = useState("")
  const [schedulingCall, setSchedulingCall] = useState(false)
  const [trackerFilter, setTrackerFilter] = useState("")
  // Instant call state
  const [instantTitle, setInstantTitle] = useState("")
  const [instantInviteAll, setInstantInviteAll] = useState(true)
  const [instantSelectedIds, setInstantSelectedIds] = useState<Set<string>>(new Set())
  const [instantStudentSearch, setInstantStudentSearch] = useState("")
  const [startingInstant, setStartingInstant] = useState(false)
  // Scheduled call invite state
  const [schedInviteAll, setSchedInviteAll] = useState(true)
  const [schedSelectedIds, setSchedSelectedIds] = useState<Set<string>>(new Set())
  const [schedStudentSearch, setSchedStudentSearch] = useState("")

  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", imageUrl: "" })
  const [announcementImageFile, setAnnouncementImageFile] = useState<File | null>(null)
  const [announcementImagePreview, setAnnouncementImagePreview] = useState<string | null>(null)
  const [postingAnnouncement, setPostingAnnouncement] = useState(false)
  const announcementFileRef = useRef<HTMLInputElement>(null)

  const [newMod, setNewMod] = useState({ title: "", description: "", order: "" })
  const [addingMod, setAddingMod] = useState(false)
  const [lessonForms, setLessonForms] = useState<Record<string, { title: string; description: string; videoUrl: string; slideUrl: string; slidePages: string; order: string }>>({})
  const [resourceForms, setResourceForms] = useState<Record<string, { label: string; url: string }>>({})
  const [codeGen, setCodeGen] = useState({ tier: "basic", quantity: "1" })
  const [generating, setGenerating] = useState(false)

  async function addModule() {
    setAddingMod(true)
    const res = await fetch("/api/admin/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newMod, order: Number(newMod.order) || 0 }),
    })
    const mod = await res.json()
    setModules((prev) => [...prev, { ...mod, lessons: [] }])
    setNewMod({ title: "", description: "", order: "" })
    setAddingMod(false)
  }

  async function deleteModule(id: string) {
    if (!confirm("Delete this module and all its lessons?")) return
    await fetch(`/api/admin/modules/${id}`, { method: "DELETE" })
    setModules((prev) => prev.filter((m) => m.id !== id))
  }

  async function addLesson(moduleId: string) {
    const form = lessonForms[moduleId]
    if (!form?.title) return
    const res = await fetch(`/api/admin/modules/${moduleId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, order: Number(form.order) || 0, slidePages: Number(form.slidePages) || 0 }),
    })
    const lesson = await res.json()
    setModules((prev) =>
      prev.map((m) => m.id === moduleId ? { ...m, lessons: [...m.lessons, { ...lesson, resources: [] }] } : m)
    )
    setLessonForms((prev) => ({ ...prev, [moduleId]: { title: "", description: "", videoUrl: "", slideUrl: "", slidePages: "", order: "" } }))
  }

  async function addResource(lessonId: string, moduleId: string) {
    const form = resourceForms[lessonId]
    if (!form?.label || !form?.url) return
    const res = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, label: form.label, url: form.url }),
    })
    const resource = await res.json()
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.map((l) => l.id === lessonId ? { ...l, resources: [...l.resources, resource] } : l) }
          : m
      )
    )
    setResourceForms((prev) => ({ ...prev, [lessonId]: { label: "", url: "" } }))
  }

  async function deleteResource(lessonId: string, moduleId: string, resourceId: string) {
    await fetch(`/api/resources/${resourceId}`, { method: "DELETE" })
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.map((l) => l.id === lessonId ? { ...l, resources: l.resources.filter((r) => r.id !== resourceId) } : l) }
          : m
      )
    )
  }

  async function deleteLesson(moduleId: string, lessonId: string) {
    if (!confirm("Delete this lesson?")) return
    await fetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" })
    setModules((prev) =>
      prev.map((m) => m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m)
    )
  }

  function handleAnnouncementImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAnnouncementImageFile(file)
    setAnnouncementImagePreview(URL.createObjectURL(file))
  }

  function clearAnnouncementImage() {
    setAnnouncementImageFile(null)
    setAnnouncementImagePreview(null)
    if (announcementFileRef.current) announcementFileRef.current.value = ""
  }

  async function postAnnouncement() {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) return
    setPostingAnnouncement(true)

    let imageUrl: string | null = null
    if (announcementImageFile) {
      const fd = new FormData()
      fd.append("file", announcementImageFile)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (res.ok) {
        const data = await res.json()
        imageUrl = data.url
      }
    }

    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newAnnouncement, imageUrl }),
    })
    const created = await res.json()
    setAnnouncements((prev) => [created, ...prev])
    setNewAnnouncement({ title: "", content: "", imageUrl: "" })
    clearAnnouncementImage()
    setPostingAnnouncement(false)
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm("Delete this announcement?")) return
    await fetch(`/api/announcements/${id}`, { method: "DELETE" })
    setAnnouncements((prev) => prev.filter((a) => a.id !== id))
  }

  async function scheduleCall() {
    if (!newCall.title.trim() || !newCall.scheduledAt) return
    setSchedulingCall(true)
    const res = await fetch("/api/admin/calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newCall.title,
        scheduledAt: newCall.scheduledAt,
        joinUrl: newCall.joinUrl || "",
        inviteAll: schedInviteAll,
        invitedUserIds: schedInviteAll ? [] : Array.from(schedSelectedIds),
      }),
    })
    const created = await res.json()
    setCalls((prev) => [...prev, created])
    setNewCall({ title: "", scheduledAt: "", joinUrl: "" })
    setSchedInviteAll(true)
    setSchedSelectedIds(new Set())
    setSchedulingCall(false)
  }

  async function startInstantCall() {
    setStartingInstant(true)
    const res = await fetch("/api/admin/calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: instantTitle.trim() || "Live Group Call",
        startNow: true,
        joinUrl: instantJoinUrl || "",
        inviteAll: instantInviteAll,
        invitedUserIds: instantInviteAll ? [] : Array.from(instantSelectedIds),
      }),
    })
    const created = await res.json()
    setCalls((prev) => [...prev, created])
    setInstantTitle("")
    setInstantInviteAll(true)
    setInstantSelectedIds(new Set())
    setStartingInstant(false)
  }

  async function startScheduledCall(id: string) {
    const res = await fetch(`/api/admin/calls/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start" }),
    })
    const updated = await res.json()
    setCalls((prev) => prev.map((c) => c.id === id ? { ...c, startedAt: updated.startedAt } : c))
  }

  async function cancelCall(id: string) {
    if (!confirm("Cancel this call?")) return
    await fetch(`/api/admin/calls/${id}`, { method: "DELETE" })
    setCalls((prev) => prev.filter((c) => c.id !== id))
  }

  async function generateCodes() {
    setGenerating(true)
    const res = await fetch("/api/admin/invite-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier: codeGen.tier, quantity: Number(codeGen.quantity) }),
    })
    const newCodes = await res.json()
    setCodes((prev) => [...newCodes, ...prev])
    setGenerating(false)
  }

  const inputCls = "bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF6B00] transition-colors duration-150"

  function StudentSelector({
    search, setSearch, selectedIds, setSelectedIds,
  }: {
    search: string
    setSearch: (v: string) => void
    selectedIds: Set<string>
    setSelectedIds: (fn: (prev: Set<string>) => Set<string>) => void
  }) {
    const filtered = students.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    )
    function toggle(id: string) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    }
    return (
      <div className="border border-white/10 rounded-xl overflow-hidden">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students..."
          className="w-full bg-white/5 px-3 py-2 text-white text-sm focus:outline-none border-b border-white/10"
        />
        <div className="max-h-48 overflow-y-auto divide-y divide-white/5">
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-[#555] text-sm text-center">No students found.</p>
          )}
          {filtered.map((s) => (
            <label key={s.id} className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.has(s.id)}
                onChange={() => toggle(s.id)}
                className="accent-[#FF6B00]"
              />
              <span className="flex-1 min-w-0">
                <span className="text-white text-sm font-medium">{s.name}</span>
                <span className="text-[#555] text-xs ml-2">{s.email}</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${TIER_BADGE[s.tier]}`}>{s.tier}</span>
            </label>
          ))}
        </div>
        {selectedIds.size > 0 && (
          <p className="px-3 py-1.5 text-xs text-[#FF6B00] border-t border-white/10 bg-white/2">
            {selectedIds.size} student{selectedIds.size !== 1 ? "s" : ""} selected
          </p>
        )}
      </div>
    )
  }

  return (
    <>
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header + stats */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
        <div className="flex gap-4">
          <div className="bg-[#0a0a0a] border border-white/8 rounded-xl px-5 py-3 text-center min-w-[80px]">
            <p className="text-2xl font-bold text-[#FF6B00]">{totalStudents}</p>
            <p className="text-xs text-[#888] mt-0.5">Students</p>
          </div>
          <div className="bg-[#0a0a0a] border border-white/8 rounded-xl px-5 py-3 text-center min-w-[80px]">
            <p className="text-2xl font-bold text-[#FF6B00]">{totalCompletions}</p>
            <p className="text-xs text-[#888] mt-0.5">Completions</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 border border-white/8 p-1 rounded-xl w-fit flex-wrap">
        {(["modules", "codes", "students", "announcements", "tracker", "calls", "call-requests"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors duration-150 ${
              tab === t ? "bg-[#FF6B00] text-white" : "text-[#888] hover:text-white hover:bg-white/5"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Modules tab */}
      {tab === "modules" && (
        <div className="space-y-6">
          <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-bold">Add Module</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input value={newMod.title} onChange={(e) => setNewMod((p) => ({ ...p, title: e.target.value }))}
                placeholder="Title" className={inputCls} />
              <input value={newMod.description} onChange={(e) => setNewMod((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description" className={inputCls} />
              <div className="flex gap-2">
                <input value={newMod.order} onChange={(e) => setNewMod((p) => ({ ...p, order: e.target.value }))}
                  placeholder="Order" type="number" className={`w-20 ${inputCls}`} />
                <button onClick={addModule} disabled={!newMod.title || addingMod}
                  className="flex-1 bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors duration-150">
                  Add Module
                </button>
              </div>
            </div>
          </div>

          {modules.map((mod) => {
            const lf = lessonForms[mod.id] || { title: "", description: "", videoUrl: "", slideUrl: "", slidePages: "", order: "" }
            return (
              <div key={mod.id} className="bg-[#0a0a0a] border border-white/8 rounded-2xl overflow-hidden border-l-2 border-l-[#FF6B00]/40">
                <div className="px-5 py-4 flex items-center justify-between border-b border-white/8">
                  <div>
                    <h3 className="text-white font-bold">{mod.title}</h3>
                    {mod.description && <p className="text-[#888] text-xs mt-0.5">{mod.description}</p>}
                  </div>
                  <button onClick={() => deleteModule(mod.id)}
                    className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors duration-150">
                    Delete
                  </button>
                </div>
                <div className="divide-y divide-white/5">
                  {mod.lessons.map((lesson) => {
                    const rf = resourceForms[lesson.id] || { label: "", url: "" }
                    return (
                      <div key={lesson.id} className="px-5 py-3 hover:bg-white/3 transition-colors duration-150">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm font-semibold">{lesson.title}</p>
                            {lesson.description && <p className="text-[#888] text-xs mt-0.5">{lesson.description}</p>}
                            {lesson.videoUrl && <p className="text-[#555] text-xs mt-0.5 truncate max-w-xs">{lesson.videoUrl}</p>}
                            {lesson.slideUrl && <p className="text-[#FF6B00]/50 text-xs mt-0.5">📄 {lesson.slideUrl} ({lesson.slidePages} slides)</p>}
                          </div>
                          <button onClick={() => deleteLesson(mod.id, lesson.id)}
                            className="text-red-400 hover:text-red-300 text-xs ml-4 flex-shrink-0 transition-colors duration-150">
                            Delete
                          </button>
                        </div>
                        {/* Resources */}
                        <div className="mt-2 space-y-1">
                          {lesson.resources.map((r) => (
                            <div key={r.id} className="flex items-center gap-2 text-xs">
                              <span className="text-[#FF6B00]">{r.label}</span>
                              <span className="text-[#555] truncate max-w-xs">{r.url}</span>
                              <button
                                onClick={() => deleteResource(lesson.id, mod.id, r.id)}
                                className="text-red-400 hover:text-red-300 ml-auto flex-shrink-0"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <div className="flex gap-2 mt-1.5">
                            <input
                              value={rf.label}
                              onChange={(e) => setResourceForms((p) => ({ ...p, [lesson.id]: { ...rf, label: e.target.value } }))}
                              placeholder="Resource label"
                              className="flex-1 bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-[#FF6B00]"
                            />
                            <input
                              value={rf.url}
                              onChange={(e) => setResourceForms((p) => ({ ...p, [lesson.id]: { ...rf, url: e.target.value } }))}
                              placeholder="URL"
                              className="flex-1 bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-[#FF6B00]"
                            />
                            <button
                              onClick={() => addResource(lesson.id, mod.id)}
                              disabled={!rf.label || !rf.url}
                              className="text-xs text-[#FF6B00] border border-[#FF6B00]/30 rounded-lg px-3 py-1 hover:bg-[#FF6B00]/10 disabled:opacity-30 transition-colors"
                            >
                              + Add
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="px-5 py-4 border-t border-white/8 bg-white/2">
                  <p className="text-xs text-[#555] mb-3 font-bold uppercase tracking-wider">Add Lesson</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input value={lf.title} onChange={(e) => setLessonForms((p) => ({ ...p, [mod.id]: { ...lf, title: e.target.value } }))}
                      placeholder="Title" className={inputCls} />
                    <input value={lf.description} onChange={(e) => setLessonForms((p) => ({ ...p, [mod.id]: { ...lf, description: e.target.value } }))}
                      placeholder="Description" className={inputCls} />
                    <input value={lf.videoUrl} onChange={(e) => setLessonForms((p) => ({ ...p, [mod.id]: { ...lf, videoUrl: e.target.value } }))}
                      placeholder="Video URL (YouTube/Vimeo)" className={inputCls} />
                    <input value={lf.slideUrl} onChange={(e) => setLessonForms((p) => ({ ...p, [mod.id]: { ...lf, slideUrl: e.target.value } }))}
                      placeholder="Cloudinary Slide ID (e.g. mod1-lesson1)" className={inputCls} />
                    <input value={lf.slidePages} onChange={(e) => setLessonForms((p) => ({ ...p, [mod.id]: { ...lf, slidePages: e.target.value } }))}
                      placeholder="Number of slides" type="number" className={inputCls} />
                    <div className="flex gap-2">
                      <input value={lf.order} onChange={(e) => setLessonForms((p) => ({ ...p, [mod.id]: { ...lf, order: e.target.value } }))}
                        placeholder="Order" type="number" className={`w-20 ${inputCls}`} />
                      <button onClick={() => addLesson(mod.id)} disabled={!lf.title}
                        className="flex-1 bg-[#FF6B00]/15 hover:bg-[#FF6B00]/25 disabled:opacity-50 text-[#FF6B00] font-bold rounded-xl text-xs transition-colors duration-150">
                        + Add Lesson
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Codes tab */}
      {tab === "codes" && (
        <div className="space-y-6">
          <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-bold">Generate Invite Codes</h2>
            <div className="flex flex-wrap gap-3">
              <select value={codeGen.tier} onChange={(e) => setCodeGen((p) => ({ ...p, tier: e.target.value }))}
                className={inputCls}>
                <option value="basic">Basic</option>
                <option value="community">Community</option>
                <option value="mentorship">Mentorship</option>
              </select>
              <input value={codeGen.quantity} onChange={(e) => setCodeGen((p) => ({ ...p, quantity: e.target.value }))}
                type="number" min="1" max="50" placeholder="Qty" className={`w-20 ${inputCls}`} />
              <button onClick={generateCodes} disabled={generating}
                className="bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors duration-150">
                {generating ? "Generating..." : "Generate Codes"}
              </button>
            </div>
          </div>
          <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-[#888] text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Code</th>
                  <th className="text-left px-4 py-3">Tier</th>
                  <th className="text-left px-4 py-3">Used By</th>
                  <th className="text-left px-4 py-3">Used At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {codes.map((c) => (
                  <tr key={c.id} className="hover:bg-white/3 transition-colors duration-150">
                    <td className="px-4 py-3 font-mono text-white text-xs">{c.code}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${TIER_BADGE[c.tier]}`}>{c.tier}</span>
                    </td>
                    <td className="px-4 py-3 text-[#888] text-xs">{c.usedBy ? `${c.usedBy.name} (${c.usedBy.email})` : "—"}</td>
                    <td className="px-4 py-3 text-[#888] text-xs">{c.usedAt ? new Date(c.usedAt).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Students tab */}
      {tab === "students" && !selectedStudent && (
        <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-[#888] text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Tier</th>
                <th className="text-left px-4 py-3">Progress</th>
                <th className="text-left px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-white/3 transition-colors duration-150 cursor-pointer" onClick={() => setSelectedStudent(s)}>
                  <td className="px-4 py-3 text-white font-semibold">{s.name}</td>
                  <td className="px-4 py-3 text-[#888] text-xs">{s.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${TIER_BADGE[s.tier]}`}>{s.tier}</span>
                  </td>
                  <td className="px-4 py-3 text-[#FF6B00] font-semibold">{s._count.progress} lessons</td>
                  <td className="px-4 py-3 text-[#888] text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-[#555]">No students yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "students" && selectedStudent && (
        <StudentDetail student={selectedStudent} onBack={() => setSelectedStudent(null)} />
      )}

      {/* Tracker tab */}
      {tab === "tracker" && (() => {
        const filtered = trackerFilter.trim()
          ? trackerEntries.filter(
              (e) =>
                e.user.name.toLowerCase().includes(trackerFilter.toLowerCase()) ||
                e.user.email.toLowerCase().includes(trackerFilter.toLowerCase())
            )
          : trackerEntries

        const totals = filtered.reduce(
          (acc, e) => ({
            businessesOutreached: acc.businessesOutreached + e.businessesOutreached,
            conversationsStarted: acc.conversationsStarted + e.conversationsStarted,
            potentialClients: acc.potentialClients + e.potentialClients,
            activeClients: acc.activeClients + e.activeClients,
            paymentsReceived: acc.paymentsReceived + e.paymentsReceived,
            paymentsValue: acc.paymentsValue + e.paymentsValue,
          }),
          { businessesOutreached: 0, conversationsStarted: 0, potentialClients: 0, activeClients: 0, paymentsReceived: 0, paymentsValue: 0 }
        )

        function downloadCSV() {
          const headers = ["Date", "Name", "Email", "Outreached", "Conversations", "Potential Clients", "Active Clients", "Payments", "Value", "Mood", "Notes"]
          const rows = filtered.map((e) => [
            new Date(e.createdAt).toLocaleDateString(),
            e.user.name,
            e.user.email,
            e.businessesOutreached, e.conversationsStarted, e.potentialClients,
            e.activeClients, e.paymentsReceived, e.paymentsValue,
            e.moodScore,
            e.notes ? `"${e.notes.replace(/"/g, '""')}"` : "",
          ])
          const csv = [headers, ...rows].map((r) => r.join(",")).join("\n")
          const blob = new Blob([csv], { type: "text/csv" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = "tracker-export.csv"
          a.click()
          URL.revokeObjectURL(url)
        }

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <input
                value={trackerFilter}
                onChange={(e) => setTrackerFilter(e.target.value)}
                placeholder="Filter by student name or email..."
                className={`flex-1 min-w-[200px] ${inputCls}`}
              />
              <button
                onClick={downloadCSV}
                className="bg-white/8 hover:bg-white/12 border border-white/10 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors duration-150"
              >
                Export CSV
              </button>
            </div>
            <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl overflow-x-auto">
              <table className="w-full text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/8 text-[#888] uppercase tracking-wider">
                    <th className="text-left px-4 py-3">Student</th>
                    <th className="text-left px-4 py-3">Date</th>
                    <th className="text-right px-3 py-3">Outreached</th>
                    <th className="text-right px-3 py-3">Convos</th>
                    <th className="text-right px-3 py-3">Potential</th>
                    <th className="text-right px-3 py-3">Active</th>
                    <th className="text-right px-3 py-3">Payments</th>
                    <th className="text-right px-3 py-3">Value</th>
                    <th className="text-right px-3 py-3">Mood</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((e) => (
                    <tr key={e.id} className="hover:bg-white/3 transition-colors duration-150">
                      <td className="px-4 py-3">
                        <p className="text-white font-semibold">{e.user.name}</p>
                        <p className="text-[#555] text-xs">{e.user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-[#888]">{new Date(e.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-3 text-right text-white">{e.businessesOutreached}</td>
                      <td className="px-3 py-3 text-right text-white">{e.conversationsStarted}</td>
                      <td className="px-3 py-3 text-right text-white">{e.potentialClients}</td>
                      <td className="px-3 py-3 text-right text-[#FF6B00] font-semibold">{e.activeClients}</td>
                      <td className="px-3 py-3 text-right text-white">{e.paymentsReceived}</td>
                      <td className="px-3 py-3 text-right text-[#FF6B00] font-semibold">R{e.paymentsValue.toLocaleString()}</td>
                      <td className="px-3 py-3 text-right text-white">{e.moodScore}/10</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-10 text-center text-[#555]">No entries found.</td></tr>
                  )}
                  {filtered.length > 0 && (
                    <tr className="border-t border-white/12 bg-white/3 font-bold">
                      <td className="px-4 py-3 text-[#888] text-xs uppercase tracking-wider" colSpan={2}>Totals</td>
                      <td className="px-3 py-3 text-right text-white">{totals.businessesOutreached}</td>
                      <td className="px-3 py-3 text-right text-white">{totals.conversationsStarted}</td>
                      <td className="px-3 py-3 text-right text-white">{totals.potentialClients}</td>
                      <td className="px-3 py-3 text-right text-[#FF6B00]">{totals.activeClients}</td>
                      <td className="px-3 py-3 text-right text-white">{totals.paymentsReceived}</td>
                      <td className="px-3 py-3 text-right text-[#FF6B00]">R{totals.paymentsValue.toLocaleString()}</td>
                      <td className="px-3 py-3" />
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      })()}

      {/* Calls tab */}
      {tab === "calls" && (
        <div className="space-y-6">
          {/* Instant Call */}
          <div className="bg-[#0a0a0a] border border-[#FF6B00]/30 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
              Start Instant Call
            </h2>
            <input
              value={instantTitle}
              onChange={(e) => setInstantTitle(e.target.value)}
              placeholder='Title (optional, default "Live Group Call")'
              className={`w-full ${inputCls}`}
            />
            <input
              value={instantJoinUrl}
              onChange={(e) => setInstantJoinUrl(e.target.value)}
              placeholder="Zoom / Google Meet link (paste here)"
              className={`w-full ${inputCls}`}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setInstantInviteAll(true)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-150 ${instantInviteAll ? "bg-[#FF6B00] text-white" : "bg-white/5 text-[#888] hover:text-white"}`}
              >
                All Students
              </button>
              <button
                onClick={() => setInstantInviteAll(false)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-150 ${!instantInviteAll ? "bg-[#FF6B00] text-white" : "bg-white/5 text-[#888] hover:text-white"}`}
              >
                Select Students
              </button>
            </div>
            {!instantInviteAll && (
              <StudentSelector
                search={instantStudentSearch}
                setSearch={setInstantStudentSearch}
                selectedIds={instantSelectedIds}
                setSelectedIds={setInstantSelectedIds}
              />
            )}
            <button
              onClick={async () => {
                await startInstantCall()
                if (instantJoinUrl) window.open(instantJoinUrl, '_blank')
              }}
              disabled={startingInstant || (!instantInviteAll && instantSelectedIds.size === 0)}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors duration-150"
            >
              {startingInstant ? "Starting..." : "Start Call Now"}
            </button>
          </div>

          {/* Schedule Call */}
          <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-bold">Schedule Group Call</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={newCall.title}
                onChange={(e) => setNewCall((p) => ({ ...p, title: e.target.value }))}
                placeholder="Call title"
                className={inputCls}
              />
              <input
                type="datetime-local"
                value={newCall.scheduledAt}
                onChange={(e) => setNewCall((p) => ({ ...p, scheduledAt: e.target.value }))}
                className={inputCls}
              />
            </div>
            <input
              value={newCall.joinUrl}
              onChange={(e) => setNewCall((p) => ({ ...p, joinUrl: e.target.value }))}
              placeholder="Zoom / Google Meet link (paste here)"
              className={`w-full ${inputCls}`}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setSchedInviteAll(true)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-150 ${schedInviteAll ? "bg-[#FF6B00] text-white" : "bg-white/5 text-[#888] hover:text-white"}`}
              >
                All Students
              </button>
              <button
                onClick={() => setSchedInviteAll(false)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-150 ${!schedInviteAll ? "bg-[#FF6B00] text-white" : "bg-white/5 text-[#888] hover:text-white"}`}
              >
                Select Students
              </button>
            </div>
            {!schedInviteAll && (
              <StudentSelector
                search={schedStudentSearch}
                setSearch={setSchedStudentSearch}
                selectedIds={schedSelectedIds}
                setSelectedIds={setSchedSelectedIds}
              />
            )}
            <button
              onClick={scheduleCall}
              disabled={!newCall.title.trim() || !newCall.scheduledAt || schedulingCall || (!schedInviteAll && schedSelectedIds.size === 0)}
              className="bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors duration-150 px-4 py-2.5"
            >
              {schedulingCall ? "Scheduling..." : "Schedule Call"}
            </button>
          </div>

          {calls.length === 0 ? (
            <p className="text-[#555] text-sm text-center py-8">No upcoming calls scheduled.</p>
          ) : (
            <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-[#888] text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3">Title</th>
                    <th className="text-left px-4 py-3">Scheduled</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Zoom Link</th>
                    <th className="text-left px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {calls.map((c) => (
                    <tr key={c.id} className="hover:bg-white/3 transition-colors duration-150">
                      <td className="px-4 py-3 text-white font-semibold">{c.title}</td>
                      <td className="px-4 py-3 text-[#888] text-xs">{new Date(c.scheduledAt).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}</td>
                      <td className="px-4 py-3">
                        {c.startedAt ? (
                          <span className="flex items-center gap-1.5 text-red-400 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            Live
                          </span>
                        ) : (
                          <span className="text-[#555] text-xs">Scheduled</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#555] text-xs font-mono truncate max-w-[160px]">{c.joinUrl || '—'}</td>
                      <td className="px-4 py-3 flex items-center gap-3">
                        {!c.startedAt && (
                          <button
                            onClick={() => startScheduledCall(c.id)}
                            className="text-[#FF6B00] hover:text-white text-xs font-semibold transition-colors duration-150"
                          >
                            Start Now
                          </button>
                        )}
                        {c.startedAt && (
                          <button
                            onClick={() => c.joinUrl && window.open(c.joinUrl, '_blank')}
                            className="text-green-400 hover:text-green-300 text-xs font-semibold transition-colors duration-150"
                          >
                            Join
                          </button>
                        )}
                        <button
                          onClick={() => cancelCall(c.id)}
                          className="text-red-400 hover:text-red-300 text-xs transition-colors duration-150"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Announcements tab */}
      {tab === "announcements" && (
        <div className="space-y-6">
          <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-bold">New Announcement</h2>
            <input
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement((p) => ({ ...p, title: e.target.value }))}
              placeholder="Title *"
              className={`w-full ${inputCls}`}
            />
            <textarea
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement((p) => ({ ...p, content: e.target.value }))}
              placeholder="Content *"
              rows={4}
              className={`w-full ${inputCls} resize-none`}
            />
            <div className="flex items-center gap-3 flex-wrap">
              <input
                ref={announcementFileRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAnnouncementImage}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => announcementFileRef.current?.click()}
                className="text-sm text-[#888] hover:text-white border border-white/10 hover:border-white/25 rounded-xl px-4 py-2.5 transition-colors duration-150"
              >
                📷 Add Image
              </button>
              {announcementImagePreview && (
                <div className="relative inline-block">
                  <img src={announcementImagePreview} alt="Preview" className="h-12 rounded-xl object-cover border border-white/20" />
                  <button
                    type="button"
                    onClick={clearAnnouncementImage}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-black border border-white/20 rounded-full text-xs text-[#888] hover:text-white flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              )}
              <button
                onClick={postAnnouncement}
                disabled={!newAnnouncement.title.trim() || !newAnnouncement.content.trim() || postingAnnouncement}
                className="ml-auto bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors duration-150"
              >
                {postingAnnouncement ? "Posting..." : "Post Announcement"}
              </button>
            </div>
          </div>

          {announcements.length === 0 ? (
            <p className="text-[#555] text-sm text-center py-8">No announcements yet.</p>
          ) : (
            <div className="space-y-4">
              {announcements.map((a) => (
                <div key={a.id} className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-5 flex gap-4 hover:border-white/12 transition-colors duration-150">
                  {a.imageUrl && (
                    <img src={a.imageUrl} alt={a.title} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm">{a.title}</h3>
                    <p className="text-[#888] text-xs mt-1 line-clamp-2">{a.content}</p>
                    <p className="text-[#555] text-xs mt-1.5">{new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => deleteAnnouncement(a.id)}
                    className="text-red-400 hover:text-red-300 text-xs flex-shrink-0 transition-colors duration-150"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Call Requests tab */}
      {tab === "call-requests" && (
        <div className="space-y-4">
          <h2 className="text-white font-bold text-lg">Private Call Requests</h2>
          {callRequests.length === 0 ? (
            <p className="text-[#555] text-sm text-center py-8">No call requests yet.</p>
          ) : (
            <div className="space-y-3">
              {callRequests.map((r) => (
                <div key={r.id} className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-bold text-sm">{r.topic}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold capitalize ${
                        r.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                        r.status === 'confirmed' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
                        'bg-green-500/15 text-green-400 border-green-500/30'
                      }`}>{r.status}</span>
                    </div>
                    <p className="text-[#aaa] text-xs">{r.user.name} — {r.user.email}</p>
                    <p className="text-[#888] text-sm mt-1">{r.message}</p>
                    <p className="text-[#555] text-xs">⏰ {r.preferredTime} &nbsp;·&nbsp; {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {r.status !== 'confirmed' && (
                      <button onClick={async () => {
                        await fetch('/api/admin/call-requests', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: r.id, status: 'confirmed' }) })
                        setCallRequests(prev => prev.map(x => x.id === r.id ? {...x, status: 'confirmed'} : x))
                      }} className="text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-3 py-1.5 rounded-lg font-semibold transition-colors">Confirm</button>
                    )}
                    {r.status !== 'done' && (
                      <button onClick={async () => {
                        await fetch('/api/admin/call-requests', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: r.id, status: 'done' }) })
                        setCallRequests(prev => prev.map(x => x.id === r.id ? {...x, status: 'done'} : x))
                      }} className="text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 px-3 py-1.5 rounded-lg font-semibold transition-colors">Done</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
    </>
  )
}
