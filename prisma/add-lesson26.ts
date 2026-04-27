import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const mod2 = await prisma.module.findFirst({
    where: { part: 1, order: 2 },
    include: { lessons: { orderBy: { order: 'asc' } } }
  })
  if (!mod2) { console.log("Module 2 not found"); return }

  console.log(`Found: ${mod2.title} with ${mod2.lessons.length} lessons`)
  const maxOrder = Math.max(...mod2.lessons.map((l: any) => l.order))

  const lesson = await prisma.lesson.create({
    data: {
      moduleId: mod2.id,
      title: "2.6 Setting Up Your Profiles",
      description: "Before you reach out to a single business, your Instagram and WhatsApp need to look the part. This lesson covers exactly what to set up — and what you don't need to stress about.",
      slideUrl: "mod2-lesson6",
      slidePages: 14,
      videoUrl: "",
      order: maxOrder + 1,
    }
  })
  console.log(`Created: ${lesson.title}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
