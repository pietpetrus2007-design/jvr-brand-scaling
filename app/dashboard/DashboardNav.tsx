"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

interface Props {
  user: { name?: string | null; email?: string | null; role?: string; tier?: string }
}

const TIER_COLORS: Record<string, string> = {
  basic: "bg-white/10 text-white",
  community: "bg-blue-500/20 text-blue-400",
  mentorship: "bg-[#FF6B00]/20 text-[#FF6B00]",
}

export default function DashboardNav({ user }: Props) {
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "Course" },
    { href: "/dashboard/community", label: "Community" },
    { href: "/dashboard/profile", label: "Profile" },
    ...(user.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ]

  return (
    <nav className="border-b border-white/10 bg-black/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-white font-bold text-base tracking-tight">JvR</Link>
          <div className="flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  pathname === l.href ? "bg-white/10 text-white" : "text-[#888] hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${TIER_COLORS[user.tier || "basic"]}`}>
            {user.tier}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs text-[#888] hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
