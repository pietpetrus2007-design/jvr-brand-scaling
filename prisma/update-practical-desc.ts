import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const lesson = await prisma.lesson.findFirst({ where: { slideUrl: '' , moduleId: (await prisma.module.findFirst({ where: { title: 'Practical Example', part: 1 } }))?.id } })
  console.log('Found lesson:', lesson?.id, lesson?.title)
  
  if (lesson) {
    await prisma.lesson.update({
      where: { id: lesson.id },
      data: {
        description: "A quick real-world example of the process in action. This is not a full tutorial — it does not cover every step or detail. Everything you need is in the course lessons. This is just a simple look at how it comes together in practice."
      }
    })
    console.log('✅ Updated description')
  }
}
main().finally(() => prisma.$disconnect())
