import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const mod4 = await prisma.module.findFirst({
    where: { part: 1, order: 4 },
    include: { lessons: { orderBy: { order: 'asc' } } }
  })
  if (!mod4) return
  console.log(`Module: ${mod4.title}`)
  for (const l of mod4.lessons) {
    console.log(`  order=${l.order} | ${l.title} | slideUrl=${l.slideUrl} | pages=${l.slidePages}`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
