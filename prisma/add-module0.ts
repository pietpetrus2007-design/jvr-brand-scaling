import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // First remove the glossary from Module 1 and delete it
  const glossary = await prisma.lesson.findFirst({ where: { slideUrl: 'mod1-glossary' } })
  if (glossary) {
    await prisma.lesson.delete({ where: { id: glossary.id } })
    console.log('Removed glossary from Module 1')
  }

  // Shift Module 1 lessons back down
  const mod1 = await prisma.module.findFirst({
    where: { part: 1, order: 1 },
    include: { lessons: { orderBy: { order: 'asc' } } }
  })
  if (mod1) {
    for (const l of mod1.lessons) {
      await prisma.lesson.update({ where: { id: l.id }, data: { order: l.order - 1 } })
    }
    console.log('Restored Module 1 lesson order')
  }

  // Shift all Part 1 modules up by 1 to make room for order=0... actually use order=0 trick
  // Create a "Module 0" at order 0
  const mod0 = await prisma.module.create({
    data: {
      title: "Before You Start",
      description: "Key terms and definitions you'll encounter throughout the course.",
      order: 0,
      part: 1,
    }
  })

  await prisma.lesson.create({
    data: {
      moduleId: mod0.id,
      title: "Key Terms Explained",
      description: "A quick reference for the key words and phrases used throughout this course. You don't need to memorise these — just know they're here when you need them.",
      slideUrl: "mod1-glossary",
      slidePages: 4,
      videoUrl: "",
      order: 1,
    }
  })

  console.log('Created Module 0: Before You Start')

  // Verify
  const all = await prisma.module.findMany({
    where: { part: 1 },
    include: { lessons: { orderBy: { order: 'asc' } } },
    orderBy: { order: 'asc' }
  })
  for (const m of all) {
    console.log(`\nModule order=${m.order}: ${m.title}`)
    for (const l of m.lessons) {
      console.log(`  ${l.order}. ${l.title}`)
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
