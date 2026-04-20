export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret")
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()

  // Mentorship → Community (after 1 month)
  const mentorshipCutoff = new Date(now)
  mentorshipCutoff.setMonth(mentorshipCutoff.getMonth() - 1)

  const { count: mentorshipDowngraded } = await prisma.user.updateMany({
    where: {
      tier: 'mentorship',
      tierUpdatedAt: { lt: mentorshipCutoff }
    },
    data: { tier: 'community', tierUpdatedAt: new Date() }
  })

  // Community → Basic (after 3 months)
  const communityCutoff = new Date(now)
  communityCutoff.setMonth(communityCutoff.getMonth() - 3)

  const { count: communityDowngraded } = await prisma.user.updateMany({
    where: {
      tier: 'community',
      tierUpdatedAt: { lt: communityCutoff }
    },
    data: { tier: 'basic', tierUpdatedAt: new Date() }
  })

  return NextResponse.json({ mentorshipDowngraded, communityDowngraded })
}
