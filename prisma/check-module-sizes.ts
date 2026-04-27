import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const modules = await prisma.module.findMany({
    where: { part: 1 },
    include: { lessons: true },
    orderBy: { order: 'asc' }
  })

  for (const m of modules) {
    const lessonCount = m.lessons.length
    const totalSlides = m.lessons.reduce((s, l) => s + l.slidePages, 0)
    console.log(`Module ${m.order}: ${m.title} — ${lessonCount} lessons, ${totalSlides} slides`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
