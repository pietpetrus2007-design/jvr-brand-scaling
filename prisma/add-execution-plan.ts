import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Check current Part 1 module structure
  const mods = await prisma.module.findMany({
    where: { part: 1 },
    orderBy: { order: 'asc' },
    select: { id: true, title: true, order: true }
  })
  console.log('Current Part 1 modules:')
  mods.forEach(m => console.log(`  ${m.order}: ${m.title} (${m.id})`))

  // Create new module after the last one
  const lastOrder = Math.max(...mods.map(m => m.order))
  const newMod = await prisma.module.create({
    data: {
      title: 'The Execution Plan',
      description: 'Your step-by-step execution guide. Complete this after finishing Part 1.',
      order: lastOrder + 1,
      part: 1,
    }
  })
  console.log('\n✅ Created module:', newMod.id, newMod.title, 'order:', newMod.order)

  const newLesson = await prisma.lesson.create({
    data: {
      moduleId: newMod.id,
      title: 'The Execution Plan',
      description: 'Your complete execution guide — exactly what to do after finishing Part 1 to get your first client.',
      videoUrl: '',
      slideUrl: 'execution-plan',
      slidePages: 25,
      order: 1,
    }
  })
  console.log('✅ Created lesson:', newLesson.id, newLesson.title)
}
main().finally(() => prisma.$disconnect())
