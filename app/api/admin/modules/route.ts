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
  const modules = await prisma.module.findMany({
    include: { lessons: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  })
  return NextResponse.json(modules)
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { title, description, order } = await req.json()
  const mod = await prisma.module.create({ data: { title, description, order: order || 0 } })
  return NextResponse.json(mod)
}
