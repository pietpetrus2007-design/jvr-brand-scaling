export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "admin") return null
  return session
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ moduleId: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { moduleId } = await params
  const { title, description, videoUrl, order } = await req.json()
  const lesson = await prisma.lesson.create({
    data: { moduleId, title, description, videoUrl: videoUrl || "", order: order || 0 },
  })
  return NextResponse.json(lesson)
}
