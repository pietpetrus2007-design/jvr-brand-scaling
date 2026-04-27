import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const announcements = await prisma.announcement.deleteMany({})
  const messages = await prisma.message.deleteMany({})
  console.log(`Deleted ${announcements.count} announcements`)
  console.log(`Deleted ${messages.count} messages`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
