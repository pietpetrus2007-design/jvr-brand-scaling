import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const modules = await prisma.module.findMany({
    where: { part: { in: [1, 2] } },
    include: { lessons: { orderBy: { order: 'asc' } } },
    orderBy: [{ part: 'asc' }, { order: 'asc' }]
  })

  for (const mod of modules) {
    console.log(`\nPart ${mod.part} — ${mod.title}`)
    for (const l of mod.lessons) {
      const hasVideo = l.videoUrl && l.videoUrl.trim() !== ''
      console.log(`  ${hasVideo ? '✅ VIDEO' : '❌ NO VIDEO'} | ${l.title}`)
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
