import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const mod5 = await prisma.module.findFirst({
    where: { part: 1, order: 5 },
    include: { lessons: { orderBy: { order: 'asc' } } }
  })
  if (!mod5) { console.log("Module 5 not found"); return }
  console.log(`Found: ${mod5.title} with ${mod5.lessons.length} lessons`)

  const maxOrder = Math.max(...mod5.lessons.map((l: any) => l.order))

  const lesson = await prisma.lesson.create({
    data: {
      moduleId: mod5.id,
      title: "5.10 Real-Life Closing Conversation Examples",
      description: "Six full closing examples from first message to closed deal — aesthetic clinic, fashion brand, solar company, dealership, gym, and beauty brand. See every step, every objection, and every payment structure in real South African context.",
      slideUrl: "mod5-lesson10",
      slidePages: 101,
      videoUrl: "",
      order: maxOrder + 1,
    }
  })
  console.log(`Created: ${lesson.id} — ${lesson.title}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
