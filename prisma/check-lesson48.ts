import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const lesson = await prisma.lesson.findFirst({ where: { title: { contains: "4.8" } } })
  console.log(JSON.stringify(lesson, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
