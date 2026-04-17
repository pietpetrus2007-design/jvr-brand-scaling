export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const call = await prisma.groupCall.findFirst({
    where: { scheduledAt: { gt: new Date() }, isActive: true },
    orderBy: { scheduledAt: "asc" },
  })

  return NextResponse.json(call ?? null)
}
