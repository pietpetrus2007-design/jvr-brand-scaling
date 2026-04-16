import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import bcrypt from "bcryptjs"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const hash = await bcrypt.hash("Petrus2007", 12)
  const user = await prisma.user.upsert({
    where: { email: "piet@vanrensburg.net" },
    update: { tier: "mentorship", role: "user" },
    create: {
      email: "piet@vanrensburg.net",
      name: "Piet van Rensburg",
      password: hash,
      tier: "mentorship",
      role: "user",
      needsPasswordSetup: false,
    }
  })
  console.log("Done:", user.email, user.tier)
}

main().catch(console.error).finally(() => prisma.$disconnect())
