import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Find the standalone module we just created
  const standaloneMod = await prisma.module.findFirst({ where: { title: 'Canva Practical Example', part: 2 } })
  const standaloneLesson = await prisma.lesson.findFirst({ where: { moduleId: standaloneMod?.id } })

  // Find Module 3
  const mod3 = await prisma.module.findFirst({ where: { title: { contains: 'Canva' }, part: 2, order: 3 } })
  console.log('Module 3:', mod3?.id, mod3?.title)

  // Find current max lesson order in Module 3
  const mod3Lessons = await prisma.lesson.findMany({ where: { moduleId: mod3?.id }, orderBy: { order: 'asc' } })
  console.log('Module 3 lessons:', mod3Lessons.map(l => `${l.order}: ${l.title}`))
  const maxOrder = Math.max(...mod3Lessons.map(l => l.order))

  // Move the lesson from standalone module into Module 3
  await prisma.lesson.update({
    where: { id: standaloneLesson?.id },
    data: { moduleId: mod3?.id, order: maxOrder + 1, title: 'Canva Practical Example' }
  })
  console.log('✅ Moved lesson to Module 3')

  // Delete the standalone module
  await prisma.module.delete({ where: { id: standaloneMod?.id } })
  console.log('✅ Deleted standalone module')

  // Shift modules back down
  await prisma.module.updateMany({
    where: { part: 2, order: { gte: 5 } },
    data: { order: { decrement: 1 } }
  })
  console.log('✅ Shifted modules back')

  const finalMods = await prisma.module.findMany({ where: { part: 2 }, orderBy: { order: 'asc' }, select: { order: true, title: true } })
  console.log('\nFinal Part 2 structure:')
  finalMods.forEach(m => console.log(`  ${m.order}: ${m.title}`))
}
main().finally(() => prisma.$disconnect())
