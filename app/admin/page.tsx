export const dynamic = 'force-dynamic'
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import AdminView from "./AdminView"

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "admin") redirect("/dashboard")

  const [modules, codes, stats, announcements] = await Promise.all([
    prisma.module.findMany({
      include: { lessons: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    }),
    prisma.inviteCode.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { usedBy: { select: { name: true, email: true } } },
    }),
    Promise.all([
      prisma.user.count({ where: { role: "student" } }),
      prisma.progress.count(),
      prisma.user.findMany({
        where: { role: "student" },
        select: { id: true, name: true, email: true, tier: true, createdAt: true, _count: { select: { progress: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]),
    prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
  ])

  const [totalStudents, totalCompletions, students] = stats

  return (
    <AdminView
      modules={modules as any}
      codes={codes as any}
      totalStudents={totalStudents}
      totalCompletions={totalCompletions}
      students={students as any}
      announcements={announcements as any}
    />
  )
}
