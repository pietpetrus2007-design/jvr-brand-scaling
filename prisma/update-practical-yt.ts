import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  await prisma.lesson.update({
    where: { id: 'cmoja34yf0001xlorf6334rwe' },
    data: { videoUrl: 'https://youtu.be/NfYPpgegq70' }
  })
  console.log('✅ YouTube URL updated')
}
main().finally(() => prisma.$disconnect())
