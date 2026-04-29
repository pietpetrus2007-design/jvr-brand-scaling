import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const today = new Date('2026-04-28T00:00:00+02:00')
  const users = await prisma.user.findMany({
    where: { createdAt: { gte: today } },
    select: { email: true, name: true, tier: true, createdAt: true }
  })
  console.log(JSON.stringify(users, null, 2))
  console.log(`Total new today: ${users.length}`)
}
main().finally(() => prisma.$disconnect())
