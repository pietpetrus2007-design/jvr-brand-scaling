export const dynamic = 'force-dynamic'
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import AskView from "./AskView"

export default async function AskPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = session.user as any
  const tier = user.tier as string
  const hasAccess = ['community', 'mentorship', 'admin'].includes(tier) || user.role === 'admin'

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center">
        <div className="text-4xl mb-4">🤖</div>
        <h2 className="text-white font-black text-2xl mb-2">AI Assistant</h2>
        <p className="text-[#888] text-sm mb-6 max-w-sm">The AI assistant is available for Community and Mentorship members. Upgrade your plan to get access.</p>
        <a href="https://brandscaling.co.za/products/upgrade-from-basic-to-community" className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">Upgrade to Community →</a>
      </div>
    )
  }

  return <AskView />
}
