"use client"
import { useState, useEffect } from "react"

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

const EXTRA_COLS = [
  { key: "city", label: "City" },
  { key: "website", label: "Website" },
  { key: "email", label: "Email" },
  { key: "source", label: "Source" },
  { key: "contacted", label: "Contacted?", type: "bool" },
  { key: "bookedCall", label: "Booked Call?", type: "bool" },
  { key: "notes", label: "Notes" },
]

const EMPTY: Omit<Lead, 'id' | 'createdAt'> = {
  businessName: "", niche: "", social: "", phone: "",
  city: "", website: "", email: "", source: "", notes: "",
  runningAds: false, contacted: false, replied: false, followedUp: false, bookedCall: false
}

export default function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newLead, setNewLead] = useState({ ...EMPTY })
  const [extraCols, setExtraCols] = useState<string[]>([])
  const [showAddCol, setShowAddCol] = useState(false)
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null)
  const [editVal, setEditVal] = useState("")

  useEffect(() => {
    fetch("/api/leads").then(r => r.json()).then(data => {
      setLeads(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function addLead() {
    if (!newLead.businessName.trim()) return
    setAdding(true)
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLead)
    })
    const created = await res.json()
    setLeads(prev => [created, ...prev])
    setNewLead({ ...EMPTY })
    setAdding(false)
  }

  async function toggleBool(id: string, field: string, current: boolean) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, [field]: !current } : l))
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !current })
    })
  }

  async function deleteLead(id: string) {
    setLeads(prev => prev.filter(l => l.id !== id))
    await fetch(`/api/leads/${id}`, { method: "DELETE" })
  }

  async function saveCell(id: string, field: string, value: string) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
    setEditingCell(null)
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value })
    })
  }

  function startEdit(id: string, field: string, current: string) {
    setEditingCell({ id, field })
    setEditVal(current)
  }

  const visibleExtraCols = EXTRA_COLS.filter(c => extraCols.includes(c.key))
  const availableToAdd = EXTRA_COLS.filter(c => !extraCols.includes(c.key))

  const BoolCell = ({ lead, field }: { lead: Lead; field: keyof Lead }) => {
    const val = lead[field] as boolean
    return (
      <button
        onClick={() => toggleBool(lead.id, field, val)}
        className={`w-8 h-5 rounded-full transition-all duration-200 flex-shrink-0 ${val ? 'bg-[#FF6B00]' : 'bg-white/10'}`}
      >
        <span className={`block w-4 h-4 bg-white rounded-full transition-all duration-200 mx-auto ${val ? 'translate-x-1.5' : '-translate-x-1.5'}`} />
      </button>
    )
  }

  const TextCell = ({ lead, field }: { lead: Lead; field: keyof Lead }) => {
    const val = (lead[field] as string) || ""
    const isEditing = editingCell?.id === lead.id && editingCell?.field === field
    if (isEditing) {
      return (
        <input
          autoFocus
          value={editVal}
          onChange={e => setEditVal(e.target.value)}
          onBlur={() => saveCell(lead.id, field, editVal)}
          onKeyDown={e => { if (e.key === 'Enter') saveCell(lead.id, field, editVal); if (e.key === 'Escape') setEditingCell(null) }}
          className="w-full bg-[#1a1a1a] border border-[#FF6B00]/50 rounded px-2 py-1 text-white text-xs outline-none"
          style={{ fontSize: '13px' }}
        />
      )
    }
    return (
      <button
        onClick={() => startEdit(lead.id, field, val)}
        className="w-full text-left text-xs text-[#ccc] hover:text-white px-1 py-0.5 rounded hover:bg-white/5 transition-colors truncate"
      >
        {val || <span className="text-[#444]">—</span>}
      </button>
    )
  }

  return (
    <div className="w-full px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-white font-black text-2xl">📋 Lead Sheet</h1>
          <p className="text-[#888] text-sm mt-0.5">{leads.length} lead{leads.length !== 1 ? 's' : ''} tracked</p>
        </div>
        <div className="flex items-center gap-2">
          {availableToAdd.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowAddCol(!showAddCol)}
                className="text-xs text-[#888] hover:text-white border border-white/10 hover:border-white/20 px-3 py-2 rounded-lg transition-colors"
              >
                + Add Column
              </button>
              {showAddCol && (
                <div className="absolute right-0 top-full mt-1 bg-[#111] border border-white/10 rounded-xl p-2 z-50 min-w-[160px] shadow-xl">
                  {availableToAdd.map(c => (
                    <button
                      key={c.key}
                      onClick={() => { setExtraCols(prev => [...prev, c.key]); setShowAddCol(false) }}
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
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/8">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#0d0d0d] border-b border-white/8">
              <th className="text-left px-4 py-3 text-xs font-bold text-[#FF6B00] uppercase tracking-wider whitespace-nowrap">Business</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#888] uppercase tracking-wider whitespace-nowrap">Niche</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#888] uppercase tracking-wider whitespace-nowrap">Instagram / Social</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#888] uppercase tracking-wider whitespace-nowrap">Phone</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-[#888] uppercase tracking-wider whitespace-nowrap">Ads?</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-[#888] uppercase tracking-wider whitespace-nowrap">Replied?</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-[#888] uppercase tracking-wider whitespace-nowrap">Follow-Up?</th>
              {visibleExtraCols.map(c => (
                <th key={c.key} className="text-left px-4 py-3 text-xs font-bold text-[#888] uppercase tracking-wider whitespace-nowrap">
                  <span className="flex items-center gap-2">
                    {c.label}
                    <button onClick={() => setExtraCols(prev => prev.filter(k => k !== c.key))} className="text-[#444] hover:text-red-400 text-xs">×</button>
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {/* Add new row */}
            <tr className="border-b border-white/5 bg-[#FF6B00]/4">
              <td className="px-4 py-2">
                <input
                  value={newLead.businessName}
                  onChange={e => setNewLead(p => ({ ...p, businessName: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addLead()}
                  placeholder="Business name..."
                  className="w-full bg-transparent border-b border-[#FF6B00]/30 text-white text-xs placeholder-[#555] outline-none py-1 focus:border-[#FF6B00]"
                  style={{ fontSize: '13px' }}
                />
              </td>
              <td className="px-4 py-2">
                <input value={newLead.niche} onChange={e => setNewLead(p => ({ ...p, niche: e.target.value }))} placeholder="Niche..." className="w-full bg-transparent border-b border-white/10 text-white text-xs placeholder-[#444] outline-none py-1" style={{ fontSize: '13px' }} />
              </td>
              <td className="px-4 py-2">
                <input value={newLead.social} onChange={e => setNewLead(p => ({ ...p, social: e.target.value }))} placeholder="@handle" className="w-full bg-transparent border-b border-white/10 text-white text-xs placeholder-[#444] outline-none py-1" style={{ fontSize: '13px' }} />
              </td>
              <td className="px-4 py-2">
                <input value={newLead.phone} onChange={e => setNewLead(p => ({ ...p, phone: e.target.value }))} placeholder="Phone..." className="w-full bg-transparent border-b border-white/10 text-white text-xs placeholder-[#444] outline-none py-1" style={{ fontSize: '13px' }} />
              </td>
              <td className="px-4 py-2 text-center" />
              <td className="px-4 py-2 text-center" />
              <td className="px-4 py-2 text-center" />
              {visibleExtraCols.map(c => <td key={c.key} className="px-4 py-2" />)}
              <td className="px-4 py-2">
                <button
                  onClick={addLead}
                  disabled={adding || !newLead.businessName.trim()}
                  className="bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-40 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                >
                  {adding ? "..." : "+ Add"}
                </button>
              </td>
            </tr>

            {loading ? (
              <tr><td colSpan={99} className="px-4 py-8 text-center text-[#555] text-sm">Loading...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={99} className="px-4 py-10 text-center text-[#555] text-sm">No leads yet. Add your first one above ↑</td></tr>
            ) : leads.map((lead, idx) => (
              <tr key={lead.id} className={`border-b border-white/5 transition-colors hover:bg-white/3 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.015]'}`}>
                <td className="px-4 py-2 min-w-[140px]"><TextCell lead={lead} field="businessName" /></td>
                <td className="px-4 py-2 min-w-[120px]"><TextCell lead={lead} field="niche" /></td>
                <td className="px-4 py-2 min-w-[140px]"><TextCell lead={lead} field="social" /></td>
                <td className="px-4 py-2 min-w-[120px]"><TextCell lead={lead} field="phone" /></td>
                <td className="px-4 py-2 text-center"><BoolCell lead={lead} field="runningAds" /></td>
                <td className="px-4 py-2 text-center"><BoolCell lead={lead} field="replied" /></td>
                <td className="px-4 py-2 text-center"><BoolCell lead={lead} field="followedUp" /></td>
                {visibleExtraCols.map(c => (
                  <td key={c.key} className="px-4 py-2 min-w-[120px]">
                    {c.type === 'bool'
                      ? <BoolCell lead={lead} field={c.key as keyof Lead} />
                      : <TextCell lead={lead} field={c.key as keyof Lead} />
                    }
                  </td>
                ))}
                <td className="px-4 py-2">
                  <button onClick={() => deleteLead(lead.id)} className="text-[#444] hover:text-red-400 transition-colors text-base leading-none">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[#444] text-xs">Click any cell to edit · Toggle switches for status · × to delete</p>
    </div>
  )
}
