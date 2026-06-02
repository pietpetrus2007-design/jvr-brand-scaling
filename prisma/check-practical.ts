import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const lesson = await prisma.lesson.findUnique({ where: { id: 'cmoja34yf0001xlorf6334rwe' } })
  console.log('videoUrl:', lesson?.videoUrl)
}
main().finally(() => prisma.$disconnect())
