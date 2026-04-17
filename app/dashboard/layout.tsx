import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardNav from "./DashboardNav"
import CallCountdown from "./CallCountdown"
import InstallBanner from "../InstallBanner"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = session.user as any

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <DashboardNav user={user} />
      <CallCountdown userName={user.name ?? user.email ?? "Student"} isAdmin={user.role === "admin"} />
      <main className="flex-1">{children}</main>
      <InstallBanner />
    </div>
  )
}
