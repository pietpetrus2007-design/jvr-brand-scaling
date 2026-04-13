export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: "Code required." }, { status: 400 })

  const invite = await prisma.inviteCode.findUnique({ where: { code } })
  if (!invite) return NextResponse.json({ error: "Invalid invite code." }, { status: 400 })
  if (invite.usedById) return NextResponse.json({ error: "This code has already been used." }, { status: 400 })

  return NextResponse.json({ tier: invite.tier })
}
