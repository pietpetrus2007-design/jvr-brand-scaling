"use client"
import { useState, useEffect, useRef, useCallback } from "react"

interface Lead {
  id: string
  businessName: string
  niche: string
  social: string
  phone: string
  city: string
  website: string
  email: string
  source: string
  notes: string
  runningAds: boolean
  contacted: boolean
  replied: boolean
  followedUp: boolean
  bookedCall: boolean
  createdAt: string
}

type TextField = "businessName" | "niche" | "social" | "phone" | "city" | "website" | "email" | "source" | "notes"
type BoolField = "runningAds" | "contacted" | "replied" | "followedUp" | "bookedCall"

const DEFAULT_COLS: { key: TextField; label: string; width: number }[] = [
  { key: "businessName", label: "Business Name", width: 160 },
  { key: "niche", label: "Niche", width: 130 },
  { key: "social", label: "Instagram / Social", width: 150 },
  { key: "phone", label: "Phone", width: 130 },
]

const BOOL_COLS: { key: BoolField; label: string; width: number }[] = [
  { key: "runningAds", label: "Ads?", width: 70 },
  { key: "replied", label: "Replied?", width: 80 },
  { key: "followedUp", label: "Follow-Up?", width: 90 },
]

const EXTRA_TEXT_COLS: { key: TextField; label: string; width: number }[] = [
  { key: "city", label: "City", width: 120 },
  { key: "website", label: "Website", width: 140 },
  { key: "email", label: "Email", width: 160 },
  { key: "source", label: "Source", width: 120 },
  { key: "notes", label: "Notes", width: 180 },
]

const EXTRA_BOOL_COLS: { key: BoolField; label: string; width: number }[] = [
  { key: "contacted", label: "Contacted?", width: 90 },
  { key: "bookedCall", label: "Booked Call?", width: 100 },
]

const EMPTY_LEAD = (): Omit<Lead, 'id' | 'createdAt'> => ({
  businessName: "", niche: "", social: "", phone: "",
  city: "", website: "", email: "", source: "", notes: "",
  runningAds: false, contacted: false, replied: false, followedUp: false, bookedCall: false
})

// Number of blank rows to always show at the bottom
const BLANK_ROWS = 8

export default function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [extraTextCols, setExtraTextCols] = useState<string[]>([])
  const [extraBoolCols, setExtraBoolCols] = useState<string[]>([])
  const [showAddCol, setShowAddCol] = useState(false)
  const [saving, setSaving] = useState<Set<string>>(new Set())

  // Draft rows: keyed by rowIndex (for blank rows at bottom)
  const [drafts, setDrafts] = useState<Record<number, Partial<Omit<Lead, 'id' | 'createdAt'>>>>({})
  const cellRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    fetch("/api/leads").then(r => r.json()).then(data => {
      setLeads(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const visibleTextCols = [...DEFAULT_COLS, ...EXTRA_TEXT_COLS.filter(c => extraTextCols.includes(c.key))]
  const visibleBoolCols = [...BOOL_COLS, ...EXTRA_BOOL_COLS.filter(c => extraBoolCols.includes(c.key))]
  const allCols = [...visibleTextCols, ...visibleBoolCols]
  const availableExtra = [
    ...EXTRA_TEXT_COLS.filter(c => !extraTextCols.includes(c.key)),
    ...EXTRA_BOOL_COLS.filter(c => !extraBoolCols.includes(c.key)),
  ]

  // Save an existing lead field
  async function saveField(id: string, field: string, value: string | boolean) {
    setSaving(prev => new Set(prev).add(id))
    setLeads(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value })
    })
    setSaving(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  // Commit a draft blank row to DB
  async function commitDraft(rowIdx: number) {
    const draft = drafts[rowIdx]
    if (!draft) return
    const hasContent = Object.values(draft).some(v => typeof v === 'string' ? v.trim() : false)
    if (!hasContent) return

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...EMPTY_LEAD(), ...draft })
    })
    const created = await res.json()
    setLeads(prev => [...prev, created])
    setDrafts(prev => { const d = { ...prev }; delete d[rowIdx]; return d })
  }

  function updateDraft(rowIdx: number, field: string, value: string) {
    setDrafts(prev => ({ ...prev, [rowIdx]: { ...(prev[rowIdx] || {}), [field]: value } }))
  }

  // Navigate cells with Tab/Enter/Arrow keys
  function handleKeyNav(e: React.KeyboardEvent, rowIdx: number, colIdx: number, isExisting: boolean) {
    const totalCols = visibleTextCols.length
    const totalRows = leads.length + BLANK_ROWS

    let nextRow = rowIdx
    let nextCol = colIdx

    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault()
      if (e.shiftKey) {
        nextCol = colIdx - 1
        if (nextCol < 0) { nextCol = totalCols - 1; nextRow = rowIdx - 1 }
      } else {
        nextCol = colIdx + 1
        if (nextCol >= totalCols) { nextCol = 0; nextRow = rowIdx + 1 }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault(); nextRow = rowIdx + 1
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); nextRow = rowIdx - 1
    } else {
      return
    }

    nextRow = Math.max(0, Math.min(totalRows - 1, nextRow))
    nextCol = Math.max(0, Math.min(totalCols - 1, nextCol))
    const ref = cellRefs.current[`${nextRow}-${nextCol}`]
    if (ref) { ref.focus(); ref.select() }
  }

  async function deleteLead(id: string) {
    setLeads(prev => prev.filter(l => l.id !== id))
    await fetch(`/api/leads/${id}`, { method: "DELETE" })
  }

  const totalLeads = leads.length

  return (
    <div className="w-full px-2 py-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-2">
        <div>
          <h1 className="text-white font-black text-2xl">📋 Lead Sheet</h1>
          <p className="text-[#888] text-sm mt-0.5">{totalLeads} lead{totalLeads !== 1 ? 's' : ''}</p>
        </div>
        {availableExtra.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowAddCol(!showAddCol)}
              className="text-xs text-[#888] hover:text-white border border-white/10 hover:border-white/20 px-3 py-2 rounded-lg transition-colors"
            >
              + Add Column
            </button>
            {showAddCol && (
              <div className="absolute right-0 top-full mt-1 bg-[#111] border border-white/10 rounded-xl p-2 z-50 min-w-[160px] shadow-xl">
                {availableExtra.map(c => (
                  <button
                    key={c.key}
                    onClick={() => {
                      if (EXTRA_TEXT_COLS.find(x => x.key === c.key)) setExtraTextCols(prev => [...prev, c.key])
                      else setExtraBoolCols(prev => [...prev, c.key])
                      setShowAddCol(false)
                    }}
                    className="w-full text-left text-sm text-[#888] hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-colors"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Spreadsheet */}
      <div className="overflow-x-auto rounded-xl border border-white/8">
        <table className="border-collapse" style={{ tableLayout: 'fixed', minWidth: '100%' }}>
          <colgroup>
            <col style={{ width: 32 }} />
            {visibleTextCols.map(c => <col key={c.key} style={{ width: c.width }} />)}
            {visibleBoolCols.map(c => <col key={c.key} style={{ width: c.width }} />)}
            <col style={{ width: 36 }} />
          </colgroup>
          <thead>
            <tr className="bg-[#0d0d0d] border-b border-white/8">
              <th className="px-2 py-2 text-[#444] text-xs font-mono">#</th>
              {visibleTextCols.map((c, i) => (
                <th key={c.key} className={`px-3 py-2 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap ${i === 0 ? 'text-[#FF6B00]' : 'text-[#666]'}`}>
                  {c.label}
                </th>
              ))}
              {visibleBoolCols.map(c => (
                <th key={c.key} className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-[#666] whitespace-nowrap">
                  <span className="flex items-center justify-center gap-1">
                    {c.label}
                    {EXTRA_BOOL_COLS.find(x => x.key === c.key) && (
                      <button onClick={() => setExtraBoolCols(prev => prev.filter(k => k !== c.key))} className="text-[#333] hover:text-red-400 ml-1">×</button>
                    )}
                  </span>
                </th>
              ))}
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={99} className="px-4 py-8 text-center text-[#555] text-sm">Loading...</td></tr>
            ) : (
              <>
                {/* Existing lead rows */}
                {leads.map((lead, rowIdx) => (
                  <tr key={lead.id} className={`border-b border-white/5 group ${rowIdx % 2 === 0 ? 'bg-[#080808]' : 'bg-[#0a0a0a]'}`}>
                    <td className="px-2 py-0 text-center text-[#333] text-xs font-mono">{rowIdx + 1}</td>
                    {visibleTextCols.map((col, colIdx) => (
                      <td key={col.key} className="p-0 border-r border-white/5">
                        <input
                          ref={el => { cellRefs.current[`${rowIdx}-${colIdx}`] = el }}
                          value={(lead[col.key as keyof Lead] as string) || ""}
                          onChange={e => setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, [col.key]: e.target.value } : l))}
                          onBlur={e => saveField(lead.id, col.key, e.target.value)}
                          onKeyDown={e => handleKeyNav(e, rowIdx, colIdx, true)}
                          className="w-full h-9 px-3 bg-transparent text-white text-xs outline-none focus:bg-[#FF6B00]/8 focus:ring-1 focus:ring-[#FF6B00]/30 placeholder-[#333] transition-colors"
                          style={{ fontSize: '13px' }}
                          placeholder={colIdx === 0 ? "Type here..." : ""}
                        />
                      </td>
                    ))}
                    {visibleBoolCols.map(col => (
                      <td key={col.key} className="p-0 border-r border-white/5">
                        <div className="flex justify-center items-center h-9">
                          <button
                            onClick={() => saveField(lead.id, col.key, !(lead[col.key as keyof Lead] as boolean))}
                            className={`w-9 h-5 rounded-full transition-all duration-200 relative ${(lead[col.key as keyof Lead] as boolean) ? 'bg-[#FF6B00]' : 'bg-white/10'}`}
                          >
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200 ${(lead[col.key as keyof Lead] as boolean) ? 'right-0.5' : 'left-0.5'}`} />
                          </button>
                        </div>
                      </td>
                    ))}
                    <td className="px-2 py-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => deleteLead(lead.id)} className="text-[#444] hover:text-red-400 transition-colors text-base leading-none">×</button>
                    </td>
                  </tr>
                ))}

                {/* Blank rows for continuous entry */}
                {Array.from({ length: BLANK_ROWS }).map((_, blankIdx) => {
                  const rowIdx = leads.length + blankIdx
                  const draft = drafts[rowIdx] || {}
                  return (
                    <tr key={`blank-${blankIdx}`} className={`border-b border-white/3 ${blankIdx % 2 === 0 ? 'bg-[#080808]' : 'bg-[#0a0a0a]'}`}>
                      <td className="px-2 py-0 text-center text-[#222] text-xs font-mono">{rowIdx + 1}</td>
                      {visibleTextCols.map((col, colIdx) => (
                        <td key={col.key} className="p-0 border-r border-white/5">
                          <input
                            ref={el => { cellRefs.current[`${rowIdx}-${colIdx}`] = el }}
                            value={(draft[col.key as keyof typeof draft] as string) || ""}
                            onChange={e => updateDraft(rowIdx, col.key, e.target.value)}
                            onBlur={() => commitDraft(rowIdx)}
                            onKeyDown={e => handleKeyNav(e, rowIdx, colIdx, false)}
                            className="w-full h-9 px-3 bg-transparent text-white text-xs outline-none focus:bg-[#FF6B00]/5 focus:ring-1 focus:ring-[#FF6B00]/20 placeholder-[#222] transition-colors"
                            style={{ fontSize: '13px' }}
                            placeholder={colIdx === 0 && blankIdx === 0 ? "Start typing..." : ""}
                          />
                        </td>
                      ))}
                      {visibleBoolCols.map(col => <td key={col.key} className="border-r border-white/5" />)}
                      <td />
                    </tr>
                  )
                })}
              </>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[#333] text-xs px-2">Tab / Enter to move between cells · Arrow keys to navigate · Click toggles for status</p>
    </div>
  )
}
