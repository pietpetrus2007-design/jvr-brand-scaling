import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Find the last lesson in Module 4 Part 2
  const mod4 = await prisma.module.findFirst({ where: { part: 2, order: 4 } })
  console.log('Module 4:', mod4?.title)
  
  const lessons = await prisma.lesson.findMany({ 
    where: { moduleId: mod4?.id }, 
    orderBy: { order: 'asc' },
    select: { id: true, title: true, order: true, slideUrl: true }
  })
  lessons.forEach(l => console.log(`  ${l.order}: ${l.title} (${l.slideUrl})`))
}
main().finally(() => prisma.$disconnect())
