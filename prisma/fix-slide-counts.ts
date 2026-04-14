import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! } as any)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Correct page counts based on actual PowerPoint slide counts
  const corrections: Record<string, number> = {
    'mod1-lesson1': 7,
    'mod1-lesson2': 7,
    'mod1-lesson3': 7,
    'mod1-lesson4': 7,
    'mod1-lesson5': 7,
    'mod2-lesson1': 7,
    'mod2-lesson2': 7,
    'mod2-lesson3': 7,
    'mod2-lesson4': 7,
    'mod2-lesson5': 7,
    'mod3-lesson1': 7,  // 7 in pptx, uploaded 8 - fix to 7
    'mod3-lesson2': 8,
    'mod3-lesson3': 8,
    'mod3-lesson4': 8,
    'mod3-lesson5': 8,
    'mod3-lesson6': 8,
    'mod3-lesson7': 8,
  }

  for (const [slideUrl, pages] of Object.entries(corrections)) {
    const result = await (prisma.lesson as any).updateMany({
      where: { slideUrl },
      data: { slidePages: pages }
    })
    if (result.count > 0) console.log(`✅ ${slideUrl} → ${pages} slides`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
