import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = session.user as any
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const requests = await prisma.callRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } }
  })
  return NextResponse.json({ requests })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = session.user as any
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id, status } = await req.json()
  const updated = await prisma.callRequest.update({ where: { id }, data: { status } })
  return NextResponse.json({ success: true, updated })
}
