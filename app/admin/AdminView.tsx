"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Lesson { id: string; title: string; description: string; videoUrl: string; order: number }
interface Module { id: string; title: string; description: string; order: number; lessons: Lesson[] }
interface InviteCode { id: string; code: string; tier: string; usedAt: string | null; usedBy: { name: string; email: string } | null }
interface Student { id: string; name: string; email: string; tier: string; createdAt: string; _count: { progress: number } }

interface Props {
  modules: Module[]
  codes: InviteCode[]
  totalStudents: number
  totalCompletions: number
  students: Student[]
}

const TIER_COLORS: Record<string, string> = {
  basic: "bg-white/10 text-white",
  community: "bg-blue-500/20 text-blue-400",
  mentorship: "bg-[#FF6B00]/20 text-[#FF6B00]",
}

type Tab = "modules" | "codes" | "students"

export default function AdminView({ modules: init, codes: initCodes, totalStudents, totalCompletions, students }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("modules")
  const [modules, setModules] = useState(init)
  const [codes, setCodes] = useState(initCodes)

  // Module form
  const [newMod, setNewMod] = useState({ title: "", description: "", order: "" })
  const [addingMod, setAddingMod] = useState(false)

  // Lesson form state per module
  const [lessonForms, setLessonForms] = useState<Record<string, { title: string; description: string; videoUrl: string; order: string }>>({})

  // Invite code gen
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
      body: JSON.stringify({ ...form, order: Number(form.order) || 0 }),
    })
    const lesson = await res.json()
    setModules((prev) =>
      prev.map((m) => m.id === moduleId ? { ...m, lessons: [...m.lessons, lesson] } : m)
    )
    setLessonForms((prev) => ({ ...prev, [moduleId]: { title: "", description: "", videoUrl: "", order: "" } }))
  }

  async function deleteLesson(moduleId: string, lessonId: string) {
    if (!confirm("Delete this lesson?")) return
    await fetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" })
    setModules((prev) =>
      prev.map((m) => m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m)
    )
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{totalStudents}</p>
            <p className="text-xs text-[#888]">Students</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{totalCompletions}</p>
            <p className="text-xs text-[#888]">Completions</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit">
        {(["modules", "codes", "students"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-[#FF6B00] text-white" : "text-[#888] hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Modules tab */}
      {tab === "modules" && (
        <div className="space-y-6">
          {/* Add module */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-semibold">Add Module</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input value={newMod.title} onChange={(e) => setNewMod((p) => ({ ...p, title: e.target.value }))}
                placeholder="Title" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B00]" />
              <input value={newMod.description} onChange={(e) => setNewMod((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B00]" />
              <div className="flex gap-2">
                <input value={newMod.order} onChange={(e) => setNewMod((p) => ({ ...p, order: e.target.value }))}
                  placeholder="Order" type="number" className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B00]" />
                <button onClick={addModule} disabled={!newMod.title || addingMod}
                  className="flex-1 bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors">
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Module list */}
          {modules.map((mod) => {
            const lf = lessonForms[mod.id] || { title: "", description: "", videoUrl: "", order: "" }
            return (
              <div key={mod.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-white/10">
                  <div>
                    <h3 className="text-white font-semibold">{mod.title}</h3>
                    <p className="text-[#888] text-xs mt-0.5">{mod.description}</p>
                  </div>
                  <button onClick={() => deleteModule(mod.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                </div>
                {/* Lessons */}
                <div className="divide-y divide-white/5">
                  {mod.lessons.map((lesson) => (
                    <div key={lesson.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">{lesson.title}</p>
                        <p className="text-[#888] text-xs">{lesson.description}</p>
                        {lesson.videoUrl && <p className="text-[#555] text-xs mt-0.5 truncate max-w-xs">{lesson.videoUrl}</p>}
                      </div>
                      <button onClick={() => deleteLesson(mod.id, lesson.id)} className="text-red-400 hover:text-red-300 text-xs ml-4">Delete</button>
                    </div>
                  ))}
                </div>
                {/* Add lesson form */}
                <div className="px-5 py-4 border-t border-white/10 bg-white/2">
                  <p className="text-xs text-[#555] mb-3 font-semibold uppercase tracking-wider">Add Lesson</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input value={lf.title} onChange={(e) => setLessonForms((p) => ({ ...p, [mod.id]: { ...lf, title: e.target.value } }))}
                      placeholder="Title" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FF6B00]" />
                    <input value={lf.description} onChange={(e) => setLessonForms((p) => ({ ...p, [mod.id]: { ...lf, description: e.target.value } }))}
                      placeholder="Description" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FF6B00]" />
                    <input value={lf.videoUrl} onChange={(e) => setLessonForms((p) => ({ ...p, [mod.id]: { ...lf, videoUrl: e.target.value } }))}
                      placeholder="Video URL (YouTube/Vimeo)" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FF6B00]" />
                    <div className="flex gap-2">
                      <input value={lf.order} onChange={(e) => setLessonForms((p) => ({ ...p, [mod.id]: { ...lf, order: e.target.value } }))}
                        placeholder="Order" type="number" className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FF6B00]" />
                      <button onClick={() => addLesson(mod.id)} disabled={!lf.title}
                        className="flex-1 bg-[#FF6B00]/20 hover:bg-[#FF6B00]/30 disabled:opacity-50 text-[#FF6B00] font-semibold rounded-lg text-xs transition-colors">
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
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-semibold">Generate Invite Codes</h2>
            <div className="flex flex-wrap gap-3">
              <select value={codeGen.tier} onChange={(e) => setCodeGen((p) => ({ ...p, tier: e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B00]">
                <option value="basic">Basic</option>
                <option value="community">Community</option>
                <option value="mentorship">Mentorship</option>
              </select>
              <input value={codeGen.quantity} onChange={(e) => setCodeGen((p) => ({ ...p, quantity: e.target.value }))}
                type="number" min="1" max="50" placeholder="Qty"
                className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B00]" />
              <button onClick={generateCodes} disabled={generating}
                className="bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
                {generating ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[#888] text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Code</th>
                  <th className="text-left px-4 py-3">Tier</th>
                  <th className="text-left px-4 py-3">Used By</th>
                  <th className="text-left px-4 py-3">Used At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {codes.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-mono text-white">{c.code}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs capitalize ${TIER_COLORS[c.tier]}`}>{c.tier}</span></td>
                    <td className="px-4 py-3 text-[#888]">{c.usedBy ? `${c.usedBy.name} (${c.usedBy.email})` : "—"}</td>
                    <td className="px-4 py-3 text-[#888]">{c.usedAt ? new Date(c.usedAt).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Students tab */}
      {tab === "students" && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[#888] text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Tier</th>
                <th className="text-left px-4 py-3">Progress</th>
                <th className="text-left px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 text-white font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-[#888]">{s.email}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs capitalize ${TIER_COLORS[s.tier]}`}>{s.tier}</span></td>
                  <td className="px-4 py-3 text-white">{s._count.progress} lessons</td>
                  <td className="px-4 py-3 text-[#888]">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#555]">No students yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
