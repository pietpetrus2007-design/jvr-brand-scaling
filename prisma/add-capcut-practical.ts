import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Find last lesson in Module 4 and add as new lesson at the end
  const mod4 = await prisma.module.findFirst({ where: { part: 2, order: 4 } })
  const lessons = await prisma.lesson.findMany({ where: { moduleId: mod4?.id }, orderBy: { order: 'asc' } })
  const maxOrder = Math.max(...lessons.map(l => l.order))

  const newLesson = await prisma.lesson.create({
    data: {
      moduleId: mod4!.id,
      title: 'CapCut Practical Example',
      description: 'A simple example of the CapCut process in action — not a full tutorial. Everything you need is in the course lessons. This is just a quick look at how it comes together in practice.',
      videoUrl: 'https://youtu.be/_r4Jcs30lIs',
      slideUrl: '',
      slidePages: 0,
      order: maxOrder + 1,
    }
  })
  console.log('✅ Created lesson:', newLesson.id, newLesson.title, 'order:', newLesson.order)
}
main().finally(() => prisma.$disconnect())
