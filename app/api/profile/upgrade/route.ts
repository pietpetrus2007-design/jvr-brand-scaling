export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { TIER_ORDER } from "@/lib/utils"
import { Tier } from "@prisma/client"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: "Code required." }, { status: 400 })

  const invite = await prisma.inviteCode.findUnique({ where: { code } })
  if (!invite) return NextResponse.json({ error: "Invalid code." }, { status: 400 })
  if (invite.usedById) return NextResponse.json({ error: "Code already used." }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 })

  const currentLevel = TIER_ORDER[user.tier as keyof typeof TIER_ORDER]
  const newLevel = TIER_ORDER[invite.tier as keyof typeof TIER_ORDER]

  if (newLevel <= currentLevel) {
    return NextResponse.json({ error: "This code does not upgrade your current tier." }, { status: 400 })
  }

  await prisma.user.update({ where: { id: user.id }, data: { tier: invite.tier as Tier } })
  await prisma.inviteCode.update({ where: { code }, data: { usedById: user.id, usedAt: new Date() } })

  return NextResponse.json({ success: true, tier: invite.tier })
}
