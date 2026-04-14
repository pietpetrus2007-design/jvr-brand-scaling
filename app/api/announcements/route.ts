export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  })

  return NextResponse.json(announcements)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, content, imageUrl } = await req.json()
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
  }

  const announcement = await prisma.announcement.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl || null,
      userId: session.user.id,
    },
    include: { user: { select: { name: true } } },
  })

  return NextResponse.json(announcement)
}
