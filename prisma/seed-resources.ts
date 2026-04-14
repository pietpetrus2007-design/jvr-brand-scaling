import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import "dotenv/config"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const lesson = await prisma.lesson.findFirst({
    where: {
      OR: [
        { title: { contains: "2.3" } },
        { title: { contains: "Niching" } },
      ],
    },
  })

  if (!lesson) {
    console.error("Lesson 2.3 not found")
    process.exit(1)
  }

  console.log(`Found lesson: "${lesson.title}" (${lesson.id})`)

  await prisma.resource.deleteMany({ where: { lessonId: lesson.id } })

  const resources = await prisma.resource.createMany({
    data: [
      { lessonId: lesson.id, label: "Meta Ad Library", url: "https://www.facebook.com/ads/library", order: 1 },
      { lessonId: lesson.id, label: "Google Maps (find local businesses)", url: "https://maps.google.com", order: 2 },
      { lessonId: lesson.id, label: "Google Search", url: "https://www.google.com", order: 3 },
    ],
  })

  console.log(`Created ${resources.count} resources for lesson "${lesson.title}"`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
