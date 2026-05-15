export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  // Basic tier students don't have access to group calls
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { tier: true, role: true } })
  if (!user) return NextResponse.json(null)
  if (user.role !== 'admin' && user.tier === 'basic') return NextResponse.json(null)

  const now = new Date()

  // Find the soonest active call that is either live or upcoming
  const call = await prisma.groupCall.findFirst({
    where: {
      isActive: true,
      OR: [
        { startedAt: { not: null } },
        { scheduledAt: { gt: now } },
      ],
    },
    orderBy: { scheduledAt: "asc" },
  })

  if (!call) return NextResponse.json(null)

  // Check invite visibility
  if (!call.inviteAll) {
    const invite = await prisma.groupCallInvite.findUnique({
      where: { callId_userId: { callId: call.id, userId } },
    })
    if (!invite) return NextResponse.json(null)
  }

  return NextResponse.json(call)
}
