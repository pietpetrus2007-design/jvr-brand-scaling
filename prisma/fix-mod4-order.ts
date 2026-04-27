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
  if (!mod4) return

  for (let i = 0; i < mod4.lessons.length; i++) {
    await prisma.lesson.update({
      where: { id: mod4.lessons[i].id },
      data: { order: i + 1 }
    })
  }

  const final = await prisma.module.findFirst({
    where: { part: 1, order: 4 },
    include: { lessons: { orderBy: { order: 'asc' } } }
  })
  for (const l of final!.lessons) {
    console.log(`  order=${l.order} | ${l.title}`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
