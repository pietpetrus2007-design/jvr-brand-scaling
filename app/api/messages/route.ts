export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { TIER_ORDER } from "@/lib/utils"

type Room = "wins" | "chatting" | "qa" | "private"

const ROOM_MIN_TIER: Record<Room, keyof typeof TIER_ORDER> = {
  wins: "basic",
  chatting: "community",
  qa: "community",
  private: "mentorship",
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const room = (url.searchParams.get("room") || "wins") as Room
  const userTier = (session.user as any).tier as keyof typeof TIER_ORDER

  if (TIER_ORDER[userTier] < TIER_ORDER[ROOM_MIN_TIER[room]]) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 })
  }

  const where: any = { room }
  if (room === "private") {
    const isAdmin = (session.user as any).role === "admin"
    if (!isAdmin) {
      where.OR = [
        { userId: session.user.id },
        { targetUserId: session.user.id },
      ]
    }
  }

  const messages = await prisma.message.findMany({
    where,
    include: { user: { select: { id: true, name: true, tier: true } } },
    orderBy: { createdAt: "asc" },
    take: 100,
  })

  return NextResponse.json(messages)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { content, room, targetUserId } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: "Content required." }, { status: 400 })

  const roomEnum = (room || "wins") as Room
  const userTier = (session.user as any).tier as keyof typeof TIER_ORDER

  if (TIER_ORDER[userTier] < TIER_ORDER[ROOM_MIN_TIER[roomEnum]]) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 })
  }

  const message = await prisma.message.create({
    data: {
      userId: session.user.id,
      content: content.trim(),
      room: roomEnum,
      targetUserId: roomEnum === "private" ? targetUserId : null,
    },
    include: { user: { select: { id: true, name: true, tier: true } } },
  })

  return NextResponse.json(message)
}
