export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Tier } from "@prisma/client"
import { nanoid } from "nanoid"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "admin") return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const codes = await prisma.inviteCode.findMany({ orderBy: { createdAt: "desc" }, include: { usedBy: { select: { name: true, email: true } } } })
  return NextResponse.json(codes)
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { tier, quantity } = await req.json()
  const count = Math.min(Number(quantity) || 1, 50)
  const codes = []
  for (let i = 0; i < count; i++) {
    const prefix = tier === "mentorship" ? "MENT" : tier === "community" ? "COMM" : "BASIC"
    const code = `${prefix}-${nanoid(6).toUpperCase()}`
    const created = await prisma.inviteCode.create({ data: { code, tier: tier as Tier } })
    codes.push(created)
  }
  return NextResponse.json(codes)
}
