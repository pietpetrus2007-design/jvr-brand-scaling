export const dynamic = 'force-dynamic'
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import CourseView from "./CourseView"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [modules, progressRecords] = await Promise.all([
    prisma.module.findMany({
      include: { lessons: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    }),
    prisma.progress.findMany({ where: { userId: session.user.id }, select: { lessonId: true } }),
  ])

  const completedIds = new Set(progressRecords.map((p) => p.lessonId))

  return <CourseView modules={modules} completedIds={Array.from(completedIds)} userId={session.user.id} />
}
