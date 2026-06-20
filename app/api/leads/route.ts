export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const leads = await prisma.lead.findMany({
    where: { userId: session.user.id as string },
    orderBy: { createdAt: "desc" }
  })
  return NextResponse.json(leads)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const lead = await prisma.lead.create({
    data: {
      userId: session.user.id as string,
      businessName: body.businessName || "",
      niche: body.niche || "",
      social: body.social || "",
      phone: body.phone || "",
      city: body.city || "",
      website: body.website || "",
      email: body.email || "",
      source: body.source || "",
      notes: body.notes || "",
    }
  })
  return NextResponse.json(lead)
}
