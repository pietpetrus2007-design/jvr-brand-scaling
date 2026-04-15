export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    return NextResponse.json(
      { error: "Account not found. Please wait 1-2 minutes and try again, or contact support." },
      { status: 404 }
    )
  }

  const hashed = await bcrypt.hash(password, 10)
  await prisma.user.update({
    where: { email },
    data: { password: hashed },
  })

  return NextResponse.json({ success: true })
}
