import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const lessons = await prisma.lesson.findMany({
    where: { slideUrl: { startsWith: 'p2m3' } },
    orderBy: { order: 'asc' },
    select: { id: true, title: true, slideUrl: true, videoUrl: true, order: true }
  })
  lessons.forEach(l => console.log(`${l.order}: ${l.title} (${l.slideUrl}) — video: ${l.videoUrl || 'none'}`))
}
main().finally(() => prisma.$disconnect())
