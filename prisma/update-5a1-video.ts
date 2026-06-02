import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)
async function main() {
  const lesson = await prisma.lesson.findFirst({ where: { slideUrl: 'p2m5a1' } })
  await prisma.lesson.update({ where: { id: lesson!.id }, data: { videoUrl: 'https://res.cloudinary.com/dwnfccsje/video/upload/v1777577564/jvr-brand-scaling/videos/5a1-business-suite.mp4' } })
  console.log('✅ 5A.1 video updated')
}
main().finally(() => prisma.$disconnect())
