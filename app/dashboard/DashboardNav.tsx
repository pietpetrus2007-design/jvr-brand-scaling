"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

interface Props {
  user: { name?: string | null; email?: string | null; role?: string; tier?: string }
  hasUnreadAnnouncements?: boolean
}

const TIER_STYLES: Record<string, string> = {
  basic: "bg-[#888]/15 text-[#888] border-[#888]/30",
  community: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  mentorship: "bg-[#FF6B00]/15 text-[#FF6B00] border-[#FF6B00]/30",
}

const AVATAR_STYLES: Record<string, string> = {
  basic: "bg-[#888]/20 border-[#888]/30 text-[#888]",
  community: "bg-blue-500/20 border-blue-500/30 text-blue-400",
  mentorship: "bg-[#FF6B00]/20 border-[#FF6B00]/30 text-[#FF6B00]",
}

export default function DashboardNav({ user, hasUnreadAnnouncements }: Props) {
  const pathname = usePathname()

  const links: { href: string; label: string; icon: string; unread?: boolean }[] = [
    { href: "/dashboard", label: "Course", icon: "📚" },
    { href: "/dashboard/community", label: "Community", icon: "💬" },
    { href: "/dashboard/tracker", label: "Tracker", icon: "📊" },
    { href: "/dashboard/ask", label: "Ask AI", icon: "🤖" },
    { href: "/dashboard/announcements", label: "Announcements", icon: "📢", unread: hasUnreadAnnouncements },
    { href: "/dashboard/mentorship", label: "Mentorship", icon: "🎯" },
    { href: "/dashboard/profile", label: "Profile", icon: "👤" },
    ...(user.role === "admin" ? [{ href: "/admin", label: "Admin", icon: "⚙️" }] : []),
  ]

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  return (
    <nav className="border-b border-white/8 bg-black/90 backdrop-blur sticky top-0 z-40">
      <div className="w-full px-6 flex items-center justify-between h-14">
        {/* Logo + links */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-bold text-base tracking-tight flex-shrink-0">
            <span className="text-[#FF6B00]">JvR</span>
            <span className="text-white"> Brand Scaling</span>
          </Link>
          <div className="hidden sm:flex items-center gap-0.5">
            {links.map((l) => {
              const isActive = pathname === l.href
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? "bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/25"
                      : "text-[#888] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="relative inline-flex items-center gap-1">
                    <span className="mr-1">{l.icon}</span>{l.label}
                    {l.unread && <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-red-500" />}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* User section */}
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border capitalize hidden sm:inline-flex ${TIER_STYLES[user.tier || "basic"]}`}>
            {user.tier}
          </span>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold ${AVATAR_STYLES[user.tier || 'basic']}`}>
              {initials}
            </div>
            <span className="text-sm text-white font-medium hidden md:block truncate max-w-[100px]">
              {user.name?.split(" ")[0]}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs text-[#888] hover:text-white transition-colors duration-150 flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>

      {/* Mobile bottom nav links */}
      <div className="sm:hidden flex items-center border-t border-white/5 overflow-x-auto">
        {links.map((l) => {
          const isActive = pathname === l.href
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors duration-150 px-1 ${
                isActive ? "text-[#FF6B00] border-b-2 border-[#FF6B00]" : "text-[#888]"
              }`}
            >
              <span className="relative">
                <span className="text-base">{l.icon}</span>
                {l.unread && <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-red-500" />}
              </span>
              <span className="text-[10px] mt-0.5">{l.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
