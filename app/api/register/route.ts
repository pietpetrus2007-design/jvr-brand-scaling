export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { TIER_ORDER } from "@/lib/utils"

type Tier = "basic" | "community" | "mentorship"

export async function POST(req: NextRequest) {
  const { code, name, email, password } = await req.json()

  if (!code || !name || !email || !password) {
    return NextResponse.json({ error: "All fields required." }, { status: 400 })
  }

  const invite = await prisma.inviteCode.findUnique({ where: { code } })
  if (!invite) return NextResponse.json({ error: "Invalid invite code." }, { status: 400 })
  if (invite.usedById) return NextResponse.json({ error: "This code has already been used." }, { status: 400 })

  const existingUser = await prisma.user.findUnique({ where: { email } })

  if (existingUser) {
    const existingTierLevel = TIER_ORDER[existingUser.tier as keyof typeof TIER_ORDER]
    const newTierLevel = TIER_ORDER[invite.tier as keyof typeof TIER_ORDER]

    if (newTierLevel > existingTierLevel) {
      // Upgrade existing user
      await prisma.user.update({
        where: { email },
        data: { tier: invite.tier as Tier },
      })
      await prisma.inviteCode.update({
        where: { code },
        data: { usedById: existingUser.id, usedAt: new Date() },
      })
      return NextResponse.json({ upgraded: true, message: "Your account has been upgraded." })
    } else {
      return NextResponse.json({ error: "An account with this email already exists at this or a higher tier." }, { status: 400 })
    }
  }

  // New user
  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      tier: invite.tier as Tier,
    },
  })
  await prisma.inviteCode.update({
    where: { code },
    data: { usedById: user.id, usedAt: new Date() },
  })

  return NextResponse.json({ success: true })
}
