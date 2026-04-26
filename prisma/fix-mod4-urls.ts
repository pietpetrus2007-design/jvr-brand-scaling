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

  // lesson 4.8 (order 9) should use mod4-lesson9
  const lesson48 = mod4.lessons.find((l: any) => l.order === 9)
  if (lesson48) {
    await prisma.lesson.update({
      where: { id: lesson48.id },
      data: { slideUrl: 'mod4-lesson9' }
    })
    console.log(`Fixed 4.8: mod4-lesson9`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
