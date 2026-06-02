import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const lesson = await prisma.lesson.findFirst({ where: { slideUrl: 'p2m3l5' } })
  console.log('Found:', lesson?.id, lesson?.title)
  if (lesson) {
    await prisma.lesson.update({
      where: { id: lesson.id },
      data: { videoUrl: 'https://res.cloudinary.com/dwnfccsje/video/upload/v1777487422/jvr-brand-scaling/videos/canva-practical.mp4' }
    })
    console.log('✅ Video URL updated')
  }
}
main().finally(() => prisma.$disconnect())
