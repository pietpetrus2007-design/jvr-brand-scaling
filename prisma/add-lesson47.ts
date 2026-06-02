import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const mod4 = await prisma.module.findFirst({ where: { part: 2, order: 4 } })
  
  // Shift the CapCut Practical Example from order 7 to order 8
  await prisma.lesson.updateMany({
    where: { moduleId: mod4?.id, order: { gte: 7 } },
    data: { order: { increment: 1 } }
  })

  // Add 4.7 at order 7
  const newLesson = await prisma.lesson.create({
    data: {
      moduleId: mod4!.id,
      title: '4.7 Adding Voiceover to Your Ads',
      description: 'How to write a voiceover script using ChatGPT and convert it to speech in CapCut — no recording required.',
      videoUrl: '',
      slideUrl: 'p2m4l7',
      slidePages: 14,
      order: 7,
    }
  })
  console.log('✅ Created lesson:', newLesson.id, newLesson.title)

  // Verify
  const lessons = await prisma.lesson.findMany({ where: { moduleId: mod4?.id }, orderBy: { order: 'asc' }, select: { order: true, title: true } })
  lessons.forEach(l => console.log(`  ${l.order}: ${l.title}`))
}
main().finally(() => prisma.$disconnect())
