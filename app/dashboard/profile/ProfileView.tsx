"use client"

import { useState } from "react"
import { UPGRADE_LINKS, TIER_ORDER } from "@/lib/utils"

const TIER_STYLES: Record<string, { badge: string; label: string; glow: string }> = {
  basic: {
    badge: "bg-white/10 text-white border-white/20",
    label: "Basic",
    glow: "",
  },
  community: {
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    label: "Community",
    glow: "shadow-[0_0_30px_rgba(59,130,246,0.15)]",
  },
  mentorship: {
    badge: "bg-[#FF6B00]/15 text-[#FF6B00] border-[#FF6B00]/30",
    label: "Mentorship",
    glow: "shadow-[0_0_30px_rgba(255,107,0,0.2)]",
  },
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

  const tierStyle = TIER_STYLES[currentTier] || TIER_STYLES.basic
  const upgradeLinks = UPGRADE_LINKS[currentTier] || {}
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold text-white">Your Profile</h1>

      {/* User info card */}
      <div className={`bg-[#0a0a0a] border border-white/8 rounded-2xl p-6 ${tierStyle.glow}`}>
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-xl font-bold flex-shrink-0 ${tierStyle.badge}`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-white font-bold text-xl">{name}</h2>
              <span className={`text-sm px-3 py-1 rounded-full font-bold border capitalize ${tierStyle.badge}`}>
                {tierStyle.label}
              </span>
            </div>
            <p className="text-[#888] text-sm mt-1">{email}</p>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-white/8 grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-3xl font-bold text-[#FF6B00]">{completedLessons}</p>
            <p className="text-xs text-[#888] mt-1">Lessons Completed</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-3xl font-bold text-white capitalize">{currentTier}</p>
            <p className="text-xs text-[#888] mt-1">Current Tier</p>
          </div>
        </div>
      </div>

      {/* Tier Comparison */}
      <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-bold text-lg">Your Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Basic */}
          <div className={`rounded-xl p-4 border transition-all duration-150 ${
            currentTier === 'basic'
              ? 'border-white/40 bg-white/8 ring-1 ring-white/20'
              : 'border-white/8 bg-white/3 opacity-60'
          }`}>
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-sm">Basic</span>

              </div>
              {currentTier === 'basic' && <span className="inline-block mt-1 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">YOUR PLAN</span>}
            </div>
            <ul className="space-y-1.5 text-xs text-[#888]">
              <li className="flex items-center gap-1.5"><span className="text-white">✓</span> Full course access</li>
              <li className="flex items-center gap-1.5"><span className="text-white">✓</span> Wins &amp; Results chat</li>
              <li className="flex items-center gap-1.5"><span className="text-white">✓</span> Lifetime access</li>
              <li className="flex items-center gap-1.5"><span className="text-[#555]">✗</span> Community chats</li>
              <li className="flex items-center gap-1.5"><span className="text-[#555]">✗</span> 1-on-1 with JvR</li>
            </ul>
          </div>
          {/* Community */}
          <div className={`rounded-xl p-4 border transition-all duration-150 ${
            currentTier === 'community'
              ? 'border-blue-500/50 bg-blue-500/8 ring-1 ring-blue-500/20'
              : 'border-white/8 bg-white/3 opacity-60'
          }`}>
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <span className="text-blue-400 font-bold text-sm">Community</span>
{TIER_ORDER[currentTier as keyof typeof TIER_ORDER] < TIER_ORDER['community'] && (
                  <span className="text-[#FF6B00] text-xs font-semibold">+R2,000 to upgrade</span>
                )}
              </div>
              {currentTier === 'community' && <span className="inline-block mt-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-semibold">YOUR PLAN</span>}
            </div>
            <ul className="space-y-1.5 text-xs text-[#888] mb-4">
              <li className="flex items-center gap-1.5"><span className="text-blue-400">✓</span> Everything in Basic</li>
              <li className="flex items-center gap-1.5"><span className="text-blue-400">✓</span> All community chats</li>
              <li className="flex items-center gap-1.5"><span className="text-blue-400">✓</span> Q&amp;A room access</li>
              <li className="flex items-center gap-1.5"><span className="text-blue-400">✓</span> Weekly group calls</li>
              <li className="flex items-center gap-1.5"><span className="text-[#555]">✗</span> 1-on-1 with JvR</li>
            </ul>
            {TIER_ORDER[currentTier as keyof typeof TIER_ORDER] < TIER_ORDER['community'] && UPGRADE_LINKS[currentTier]?.['community'] && (
              <a href={UPGRADE_LINKS[currentTier]['community']} target="_blank" rel="noopener noreferrer"
                className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs py-2 rounded-lg transition-colors">
                Upgrade Now →
              </a>
            )}
          </div>
          {/* Mentorship */}
          <div className={`rounded-xl p-4 border transition-all duration-150 ${
            currentTier === 'mentorship'
              ? 'border-[#FF6B00]/50 bg-[#FF6B00]/8 ring-1 ring-[#FF6B00]/20'
              : 'border-white/8 bg-white/3 opacity-60'
          }`}>
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <span className="text-[#FF6B00] font-bold text-sm">Mentorship</span>
{TIER_ORDER[currentTier as keyof typeof TIER_ORDER] < TIER_ORDER['mentorship'] && (
                  <span className="text-[#FF6B00] text-xs font-semibold">
                    {currentTier === 'basic' ? '+R6,000 to upgrade' : '+R4,000 to upgrade'}
                  </span>
                )}
              </div>
              {currentTier === 'mentorship' && <span className="inline-block mt-1 text-xs bg-[#FF6B00]/20 text-[#FF6B00] px-2 py-0.5 rounded-full font-semibold">YOUR PLAN</span>}
            </div>
            <ul className="space-y-1.5 text-xs text-[#888] mb-4">
              <li className="flex items-center gap-1.5"><span className="text-[#FF6B00]">✓</span> Everything in Community</li>
              <li className="flex items-center gap-1.5"><span className="text-[#FF6B00]">✓</span> 1-on-1 chat with JvR</li>
              <li className="flex items-center gap-1.5"><span className="text-[#FF6B00]">✓</span> 3 months mentorship</li>
              <li className="flex items-center gap-1.5"><span className="text-[#FF6B00]">✓</span> Personal strategy</li>
              <li className="flex items-center gap-1.5"><span className="text-[#FF6B00]">✓</span> Direct DM access</li>
            </ul>
            {TIER_ORDER[currentTier as keyof typeof TIER_ORDER] < TIER_ORDER['mentorship'] && UPGRADE_LINKS[currentTier]?.['mentorship'] && (
              <a href={UPGRADE_LINKS[currentTier]['mentorship']} target="_blank" rel="noopener noreferrer"
                className="block w-full text-center bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs py-2 rounded-lg transition-colors">
                Upgrade Now →
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade code */}
      <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-white font-bold text-lg">Have an Upgrade Code?</h2>
          <p className="text-[#888] text-sm mt-1">Apply a code to instantly upgrade your tier</p>
        </div>
        <form onSubmit={handleUpgrade} className="flex gap-3">
          <input
            type="text"
            value={upgradeCode}
            onChange={(e) => setUpgradeCode(e.target.value.toUpperCase())}
            placeholder="Enter upgrade code"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6B00] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.1)] transition-all duration-150 font-mono tracking-wider"
          />
          <button
            type="submit"
            disabled={!upgradeCode.trim() || upgrading}
            className="bg-[#FF6B00] hover:bg-[#e05e00] disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors duration-150"
          >
            {upgrading ? "..." : "Apply"}
          </button>
        </form>
        {upgradeMsg && (
          <p className="text-green-400 text-sm flex items-center gap-2">
            <span>✅</span> {upgradeMsg}
          </p>
        )}
        {upgradeError && (
          <p className="text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span> {upgradeError}
          </p>
        )}
      </div>

      {/* Upgrade purchase links */}
      {Object.keys(upgradeLinks).length > 0 && (
        <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-white font-bold text-lg">Upgrade Your Access</h2>
            <p className="text-[#888] text-sm mt-1">Unlock more rooms, features, and direct access</p>
          </div>
          <div className="space-y-3">
            {Object.entries(upgradeLinks).map(([targetTier, link]) => (
              <a
                key={targetTier}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-white/5 hover:bg-[#FF6B00]/8 border border-white/8 hover:border-[#FF6B00]/30 rounded-xl p-4 transition-all duration-150 group"
              >
                <div>
                  <p className="text-white font-bold capitalize">{targetTier} Tier</p>
                  <p className="text-[#888] text-sm mt-0.5">Unlock more rooms and features</p>
                </div>
                <span className="text-[#FF6B00] group-hover:translate-x-1 transition-transform duration-150 text-lg">→</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
