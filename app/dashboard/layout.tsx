import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardNav from "./DashboardNav"
import CallCountdown from "./CallCountdown"
import LaunchCountdown from "./LaunchCountdown"
import InstallBanner from "../InstallBanner"
import prisma from "@/lib/prisma"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = session.user as any

  // Check for unread announcements
  const latestAnnouncement = await prisma.announcement.findFirst({
    orderBy: { createdAt: "desc" },
    select: { createdAt: true }
  })
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id as string },
    select: { announcementLastSeen: true, tier: true }
  })
  const isCommunityPlus = ['community', 'mentorship'].includes(dbUser?.tier || '') || user.role === 'admin'
  const hasUnread = isCommunityPlus && latestAnnouncement != null && (
    dbUser?.announcementLastSeen == null ||
    new Date(latestAnnouncement.createdAt) > new Date(dbUser.announcementLastSeen)
  )

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <DashboardNav user={user} hasUnreadAnnouncements={hasUnread} />
      <LaunchCountdown isAdmin={user.role === "admin" || ['Nicolaas200809@icloud.com','schuttebraam@gmail.com','velliewear@gmail.com','erichj.small@gmail.com','nehanvanwyk@gmail.com'].includes(user.email ?? '')} />
      <CallCountdown userName={user.name ?? user.email ?? "Student"} isAdmin={user.role === "admin"} />
      <main className="flex-1">{children}</main>
      <InstallBanner />
    </div>
  )
}
