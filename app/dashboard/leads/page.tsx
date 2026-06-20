export const dynamic = 'force-dynamic'
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import LeadsView from "./LeadsView"

export default async function LeadsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  return <LeadsView />
}
