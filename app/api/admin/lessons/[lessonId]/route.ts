export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "admin") return null
  return session
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { lessonId } = await params
  const { title, description, videoUrl, order } = await req.json()
  const lesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: { title, description, videoUrl, order },
  })
  return NextResponse.json(lesson)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { lessonId } = await params
  await prisma.lesson.delete({ where: { id: lessonId } })
  return NextResponse.json({ success: true })
}
