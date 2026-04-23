import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  await prisma.user.update({
    where: { email: "velliewear@gmail.com" },
    data: { tier: "community", tierUpdatedAt: new Date() }
  })
  console.log("Done — velliewear@gmail.com upgraded to community")
}

main().catch(console.error).finally(() => prisma.$disconnect())
