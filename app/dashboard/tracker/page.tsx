export const dynamic = 'force-dynamic'
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import TrackerView from "./TrackerView"

export default async function TrackerPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id as string

  const [totalLessons, completedCount, entries] = await Promise.all([
    prisma.lesson.count(),
    prisma.progress.count({ where: { userId } }),
    prisma.progressEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const allUnlocked = completedCount >= totalLessons && totalLessons > 0
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  return (
    <TrackerView
      unlocked={allUnlocked}
      completionPct={pct}
      initialEntries={entries as any}
    />
  )
}
