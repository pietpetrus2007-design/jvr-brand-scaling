import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const lesson = await prisma.lesson.findFirst({ where: { moduleId: 'cmoja34q30000xlorqml2z4wd' } })
  console.log('Found:', lesson?.id, lesson?.title)
  await prisma.lesson.update({
    where: { id: lesson!.id },
    data: { videoUrl: 'https://youtu.be/XI5fAbvejGo' }
  })
  console.log('✅ Updated')
}
main().finally(() => prisma.$disconnect())
