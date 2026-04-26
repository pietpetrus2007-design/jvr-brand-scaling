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
  console.log(`Found: ${mod4.title} with ${mod4.lessons.length} lessons`)

  const maxOrder = Math.max(...mod4.lessons.map((l: any) => l.order))

  const lesson = await prisma.lesson.create({
    data: {
      moduleId: mod4.id,
      title: "4.8 Real-Life Examples of Outreach Messages",
      description: "Six real situations with real outreach messages — Instagram DM, WhatsApp, and email. Understand the logic behind each angle so you can adapt them to any business.",
      slideUrl: "jvr-brand-scaling/hires/mod4-lesson8",
      slidePages: 20,
      videoUrl: "",
      order: maxOrder + 1,
    }
  })
  console.log(`Created: ${lesson.id} — ${lesson.title}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
