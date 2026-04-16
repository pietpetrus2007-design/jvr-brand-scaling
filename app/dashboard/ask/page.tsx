export const dynamic = 'force-dynamic'
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import AskView from "./AskView"

export default async function AskPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return <AskView />
}
