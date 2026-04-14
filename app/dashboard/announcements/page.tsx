export const dynamic = 'force-dynamic'
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import AnnouncementsView from "./AnnouncementsView"

export default async function AnnouncementsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  })

  return <AnnouncementsView announcements={announcements as any} />
}
