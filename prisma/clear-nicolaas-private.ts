import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const user = await prisma.user.findUnique({ where: { email: "Nicolaas200809@icloud.com" } })
  if (!user) { console.log("User not found"); return }

  const deleted = await prisma.message.deleteMany({
    where: {
      room: "private",
      OR: [{ userId: user.id }, { targetUserId: user.id }]
    }
  })
  console.log(`Deleted ${deleted.count} private messages for Nicolaas`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
