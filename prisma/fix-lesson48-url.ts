import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  await prisma.lesson.update({
    where: { id: "cmoc5bnms0000ukorfr7e8xpe" },
    data: { slideUrl: "mod4-lesson8" }
  })
  console.log("Fixed slideUrl to: mod4-lesson8")
}

main().catch(console.error).finally(() => prisma.$disconnect())
