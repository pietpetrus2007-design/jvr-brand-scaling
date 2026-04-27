import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = session.user as any
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const wins = await prisma.progressEntry.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" }
  })

  const revenue = wins.reduce((s, w) => s + w.paymentsValue, 0)
  const payments = wins.reduce((s, w) => s + w.paymentsReceived, 0)

  return NextResponse.json({ revenue, payments, wins })
}
