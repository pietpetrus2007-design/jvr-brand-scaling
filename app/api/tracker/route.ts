export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const entries = await prisma.progressEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const {
    businessesOutreached = 0,
    conversationsStarted = 0,
    potentialClients = 0,
    activeClients = 0,
    paymentsReceived = 0,
    paymentsValue = 0,
    moodScore = 5,
    notes,
  } = body

  const entry = await prisma.progressEntry.create({
    data: {
      userId: session.user.id,
      businessesOutreached: Number(businessesOutreached),
      conversationsStarted: Number(conversationsStarted),
      potentialClients: Number(potentialClients),
      activeClients: Number(activeClients),
      paymentsReceived: Number(paymentsReceived),
      paymentsValue: Number(paymentsValue),
      moodScore: Math.min(10, Math.max(1, Number(moodScore))),
      notes: notes?.trim() || null,
    },
  })

  return NextResponse.json(entry, { status: 201 })
}
