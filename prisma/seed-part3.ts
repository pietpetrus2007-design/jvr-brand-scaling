import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! } as any)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const modules = [
    {
      title: "Module 1: How This Business Makes Money",
      description: "Part 3: Payment Structure — Understanding how the brand scaling business model generates income.",
      order: 1, part: 3,
      lessons: [
        { order: 1, title: "1.1 How This Business Model Makes Money", slideUrl: "p3m1l1", slidePages: 10 },
        { order: 2, title: "1.2 The Main Ways Advertisers Charge Clients", slideUrl: "p3m1l2", slidePages: 10 },
        { order: 3, title: "1.3 Why Recurring Revenue Is the Goal", slideUrl: "p3m1l3", slidePages: 9 },
      ]
    },
    {
      title: "Module 2: Pricing Your Services",
      description: "Part 3: Payment Structure — How to price your services at every stage.",
      order: 2, part: 3,
      lessons: [
        { order: 1, title: "2.1 How to Think About Pricing", slideUrl: "p3m2l1", slidePages: 9 },
        { order: 2, title: "2.2 Beginner Pricing", slideUrl: "p3m2l2", slidePages: 9 },
        { order: 3, title: "2.3 Intermediate Pricing", slideUrl: "p3m2l3", slidePages: 9 },
        { order: 4, title: "2.4 What Affects Your Pricing", slideUrl: "p3m2l4", slidePages: 9 },
      ]
    },
    {
      title: "Module 3: Structuring Your Offer",
      description: "Part 3: Payment Structure — What to include and how to present your service.",
      order: 3, part: 3,
      lessons: [
        { order: 1, title: "3.1 What Your Service Actually Includes", slideUrl: "p3m3l1", slidePages: 9 },
        { order: 2, title: "3.2 How to Present Your Offer Clearly", slideUrl: "p3m3l2", slidePages: 9 },
        { order: 3, title: "3.3 Pilot Offers and Low-Risk Starts", slideUrl: "p3m3l3", slidePages: 9 },
      ]
    },
    {
      title: "Module 4: Retainers, Scaling and Income",
      description: "Part 3: Payment Structure — Build recurring income and grow to multiple clients.",
      order: 4, part: 3,
      lessons: [
        { order: 1, title: "4.1 Monthly Retainers Explained", slideUrl: "p3m4l1", slidePages: 9 },
        { order: 2, title: "4.2 Setup Fees and Hybrid Deals", slideUrl: "p3m4l2", slidePages: 9 },
        { order: 3, title: "4.3 Keeping Clients Long Term", slideUrl: "p3m4l3", slidePages: 9 },
        { order: 4, title: "4.4 Growing From One Client to Multiple", slideUrl: "p3m4l4", slidePages: 9 },
        { order: 5, title: "4.5 Advanced Pricing for Bigger Brands", slideUrl: "p3m4l5", slidePages: 9 },
        { order: 6, title: "4.6 The Complete Brand Scaling Income Model", slideUrl: "p3m4l6", slidePages: 9 },
      ]
    },
  ]

  for (const mod of modules) {
    await (prisma.module as any).create({
      data: {
        title: mod.title,
        description: mod.description,
        order: mod.order,
        part: mod.part,
        lessons: {
          create: mod.lessons.map(l => ({
            order: l.order,
            title: l.title,
            description: "",
            videoUrl: "",
            slideUrl: l.slideUrl,
            slidePages: l.slidePages,
          }))
        }
      }
    })
    console.log(`✅ ${mod.title} — ${mod.lessons.length} lessons`)
  }
  console.log("\n🎉 Part 3: Payment Structure seeded! 16 lessons")
}

main().catch(console.error).finally(() => prisma.$disconnect())
