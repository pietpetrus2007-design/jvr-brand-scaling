export const dynamic = 'force-dynamic'
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import TrackerView from "./TrackerView"

export default async function TrackerPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id as string

  const [totalLessons, completedCount, entries, leaderboard, communityStats] = await Promise.all([
    prisma.lesson.count(),
    prisma.progress.count({ where: { userId } }),
    prisma.progressEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    // Top earners (aggregate per user)
    prisma.progressEntry.groupBy({
      by: ['userId'],
      _sum: { paymentsValue: true, paymentsReceived: true },
      orderBy: { _sum: { paymentsValue: 'desc' } },
      take: 10,
    }),
    // Community totals
    prisma.progressEntry.aggregate({
      _sum: { paymentsValue: true, paymentsReceived: true },
      _count: { userId: true },
    }),
  ])

  // Get names for leaderboard
  const userIds = leaderboard.map((l: any) => l.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true }
  })
  const userMap = Object.fromEntries(users.map((u: any) => [u.id, u.name]))

  const leaderboardData = leaderboard.map((l: any, i: number) => ({
    rank: i + 1,
    name: userMap[l.userId] || 'Student',
    revenue: l._sum.paymentsValue || 0,
    payments: l._sum.paymentsReceived || 0,
    isMe: l.userId === userId,
  }))

  const allUnlocked = true
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  return (
    <TrackerView
      unlocked={allUnlocked}
      completionPct={pct}
      initialEntries={entries as any}
      leaderboard={leaderboardData}
      communityRevenue={communityStats._sum.paymentsValue || 0}
      communityPayments={communityStats._sum.paymentsReceived || 0}
    />
  )
}
