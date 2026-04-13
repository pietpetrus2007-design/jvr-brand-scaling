export const dynamic = 'force-dynamic'
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import ProfileView from "./ProfileView"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [user, progress] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true, tier: true } }),
    prisma.progress.count({ where: { userId: session.user.id } }),
  ])

  if (!user) redirect("/login")

  return (
    <ProfileView
      userId={session.user.id}
      name={user.name}
      email={user.email}
      tier={user.tier}
      completedLessons={progress}
    />
  )
}
