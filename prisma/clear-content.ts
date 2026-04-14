import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! } as any)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Delete all progress, lessons and modules
  await (prisma.progress as any).deleteMany({})
  await (prisma.lesson as any).deleteMany({})
  await (prisma.module as any).deleteMany({})
  console.log("✅ All placeholder course content removed")
}

main().catch(console.error).finally(() => prisma.$disconnect())
