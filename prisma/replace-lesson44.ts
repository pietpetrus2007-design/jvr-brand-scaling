import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const mod4 = await prisma.module.findFirst({
    where: { part: 1, order: 4 },
    include: { lessons: { orderBy: { order: 'asc' } } }
  })
  if (!mod4) { console.log("Module 4 not found"); return }

  console.log('Current lessons:')
  for (const l of mod4.lessons) {
    console.log(`  order=${l.order} | ${l.title} | ${l.slideUrl}`)
  }

  // Find old 4.4 (email outreach) and 4.4A (Klaviyo)
  const old44 = mod4.lessons.find((l: any) => l.slideUrl === 'mod4-lesson4')
  const old44A = mod4.lessons.find((l: any) => l.slideUrl === 'mod4-lesson5')

  if (old44) {
    await prisma.lesson.update({
      where: { id: old44.id },
      data: {
        title: "4.4 The Step-by-Step Outreach Process",
        description: "A clear system from scraping leads to sending the first message — step by step, every time.",
        slideUrl: "mod4-lesson4",
        slidePages: 16,
        videoUrl: "",
      }
    })
    console.log('Updated 4.4')
  }

  if (old44A) {
    await prisma.lesson.delete({ where: { id: old44A.id } })
    console.log('Deleted 4.4A')
  }

  // Re-fetch and fix order of remaining lessons
  const updated = await prisma.module.findFirst({
    where: { part: 1, order: 4 },
    include: { lessons: { orderBy: { order: 'asc' } } }
  })
  if (!updated) return

  console.log('\nUpdated lessons:')
  for (const l of updated.lessons) {
    console.log(`  order=${l.order} | ${l.title}`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
