import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const modules = await prisma.module.findMany({
    where: { part: { in: [2, 3] } },
    include: { lessons: { orderBy: { order: 'asc' } } },
    orderBy: [{ part: 'asc' }, { order: 'asc' }]
  })

  for (const m of modules) {
    console.log(`\nPart ${m.part} — ${m.title}`)
    for (const l of m.lessons) {
      console.log(`  slideUrl=${l.slideUrl} | pages=${l.slidePages} | ${l.title}`)
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
