import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const lesson = await prisma.lesson.findFirst({ where: { title: 'Canva Practical Example' } })
  console.log('Found:', lesson?.id, lesson?.title)
  await prisma.lesson.update({
    where: { id: lesson!.id },
    data: { videoUrl: 'https://youtu.be/_Qgj7ixOCO8' }
  })
  console.log('✅ YouTube URL updated')
}
main().finally(() => prisma.$disconnect())
