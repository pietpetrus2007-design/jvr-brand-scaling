import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import "dotenv/config"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const modules = await prisma.module.findMany({
    where: { order: { in: [1, 2] } },
    include: { lessons: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  })

  for (const mod of modules) {
    const modNum = mod.order
    for (const lesson of mod.lessons) {
      const lessonNum = lesson.order
      const publicId = `mod${modNum}-lesson${lessonNum}`
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { slideUrl: publicId, slidePages: 7 },
      })
      console.log(`Updated lesson "${lesson.title}" → slideUrl=${publicId}, slidePages=7`)
    }
  }

  console.log("Done.")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
