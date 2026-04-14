import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! } as any)
const prisma = new PrismaClient({ adapter } as any)

const BASE = "https://pietpetrus2007-design.github.io/jvr-slides"

async function main() {
  const lessons = await (prisma.lesson as any).findMany({ where: { order: { lte: 5 }, module: { order: 1 } }, include: { module: true } })
  
  for (const lesson of lessons) {
    const url = `${BASE}/lesson-${lesson.order}.pdf`
    await (prisma.lesson as any).update({ where: { id: lesson.id }, data: { slideUrl: url } })
    console.log(`✅ ${lesson.title} → ${url}`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
