import { PrismaClient, Tier } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import bcrypt from "bcryptjs"
import "dotenv/config"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Admin user
  const hashed = await bcrypt.hash("Admin1234!", 10)
  await prisma.user.upsert({
    where: { email: "admin@jvronline.com" },
    update: {},
    create: {
      name: "JvR Admin",
      email: "admin@jvronline.com",
      password: hashed,
      role: "admin",
      tier: "mentorship",
    },
  })

  // Invite codes
  const codes: { code: string; tier: Tier }[] = [
    { code: "BASIC-001", tier: "basic" },
    { code: "BASIC-002", tier: "basic" },
    { code: "BASIC-003", tier: "basic" },
    { code: "COMM-001", tier: "community" },
    { code: "COMM-002", tier: "community" },
    { code: "COMM-003", tier: "community" },
    { code: "MENT-001", tier: "mentorship" },
    { code: "MENT-002", tier: "mentorship" },
    { code: "MENT-003", tier: "mentorship" },
  ]
  for (const c of codes) {
    await prisma.inviteCode.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    })
  }

  // Modules + lessons
  const modules = [
    {
      title: "Brand Foundations",
      description: "Build the core identity of your brand from the ground up.",
      order: 1,
      lessons: [
        { title: "What is Brand Scaling?", description: "Overview of the brand scaling system.", videoUrl: "", order: 1 },
        { title: "Defining Your Niche", description: "How to find and dominate your niche.", videoUrl: "", order: 2 },
        { title: "Brand Identity Essentials", description: "Logo, colours, tone — building consistency.", videoUrl: "", order: 3 },
      ],
    },
    {
      title: "Landing Clients",
      description: "Proven frameworks for attracting and converting clients.",
      order: 2,
      lessons: [
        { title: "Cold Outreach That Works", description: "Scripts and strategies for cold outreach.", videoUrl: "", order: 1 },
        { title: "Discovery Calls", description: "How to run a discovery call that closes.", videoUrl: "", order: 2 },
        { title: "Proposal Writing", description: "Craft proposals clients can't say no to.", videoUrl: "", order: 3 },
      ],
    },
    {
      title: "Scaling Revenue",
      description: "Systems to grow your income without burning out.",
      order: 3,
      lessons: [
        { title: "Productising Your Service", description: "Turn your skills into scalable offers.", videoUrl: "", order: 1 },
        { title: "Raising Your Rates", description: "When and how to increase your prices.", videoUrl: "", order: 2 },
        { title: "Building a Team", description: "Hire, delegate, and scale.", videoUrl: "", order: 3 },
      ],
    },
  ]

  for (const mod of modules) {
    const existing = await prisma.module.findFirst({ where: { title: mod.title } })
    let moduleId: string
    if (existing) {
      moduleId = existing.id
    } else {
      const created = await prisma.module.create({
        data: { title: mod.title, description: mod.description, order: mod.order },
      })
      moduleId = created.id
    }
    for (const lesson of mod.lessons) {
      const existingLesson = await prisma.lesson.findFirst({
        where: { moduleId, title: lesson.title },
      })
      if (!existingLesson) {
        await prisma.lesson.create({ data: { ...lesson, moduleId } })
      }
    }
  }

  console.log("Seed complete.")
}

main().catch(console.error).finally(() => prisma.$disconnect())
