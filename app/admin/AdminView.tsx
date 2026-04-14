"use client"

import { useState, useRef } from "react"
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

interface Props {
  modules: Module[]
  codes: InviteCode[]
  totalStudents: number
  totalCompletions: number
  students: Student[]
  announcements: Announcement[]
  trackerEntries: TrackerEntry[]
}

const TIER_BADGE: Record<string, string> = {
  basic: "bg-white/10 text-white",
  community: "bg-blue-500/15 text-blue-400",
  mentorship: "bg-[#FF6B00]/15 text-[#FF6B00]",
}

type Tab = "modules" | "codes" | "students" | "announcements" | "tracker"

export default function AdminView({ modules: init, codes: initCodes, totalStudents, totalCompletions, students, announcements: initAnnouncements, trackerEntries: initTrackerEntries }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("modules")
  const [modules, setModules] = useState(init)
  const [codes, setCodes] = useState(initCodes)
  const [announcements, setAnnouncements] = useState(initAnnouncements)
  const [trackerEntries] = useState(initTrackerEntries)
  const [trackerFilter, setTrackerFilter] = useState("")
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

  return (
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
        {(["modules", "codes", "students", "announcements", "tracker"] as Tab[]).map((t) => (
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
      {tab === "students" && (
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
                <tr key={s.id} className="hover:bg-white/3 transition-colors duration-150">
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
    </div>
  )
}
