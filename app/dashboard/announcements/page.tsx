export const dynamic = 'force-dynamic'
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import AnnouncementsView from "./AnnouncementsView"

export default async function AnnouncementsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = session.user as any
  const tier = user.tier as string
  const hasAccess = ['community', 'mentorship'].includes(tier) || user.role === 'admin'

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center">
        <div className="text-3xl mb-4">📢</div>
        <h2 className="text-white font-black text-2xl mb-2">Announcements</h2>
        <p className="text-[#888] text-sm mb-6 max-w-sm">Announcements are available for Community and Mentorship members. Upgrade to stay in the loop.</p>
        <a href="https://brandscaling.co.za/products/upgrade-from-basic-to-community" className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">Upgrade to Community →</a>
      </div>
    )
  }

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  })

  return <AnnouncementsView announcements={announcements as any} />
}
