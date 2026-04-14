import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! } as any)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const mod3 = await (prisma.module as any).findFirst({ where: { order: 3 } })
  if (!mod3) { console.log("Module 3 not found"); return }

  const lessons = await (prisma.lesson as any).findMany({ where: { moduleId: mod3.id }, orderBy: { order: 'asc' } })

  // Page counts from upload output
  const data = [
    { id: 'mod3-lesson1', pages: 8 },
    { id: 'mod3-lesson2', pages: 8 },
    { id: 'mod3-lesson3', pages: 8 },
    { id: 'mod3-lesson4', pages: 8 },
    { id: 'mod3-lesson5', pages: 8 },
    { id: 'mod3-lesson6', pages: 8 },
    { id: 'mod3-lesson7', pages: 8 },
  ]

  for (let i = 0; i < lessons.length; i++) {
    await (prisma.lesson as any).update({
      where: { id: lessons[i].id },
      data: { slideUrl: data[i].id, slidePages: data[i].pages }
    })
    console.log(`✅ ${lessons[i].title} → ${data[i].id} (${data[i].pages} slides)`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
