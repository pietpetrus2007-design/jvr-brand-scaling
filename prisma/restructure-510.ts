import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const lesson510 = await prisma.lesson.findFirst({
    where: { slideUrl: 'mod5-lesson10' }
  })
  console.log('Lesson 5.10:', JSON.stringify(lesson510, null, 2))

  if (lesson510) {
    const mod = await prisma.module.findUnique({
      where: { id: lesson510.moduleId },
      include: { lessons: { orderBy: { order: 'asc' } } }
    })
    console.log('Module:', mod?.title, mod?.part)
    console.log('All lessons:', mod?.lessons.map(l => `${l.order}: ${l.title} (${l.slideUrl})`))
    
    // Also find all modules in part 1 to understand structure
    const parts = await prisma.module.findMany({
      where: { part: 1 },
      orderBy: { order: 'asc' },
      select: { id: true, title: true, order: true, part: true }
    })
    console.log('\nAll Part 1 modules:', JSON.stringify(parts, null, 2))
  }
}
main().finally(() => prisma.$disconnect())
