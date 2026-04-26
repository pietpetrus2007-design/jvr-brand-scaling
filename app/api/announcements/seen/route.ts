import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await prisma.user.update({
    where: { id: session.user.id as string },
    data: { announcementLastSeen: new Date() }
  })
  return NextResponse.json({ success: true })
}
