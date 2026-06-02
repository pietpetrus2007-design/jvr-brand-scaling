import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const lesson = await prisma.lesson.findFirst({ where: { slideUrl: 'p2m4l1' } })
  console.log('Found:', lesson?.id, lesson?.title)

  await prisma.resource.create({
    data: {
      lessonId: lesson!.id,
      label: 'Pexels — Free Stock Video Clips',
      url: 'https://www.pexels.com/videos/',
      order: 1,
    }
  })
  console.log('✅ Pexels resource added')
}
main().finally(() => prisma.$disconnect())
