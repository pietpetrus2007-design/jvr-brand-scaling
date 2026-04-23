import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import bcrypt from "bcryptjs"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const hash = await bcrypt.hash("Vellie123!", 12)

  const existing = await prisma.user.findUnique({ where: { email: "velliewear@gmail.com" } })
  if (existing) {
    await prisma.user.update({ where: { email: "velliewear@gmail.com" }, data: { password: hash, needsPasswordSetup: false } })
    console.log("Updated password for existing user")
  } else {
    await prisma.user.create({
      data: {
        name: "Vellie",
        email: "velliewear@gmail.com",
        password: hash,
        tier: "basic",
        role: "student",
        needsPasswordSetup: false,
      }
    })
    console.log("Created new user: velliewear@gmail.com / Vellie123!")
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
