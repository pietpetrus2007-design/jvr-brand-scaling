export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "admin") return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const [totalStudents, totalCompletions, students] = await Promise.all([
    prisma.user.count({ where: { role: "student" } }),
    prisma.progress.count(),
    prisma.user.findMany({
      where: { role: "student" },
      select: { id: true, name: true, email: true, tier: true, createdAt: true, progress: { select: { lessonId: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return NextResponse.json({ totalStudents, totalCompletions, students })
}
