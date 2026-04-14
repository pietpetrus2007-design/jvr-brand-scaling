import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! } as any)
const prisma = new PrismaClient({ adapter } as any)

const BASE = "https://pietpetrus2007-design.github.io/jvr-slides"

async function main() {
  const mod2 = await (prisma.module as any).findFirst({ where: { order: 2 } })
  if (!mod2) { console.log("Module 2 not found"); return }

  const lessons = await (prisma.lesson as any).findMany({ where: { moduleId: mod2.id }, orderBy: { order: 'asc' } })
  
  const urls = [
    `${BASE}/lesson-2-1.pdf`,
    `${BASE}/lesson-2-2.pdf`,
    `${BASE}/lesson-2-3.pdf`,
    `${BASE}/lesson-2-4.pdf`,
    `${BASE}/lesson-2-5.pdf`,
  ]

  for (let i = 0; i < lessons.length; i++) {
    await (prisma.lesson as any).update({ where: { id: lessons[i].id }, data: { slideUrl: urls[i] } })
    console.log(`✅ ${lessons[i].title} → ${urls[i]}`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
