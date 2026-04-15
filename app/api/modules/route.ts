export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const part = Number(req.nextUrl.searchParams.get("part") ?? "1")

  const modules = await prisma.module.findMany({
    where: { part },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: {
          resources: { orderBy: { order: "asc" }, select: { id: true, label: true, url: true, order: true } },
        },
      },
    },
    orderBy: { order: "asc" },
  })

  return NextResponse.json(modules)
}
