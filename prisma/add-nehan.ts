import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import bcrypt from "bcryptjs"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: "nehanvanwyk@gmail.com" } })
  if (existing) {
    await prisma.user.update({
      where: { email: "nehanvanwyk@gmail.com" },
      data: { tier: "mentorship", tierUpdatedAt: new Date() }
    })
    console.log("Updated existing user to mentorship")
  } else {
    const hash = await bcrypt.hash("Nehan123!", 12)
    await prisma.user.create({
      data: {
        name: "Nehan",
        email: "nehanvanwyk@gmail.com",
        password: hash,
        tier: "mentorship",
        role: "student",
        needsPasswordSetup: true,
      }
    })
    console.log("Created: nehanvanwyk@gmail.com — mentorship")
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
