import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const mod1 = await prisma.module.findFirst({
    where: { part: 1, order: 1 },
    include: { lessons: { orderBy: { order: 'asc' } } }
  })
  if (!mod1) { console.log("Module 1 not found"); return }

  // Shift all existing lessons up by 1
  for (const l of mod1.lessons) {
    await prisma.lesson.update({
      where: { id: l.id },
      data: { order: l.order + 1 }
    })
  }

  // Insert glossary as order 1
  const lesson = await prisma.lesson.create({
    data: {
      moduleId: mod1.id,
      title: "Before You Start — Key Terms Explained",
      description: "A quick reference for the key words and phrases used throughout this course. You don't need to memorise these — just know they're here when you need them.",
      slideUrl: "mod1-glossary",
      slidePages: 4,
      videoUrl: "",
      order: 1,
    }
  })

  console.log(`Created: ${lesson.title}`)

  // Verify
  const updated = await prisma.module.findFirst({
    where: { part: 1, order: 1 },
    include: { lessons: { orderBy: { order: 'asc' } } }
  })
  for (const l of updated!.lessons) {
    console.log(`  order=${l.order} | ${l.title}`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
