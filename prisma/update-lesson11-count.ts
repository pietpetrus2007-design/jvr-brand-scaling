import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const lesson = await prisma.lesson.findFirst({ where: { slideUrl: "mod1-lesson1" } })
  if (!lesson) { console.log("Not found"); return }
  await prisma.lesson.update({ where: { id: lesson.id }, data: { slidePages: 10 } })
  console.log(`Updated ${lesson.title} → 10 slides`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
