export const dynamic = 'force-dynamic'
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import MentorshipView from "./MentorshipView"

export default async function MentorshipPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = session.user as any
  const tier = user.tier as string

  if (tier !== "mentorship" && user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center">
        <div className="text-4xl mb-4">🎯</div>
        <h2 className="text-white font-black text-2xl mb-2">Mentorship</h2>
        <p className="text-[#888] text-sm mb-2 max-w-sm">Get direct access to JvR — private calls, 1-on-1 chat, and personal guidance through your journey.</p>
        <p className="text-[#555] text-xs mb-6 max-w-xs">Available on the Mentorship plan.</p>
        <a
          href={tier === "community"
            ? "https://brandscaling.co.za/products/upgrade-from-community-to-mentorship"
            : "https://brandscaling.co.za/products/upgrade-from-basic-to-mentorship"}
          className="bg-[#FF6B00] hover:bg-[#ff8534] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,0,0.6)] active:scale-95"
        >
          ⚡ Upgrade to Mentorship →
        </a>
      </div>
    )
  }

  const requests = await prisma.callRequest.findMany({
    where: { userId: session.user.id as string },
    orderBy: { createdAt: "desc" }
  })

  return <MentorshipView initialRequests={requests as any} userId={session.user.id as string} userName={(user.name || user.email) as string} userTier={tier} userRole={user.role as string} />
}
