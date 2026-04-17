export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "admin") return null
  return session
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  await prisma.groupCall.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const { action } = await req.json()

  if (action === "start") {
    const call = await prisma.groupCall.update({
      where: { id },
      data: { startedAt: new Date() },
    })
    return NextResponse.json(call)
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
