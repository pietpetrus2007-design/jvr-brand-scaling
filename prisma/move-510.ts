import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // 1. Delete the old lesson 5.10
  await prisma.lesson.delete({ where: { id: 'cmoc9n3p80000d9orce9pvljw' } })
  console.log('✅ Deleted old lesson 5.10 from Module 5')

  // 2. Create new standalone module after Module 5 (order 6, part 1)
  // First shift any existing modules with order >= 6 up by 1
  await prisma.module.updateMany({
    where: { part: 1, order: { gte: 6 } },
    data: { order: { increment: 1 } }
  })
  console.log('✅ Shifted existing modules up')

  // 3. Create the new module
  const newMod = await prisma.module.create({
    data: {
      title: 'Real-Life Closing Examples',
      description: 'Six full closing conversations from first message to closed deal — in real South African context.',
      order: 6,
      part: 1,
    }
  })
  console.log('✅ Created new module:', newMod.id, newMod.title)

  // 4. Create the lesson inside it
  const newLesson = await prisma.lesson.create({
    data: {
      moduleId: newMod.id,
      title: 'Real-Life Closing Conversation Examples',
      description: 'Six full closing examples from first message to closed deal — aesthetic clinic, fashion brand, solar company, dealership, gym, and beauty brand. See every step, every objection, and every payment structure in real South African context.',
      videoUrl: '',
      slideUrl: 'mod5-lesson10',
      slidePages: 101,
      order: 1,
    }
  })
  console.log('✅ Created new lesson:', newLesson.id, newLesson.title)
}
main().finally(() => prisma.$disconnect())
