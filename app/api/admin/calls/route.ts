export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "admin") return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const calls = await prisma.groupCall.findMany({
    where: { isActive: true },
    orderBy: { scheduledAt: "asc" },
  })
  return NextResponse.json(calls)
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { title, scheduledAt } = await req.json()
  const randomSuffix = Math.random().toString(36).slice(2, 10)
  const roomName = `brandscaling-${randomSuffix}`
  const call = await prisma.groupCall.create({
    data: { title, scheduledAt: new Date(scheduledAt), roomName },
  })
  return NextResponse.json(call, { status: 201 })
}
