export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "admin") return null
  return session
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ moduleId: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { moduleId } = await params
  const { title, description, order } = await req.json()
  const mod = await prisma.module.update({ where: { id: moduleId }, data: { title, description, order } })
  return NextResponse.json(mod)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ moduleId: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { moduleId } = await params
  await prisma.module.delete({ where: { id: moduleId } })
  return NextResponse.json({ success: true })
}
