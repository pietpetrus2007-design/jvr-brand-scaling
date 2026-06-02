import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // First remove video from 3.5
  await prisma.lesson.updateMany({
    where: { slideUrl: 'p2m3l5' },
    data: { videoUrl: '' }
  })
  console.log('✅ Removed video from 3.5')

  // Find all Part 2 modules to know where to insert
  const mods = await prisma.module.findMany({
    where: { part: 2 },
    orderBy: { order: 'asc' },
    select: { id: true, title: true, order: true }
  })
  console.log('Part 2 modules:')
  mods.forEach(m => console.log(`  ${m.order}: ${m.title}`))

  // Module 3 is order 3 in Part 2 — insert after it (order 4), shift 4+ up
  await prisma.module.updateMany({
    where: { part: 2, order: { gte: 4 } },
    data: { order: { increment: 1 } }
  })
  console.log('✅ Shifted modules 4+ up')

  // Create standalone module
  const newMod = await prisma.module.create({
    data: {
      title: 'Canva Practical Example',
      description: 'A simple example of the Canva process in action — not a full tutorial. Everything you need is in the course lessons. This is just a quick look at how it comes together in practice.',
      order: 4,
      part: 2,
    }
  })
  console.log('✅ Created module:', newMod.id)

  // Create lesson with video
  const newLesson = await prisma.lesson.create({
    data: {
      moduleId: newMod.id,
      title: 'See It In Action',
      description: 'A simple example of the Canva process in action — not a full tutorial. Everything you need is in the course lessons. This is just a quick look at how it comes together in practice.',
      videoUrl: 'https://res.cloudinary.com/dwnfccsje/video/upload/v1777487422/jvr-brand-scaling/videos/canva-practical.mp4',
      slideUrl: '',
      slidePages: 0,
      order: 1,
    }
  })
  console.log('✅ Created lesson:', newLesson.id)

  // Verify
  const finalMods = await prisma.module.findMany({
    where: { part: 2 },
    orderBy: { order: 'asc' },
    select: { order: true, title: true }
  })
  console.log('\nFinal Part 2 structure:')
  finalMods.forEach(m => console.log(`  ${m.order}: ${m.title}`))
}
main().finally(() => prisma.$disconnect())
