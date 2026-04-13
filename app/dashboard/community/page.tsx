export const dynamic = 'force-dynamic'
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import CommunityView from "./CommunityView"

export default async function CommunityPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <CommunityView
      userId={session.user.id!}
      userName={session.user.name || ""}
      userTier={(session.user as any).tier || "basic"}
      userRole={(session.user as any).role || "student"}
    />
  )
}
