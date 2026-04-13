import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import DashboardNav from "./DashboardNav"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <DashboardNav user={session.user as any} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
