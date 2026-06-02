export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { neon } from '@neondatabase/serverless'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
  }

  try {
    const sql = neon(process.env.DATABASE_URL!)

    const users = await sql`SELECT id, password, "needsPasswordSetup" FROM "User" WHERE email = ${email} LIMIT 1`
    const user = users[0]

    if (!user) {
      return NextResponse.json(
        { error: "Account not found. Please wait 1-2 minutes and try again, or contact support." },
        { status: 404 }
      )
    }

    // If password is already set and needsPasswordSetup is false, redirect to login
    if (!user.needsPasswordSetup && user.password && user.password !== "") {
      return NextResponse.json({ redirect: "/login" }, { status: 200 })
    }

    const hashed = await bcrypt.hash(password, 10)
    await sql`UPDATE "User" SET password = ${hashed}, "needsPasswordSetup" = false WHERE email = ${email}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Activate error:', error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
