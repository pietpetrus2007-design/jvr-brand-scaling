import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: "piet200710@gmail.com" } })
  if (existing) {
    console.log("Already exists:", existing.email, existing.tier)
    return
  }

  const user = await prisma.user.create({
    data: {
      email: "piet200710@gmail.com",
      name: "Piet Test",
      tier: "basic",
      role: "student",
      needsPasswordSetup: true,
      password: "",
    }
  })
  console.log("Created:", user.email, user.tier, user.id)
}

main().catch(console.error).finally(() => prisma.$disconnect())
