import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  await prisma.user.update({
    where: { email: "nehanvanwyk@gmail.com" },
    data: { tier: "basic", tierUpdatedAt: new Date() }
  })
  console.log("Done — nehanvanwyk@gmail.com downgraded to basic")
}

main().catch(console.error).finally(() => prisma.$disconnect())
