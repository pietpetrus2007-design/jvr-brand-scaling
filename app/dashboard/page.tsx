export const dynamic = 'force-dynamic'
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import CourseView from "./CourseView"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id as string

  const [modules, progressRecords] = await Promise.all([
    prisma.module.findMany({
      include: { lessons: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    }),
    prisma.progress.findMany({ where: { userId }, select: { lessonId: true } }),
  ])

  const completedIds = progressRecords.map((p: { lessonId: string }) => p.lessonId)

  return <CourseView modules={modules} completedIds={completedIds} userId={userId} />
}
