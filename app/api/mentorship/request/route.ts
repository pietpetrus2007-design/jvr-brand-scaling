import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = session.user as any
  if (user.tier !== "mentorship" && user.role !== "admin") {
    return NextResponse.json({ error: "Mentorship tier required" }, { status: 403 })
  }
  const { topic, message, preferredTime } = await req.json()
  if (!topic || !message || !preferredTime) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 })
  }
  const request = await prisma.callRequest.create({
    data: { userId: session.user.id as string, topic, message, preferredTime }
  })
  return NextResponse.json({ success: true, request })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = session.user as any
  const requests = await prisma.callRequest.findMany({
    where: { userId: session.user.id as string },
    orderBy: { createdAt: "desc" }
  })
  return NextResponse.json({ requests })
}
