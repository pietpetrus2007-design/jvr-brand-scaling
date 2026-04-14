export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const entries = await prisma.progressEntry.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json(entries)
}
