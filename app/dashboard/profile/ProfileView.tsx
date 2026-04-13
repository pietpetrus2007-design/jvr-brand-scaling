"use client"

import { useState } from "react"
import { UPGRADE_LINKS, TIER_ORDER } from "@/lib/utils"

const TIER_COLORS: Record<string, string> = {
  basic: "bg-white/10 text-white border-white/20",
  community: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  mentorship: "bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/30",
}

interface Props {
  userId: string
  name: string
  email: string
  tier: string
  completedLessons: number
}

export default function ProfileView({ userId, name, email, tier, completedLessons }: Props) {
  const [upgradeCode, setUpgradeCode] = useState("")
  const [upgradeMsg, setUpgradeMsg] = useState("")
  const [upgradeError, setUpgradeError] = useState("")
  const [upgrading, setUpgrading] = useState(false)
  const [currentTier, setCurrentTier] = useState(tier)

  async function handleUpgrade(e: React.FormEvent) {
    e.preventDefault()
    setUpgradeMsg("")
    setUpgradeError("")
    setUpgrading(true)
    const res = await fetch("/api/profile/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: upgradeCode }),
    })
    const data = await res.json()
    setUpgrading(false)
    if (!res.ok) {
      setUpgradeError(data.error)
    } else {
      setUpgradeMsg(`Upgraded to ${data.tier}!`)
      setCurrentTier(data.tier)
      setUpgradeCode("")
    }
  }

  const upgradeLinks = UPGRADE_LINKS[currentTier] || {}

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-2xl font-bold text-white">Your Profile</h1>

      {/* User info */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-white font-semibold text-lg">{name}</h2>
            <p className="text-[#888] text-sm">{email}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border capitalize ${TIER_COLORS[currentTier] || TIER_COLORS.basic}`}>
            {currentTier}
          </span>
        </div>
        <div className="flex items-center gap-6 pt-2 border-t border-white/10">
          <div>
            <p className="text-2xl font-bold text-white">{completedLessons}</p>
            <p className="text-xs text-[#888]">Lessons Completed</p>
          </div>
        </div>
      </div>

      {/* Upgrade via code */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-semibold">Have an Upgrade Code?</h2>
        <form onSubmit={handleUpgrade} className="flex gap-3">
          <input
            type="text"
            value={upgradeCode}
            onChange={(e) => setUpgradeCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF6B00] transition-colors font-mono"
          />
          <button
            type="submit"
            disabled={!upgradeCode.trim() || upgrading}
            className="bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
          >
            {upgrading ? "..." : "Apply"}
          </button>
        </form>
        {upgradeMsg && <p className="text-green-400 text-sm">{upgradeMsg}</p>}
        {upgradeError && <p className="text-red-400 text-sm">{upgradeError}</p>}
      </div>

      {/* Upgrade purchase links */}
      {Object.keys(upgradeLinks).length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold">Upgrade Your Access</h2>
          <div className="space-y-3">
            {Object.entries(upgradeLinks).map(([targetTier, link]) => (
              <a
                key={targetTier}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-colors group"
              >
                <div>
                  <p className="text-white font-semibold capitalize">{targetTier} Tier</p>
                  <p className="text-[#888] text-sm">Unlock more rooms and features</p>
                </div>
                <span className="text-[#FF6B00] group-hover:translate-x-1 transition-transform">→</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
