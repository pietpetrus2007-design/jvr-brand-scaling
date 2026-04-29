"use client"

import { useState } from "react"
import { UPGRADE_LINKS, TIER_ORDER, getUpgradeUrl } from "@/lib/utils"

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
            <p className="text-2xl font-bold text-white capitalize truncate">{currentTier}</p>
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

              <li className="flex items-center gap-1.5"><span className="text-[#555]">✗</span> Community chat rooms</li>
              <li className="flex items-center gap-1.5"><span className="text-[#555]">✗</span> Announcements from JvR</li>
              <li className="flex items-center gap-1.5"><span className="text-[#555]">✗</span> AI chat assistant</li>
              <li className="flex items-center gap-1.5"><span className="text-[#555]">✗</span> Weekly group calls</li>
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
              <span className="text-blue-400 font-bold text-sm">Community</span>
              {currentTier === 'community' && <span className="inline-block mt-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-semibold">YOUR PLAN</span>}
              {TIER_ORDER[currentTier as keyof typeof TIER_ORDER] < TIER_ORDER['community'] && (
                <p className="text-blue-400 text-xs font-semibold mt-1">+R1,999 to upgrade</p>
              )}
            </div>
            <ul className="space-y-1.5 text-xs text-[#888] mb-4">
              <li className="flex items-center gap-1.5"><span className="text-blue-400">✓</span> Everything in Basic</li>
              <li className="flex items-center gap-1.5"><span className="text-blue-400">✓</span> All community chat rooms</li>
              <li className="flex items-center gap-1.5"><span className="text-blue-400">✓</span> Announcements from JvR</li>
              <li className="flex items-center gap-1.5"><span className="text-blue-400">✓</span> AI chat assistant</li>
              <li className="flex items-center gap-1.5"><span className="text-blue-400">✓</span> Weekly group calls</li>
              <li className="flex items-center gap-1.5"><span className="text-[#555]">✗</span> 1-on-1 with JvR</li>


            </ul>
            {TIER_ORDER[currentTier as keyof typeof TIER_ORDER] < TIER_ORDER['community'] && (
              <a href={getUpgradeUrl(currentTier, 'community', email)} target="_blank" rel="noopener noreferrer"
                className="block w-full text-center bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs py-2.5 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] active:scale-95">
                ⚡ Upgrade Now →
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
              <span className="text-[#FF6B00] font-bold text-sm">Mentorship</span>
              {currentTier === 'mentorship' && <span className="inline-block mt-1 text-xs bg-[#FF6B00]/20 text-[#FF6B00] px-2 py-0.5 rounded-full font-semibold">YOUR PLAN</span>}
              {TIER_ORDER[currentTier as keyof typeof TIER_ORDER] < TIER_ORDER['mentorship'] && (
                <p className="text-[#FF6B00] text-xs font-semibold mt-1">
                  {currentTier === 'basic' ? '+R5,999 to upgrade' : '+R3,999 to upgrade'}
                </p>
              )}
            </div>
            <ul className="space-y-1.5 text-xs text-[#888] mb-4">
              <li className="flex items-center gap-1.5"><span className="text-[#FF6B00]">✓</span> Everything in Community</li>
              <li className="flex items-center gap-1.5"><span className="text-[#FF6B00]">✓</span> 1-on-1 chat with JvR</li>
              <li className="flex items-center gap-1.5"><span className="text-[#FF6B00]">✓</span> Private 1-on-1 calls with JvR</li>
              <li className="flex items-center gap-1.5"><span className="text-[#FF6B00]">✓</span> Personal strategy sessions</li>


            </ul>
            {TIER_ORDER[currentTier as keyof typeof TIER_ORDER] < TIER_ORDER['mentorship'] && (
              <a href={getUpgradeUrl(currentTier, 'mentorship', email)} target="_blank" rel="noopener noreferrer"
                className="block w-full text-center bg-[#FF6B00] hover:bg-[#ff8534] text-white font-bold text-xs py-2.5 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,0,0.6)] active:scale-95">
                ⚡ Upgrade Now →
              </a>
            )}
          </div>
        </div>

        {/* Access Info Block */}
        <div className="mt-4 space-y-3">
          <p className="text-[10px] font-bold tracking-widest uppercase text-[#555]">How Access Works — Plan by Plan</p>

          {/* Basic */}
          <div className="border border-white/8 rounded-xl bg-white/3 p-4">
            <p className="text-white font-bold text-xs mb-2">Basic</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#FF6B00]">✓</span>
                <span className="text-[#888]"><span className="text-white font-semibold">Lifetime access</span> to the full course — forever</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#555]">✗</span>
                <span className="text-[#555]">No community features</span>
              </div>
            </div>
          </div>

          {/* Community */}
          <div className="border border-blue-500/20 rounded-xl bg-blue-500/5 p-4">
            <p className="text-blue-400 font-bold text-xs mb-2">Community</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-blue-400">✓</span>
                <span className="text-[#888]"><span className="text-white font-semibold">Lifetime access</span> to the full course — forever</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-blue-400">✓</span>
                <span className="text-[#888]"><span className="text-white font-semibold">3 months</span> of community features — chat rooms, AI assistant, weekly calls & announcements</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#555]">→</span>
                <span className="text-[#555]">After 3 months: community features expire, course access remains</span>
              </div>
            </div>
          </div>

          {/* Mentorship */}
          <div className="border border-[#FF6B00]/20 rounded-xl bg-[#FF6B00]/5 p-4">
            <p className="text-[#FF6B00] font-bold text-xs mb-2">Mentorship</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#FF6B00]">✓</span>
                <span className="text-[#888]"><span className="text-white font-semibold">Lifetime access</span> to the full course — forever</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#FF6B00]">✓</span>
                <span className="text-[#888]"><span className="text-white font-semibold">1 month</span> of full mentorship — 1-on-1 calls, private chat & personal strategy</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#FF6B00]">✓</span>
                <span className="text-[#888]"><span className="text-white font-semibold">3 months</span> of community features — chat rooms, AI assistant, weekly calls & announcements</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#555]">→</span>
                <span className="text-[#555]">After month 1: 1-on-1 access ends, community continues for 2 more months</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#555]">→</span>
                <span className="text-[#555]">After month 3: community features expire, course access remains forever</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
