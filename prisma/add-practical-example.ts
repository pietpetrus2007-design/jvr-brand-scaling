import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Shift modules 5, 6, 7 up by 1 to make room between 4 and 5
  await prisma.module.updateMany({
    where: { part: 1, order: { gte: 5 } },
    data: { order: { increment: 1 } }
  })
  console.log('✅ Shifted modules 5+ up')

  // Create new module at order 5
  const newMod = await prisma.module.create({
    data: {
      title: 'Practical Example',
      description: 'A simple real-world example of the process in action. Watch how it comes together in practice — the full detail is in the lessons.',
      order: 5,
      part: 1,
    }
  })
  console.log('✅ Created module:', newMod.id)

  const newLesson = await prisma.lesson.create({
    data: {
      moduleId: newMod.id,
      title: 'See It In Action',
      description: 'A simple real-world example of the process in action. Watch how it comes together in practice — the full detail is in the lessons.',
      videoUrl: '',
      slideUrl: '',
      slidePages: 0,
      order: 1,
    }
  })
  console.log('✅ Created lesson:', newLesson.id)

  // Verify final structure
  const mods = await prisma.module.findMany({
    where: { part: 1 },
    orderBy: { order: 'asc' },
    select: { order: true, title: true }
  })
  console.log('\nFinal Part 1 structure:')
  mods.forEach(m => console.log(`  ${m.order}: ${m.title}`))
}
main().finally(() => prisma.$disconnect())
