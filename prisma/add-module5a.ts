import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Check current Part 2 structure
  const mods = await prisma.module.findMany({ where: { part: 2 }, orderBy: { order: 'asc' }, select: { id: true, title: true, order: true } })
  console.log('Current Part 2:')
  mods.forEach(m => console.log(`  ${m.order}: ${m.title}`))

  // Shift modules 5+ up by 1 to make room
  await prisma.module.updateMany({ where: { part: 2, order: { gte: 5 } }, data: { order: { increment: 1 } } })
  console.log('✅ Shifted modules 5+ up')

  // Create Module 5A at order 5
  const mod5a = await prisma.module.create({
    data: {
      title: 'Module 5A: Setting Up Meta Ads',
      description: 'Everything you need to set up Meta Business Suite, get client access, create the ad account, set up the pixel, and confirm everything is connected before running a single campaign.',
      order: 5,
      part: 2,
    }
  })
  console.log('✅ Created Module 5A:', mod5a.id)

  // Add all 8 lessons
  const lessons = [
    { order: 1, title: '5A.1 What is Meta Business Suite?', slideUrl: 'p2m5a1', slidePages: 12, description: 'Understand what Meta Business Suite is, the difference between Business Suite and Business Manager, and what every client needs before you can run a single ad.' },
    { order: 2, title: '5A.2 The 5 Situations You\'ll Walk Into', slideUrl: 'p2m5a2', slidePages: 13, description: 'Learn the 5 real client situations you\'ll face and exactly what to do in each one — from a client with nothing set up to one who just needs to add you.' },
    { order: 3, title: '5A.3 Helping the Client Set Up From Scratch', slideUrl: 'p2m5a3', slidePages: 14, description: 'Step-by-step guide to walking a client through Business Suite setup — including exact WhatsApp messages to send at each step.' },
    { order: 4, title: '5A.4 How the Client Gives You Full Admin Access', slideUrl: 'p2m5a4', slidePages: 13, description: 'Exactly what the client clicks to give you Admin access — the right role, the right assets, and what to do if something goes wrong.' },
    { order: 5, title: '5A.5 Creating the Ad Account and Adding the Card', slideUrl: 'p2m5a5', slidePages: 14, description: 'How to create the ad account, set the right currency and time zone, and get the client to add their own payment card.' },
    { order: 6, title: '5A.6 Understanding and Setting Up the Meta Pixel', slideUrl: 'p2m5a6', slidePages: 11, description: 'What the pixel is, when you need it, and how to set it up — Shopify clients use the app, other websites leave it for now.' },
    { order: 7, title: '5A.7 Connecting Everything and Confirming It\'s Ready', slideUrl: 'p2m5a7', slidePages: 10, description: 'The final checklist before moving to campaigns — confirm all 4 connections are in place and nothing is missing.' },
    { order: 8, title: '5A.8 Edge Cases and Common Problems', slideUrl: 'p2m5a8', slidePages: 12, description: 'Real problems you will hit — disabled accounts, wrong roles, Instagram not connecting, rejected ads, and more. All with exact fixes.' },
  ]

  for (const l of lessons) {
    await prisma.lesson.create({
      data: { moduleId: mod5a.id, videoUrl: '', ...l }
    })
    console.log(`✅ Added: ${l.title}`)
  }

  // Verify final structure
  const final = await prisma.module.findMany({ where: { part: 2 }, orderBy: { order: 'asc' }, select: { order: true, title: true } })
  console.log('\nFinal Part 2 structure:')
  final.forEach(m => console.log(`  ${m.order}: ${m.title}`))
}
main().finally(() => prisma.$disconnect())
