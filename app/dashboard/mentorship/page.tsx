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
        <p className="text-[#888] text-sm mb-5 max-w-sm">Get direct access to JvR — private calls, 1-on-1 chat, and personal guidance through your journey.</p>
        <ul className="text-left space-y-2 text-sm text-[#ccc] mb-6 max-w-xs w-full">
          <li className="flex items-start gap-2"><span className="text-[#FF6B00] mt-0.5">✓</span> Full course access (Part 1, 2 &amp; 3)</li>
          <li className="flex items-start gap-2"><span className="text-[#FF6B00] mt-0.5">✓</span> Community chat rooms</li>
          <li className="flex items-start gap-2"><span className="text-[#FF6B00] mt-0.5">✓</span> AI assistant</li>
          <li className="flex items-start gap-2"><span className="text-[#FF6B00] mt-0.5">✓</span> Group calls with JvR</li>
          <li className="flex items-start gap-2"><span className="text-[#FF6B00] mt-0.5">✓</span> 1-on-1 chat with JvR</li>
          <li className="flex items-start gap-2"><span className="text-[#FF6B00] mt-0.5">✓</span> Private call requests</li>
        </ul>
        <a
          href={tier === "community"
            ? "https://brandscaling.co.za/products/upgrade-from-community-to-mentorship"
            : "https://brandscaling.co.za/products/upgrade-from-basic-to-mentorship"}
          className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Upgrade to Mentorship →
        </a>
      </div>
    )
  }

  const requests = await prisma.callRequest.findMany({
    where: { userId: session.user.id as string },
    orderBy: { createdAt: "desc" }
  })

  return <MentorshipView initialRequests={requests as any} />
}
