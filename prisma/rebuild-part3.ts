import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

const BASE = "https://res.cloudinary.com/dwnfccsje/image/upload/f_auto/jvr-brand-scaling/part3"
const TS = Date.now()

function slideUrls(id: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `${BASE}/${id}/slide_${i + 1}.png?v=${TS}`)
}

async function main() {
  const db = prisma as any

  // Find Part 3
  const part3 = await db.part.findFirst({ where: { order: 3 } })
  if (!part3) { console.log("No Part 3 found"); return }
  console.log("Found Part 3:", part3.title, part3.id)

  // Delete all existing modules + lessons under Part 3
  const oldModules = await db.module.findMany({ where: { partId: part3.id } })
  for (const mod of oldModules) {
    await db.lesson.deleteMany({ where: { moduleId: mod.id } })
    await db.module.delete({ where: { id: mod.id } })
  }
  console.log(`Deleted ${oldModules.length} old modules`)

  // Create Module 1: Getting Paid
  const mod1 = await db.module.create({
    data: {
      title: "Getting Paid",
      description: "The two payment models, how to price yourself, and the pilot phase.",
      order: 1,
      partId: part3.id
    }
  })

  await db.lesson.create({
    data: {
      title: "1.1 How to Get Paid",
      description: "Retainer vs performance-based, pricing strategy, and the pilot phase.",
      order: 1,
      moduleId: mod1.id,
      slideCount: 10,
      slideUrls: slideUrls("p3m1l1", 10)
    }
  })

  await db.lesson.create({
    data: {
      title: "1.2 Invoicing and Collecting Payment",
      description: "How to invoice clients and collect payment using ChatGPT and payment links.",
      order: 2,
      moduleId: mod1.id,
      slideCount: 10,
      slideUrls: slideUrls("p3m1l2", 10)
    }
  })

  console.log("✅ Module 1 created")

  // Create Module 2: Running the Business
  const mod2 = await db.module.create({
    data: {
      title: "Running the Business",
      description: "Client management, handling non-payment, asking for raises, and mindset.",
      order: 2,
      partId: part3.id
    }
  })

  await db.lesson.create({
    data: {
      title: "2.1 When a Client Doesn't Pay",
      description: "How to handle late or missing payments professionally.",
      order: 1,
      moduleId: mod2.id,
      slideCount: 10,
      slideUrls: slideUrls("p3m2l1", 10)
    }
  })

  await db.lesson.create({
    data: {
      title: "2.2 Asking for a Raise + Dropping Bad Clients",
      description: "When and how to raise your rates, and how to drop clients who aren't worth it.",
      order: 2,
      moduleId: mod2.id,
      slideCount: 10,
      slideUrls: slideUrls("p3m2l2", 10)
    }
  })

  await db.lesson.create({
    data: {
      title: "2.3 What to Say When They Ask for Guarantees",
      description: "How to handle the guarantee question with confidence and honesty.",
      order: 3,
      moduleId: mod2.id,
      slideCount: 10,
      slideUrls: slideUrls("p3m2l3", 10)
    }
  })

  await db.lesson.create({
    data: {
      title: "2.4 The Mindset That Keeps You Going",
      description: "The mental game of building a brand scaling business from scratch.",
      order: 4,
      moduleId: mod2.id,
      slideCount: 10,
      slideUrls: slideUrls("p3m2l4", 10)
    }
  })

  console.log("✅ Module 2 created")
  console.log("✅ Part 3 rebuilt: 2 modules, 6 lessons, 60 slides total")

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1) })
