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

  const maxOrder = Math.max(...mod4.lessons.map((l: any) => l.order))

  const lesson = await prisma.lesson.create({
    data: {
      moduleId: mod4.id,
      title: "Optional Lesson (Advanced): Email Outreach & Apollo",
      description: "Not for beginners. Only start this once you're consistently doing DM and WhatsApp outreach. Covers cold email writing, finding emails with Apollo, and building an email outreach system.",
      slideUrl: "mod4-email-optional",
      slidePages: 16,
      videoUrl: "",
      order: maxOrder + 1,
    }
  })
  console.log(`Created: ${lesson.title}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
