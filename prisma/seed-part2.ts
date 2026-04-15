import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! } as any)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Part 2: Paid Ads — 6 modules, 39 lessons
  // Modules are ordered 6-11 (continuing from Part 1's 5 modules)

  const modules = [
    {
      title: "Module 6: Understanding Paid Ads and Your Role",
      description: "Part 2: Paid Ads — The foundation of paid advertising and your role as a paid growth person.",
      order: 6,
      lessons: [
        { order: 1, title: "1.1 What Paid Ads Actually Are", slideUrl: "p2m1l1", slidePages: 14 },
        { order: 2, title: "1.2 How Businesses Use Paid Ads", slideUrl: "p2m1l2", slidePages: 18 },
        { order: 3, title: "1.3 Your Role as the Paid Growth Person", slideUrl: "p2m1l3", slidePages: 16 },
        { order: 4, title: "1.4 The Basic Paid Ads System", slideUrl: "p2m1l4", slidePages: 16 },
        { order: 5, title: "1.5 The Different Parts of a Meta Ad Campaign", slideUrl: "p2m1l5", slidePages: 13 },
      ]
    },
    {
      title: "Module 7: Creative Strategy Fundamentals",
      description: "Part 2: Paid Ads — How to think about and evaluate ad creatives.",
      order: 7,
      lessons: [
        { order: 1, title: "2.1 Why Creatives Matter More Than Targeting", slideUrl: "p2m2l1", slidePages: 12 },
        { order: 2, title: "2.2 What Makes a Good Ad Creative", slideUrl: "p2m2l2", slidePages: 13 },
        { order: 3, title: "2.3 Hooks, Angles, and Messaging", slideUrl: "p2m2l3", slidePages: 14 },
        { order: 4, title: "2.4 Evaluating Existing Client Creatives", slideUrl: "p2m2l4", slidePages: 15 },
        { order: 5, title: "2.5 Improve or Create? Making the Right Call", slideUrl: "p2m2l5", slidePages: 13 },
      ]
    },
    {
      title: "Module 8: Making Image Creatives in Canva",
      description: "Part 2: Paid Ads — Build professional image ads using Canva.",
      order: 8,
      lessons: [
        { order: 1, title: "BONUS: Canva Templates and Creative Optimisation", slideUrl: "p2m3b",  slidePages: 16 },
        { order: 2, title: "3.1 Getting Started With Canva", slideUrl: "p2m3l1", slidePages: 13 },
        { order: 3, title: "3.2 Understanding the Canva Workspace", slideUrl: "p2m3l2", slidePages: 12 },
        { order: 4, title: "3.3 Setting Up the Correct Creative Size for Ads", slideUrl: "p2m3l3", slidePages: 12 },
        { order: 5, title: "3.4 Building an Image Ad From Scratch", slideUrl: "p2m3l4", slidePages: 15 },
        { order: 6, title: "3.5 Writing Text and Structuring Visual Hierarchy", slideUrl: "p2m3l5", slidePages: 14 },
        { order: 7, title: "3.6 Creating Carousel Creatives", slideUrl: "p2m3l6", slidePages: 14 },
        { order: 8, title: "3.7 Exporting Creatives Correctly for Ads", slideUrl: "p2m3l7", slidePages: 13 },
      ]
    },
    {
      title: "Module 9: Making Video Creatives in CapCut",
      description: "Part 2: Paid Ads — Build professional video ads using CapCut.",
      order: 9,
      lessons: [
        { order: 1, title: "4.1 Getting Started With CapCut", slideUrl: "p2m4l1", slidePages: 12 },
        { order: 2, title: "4.2 Understanding the CapCut Workspace", slideUrl: "p2m4l2", slidePages: 12 },
        { order: 3, title: "4.3 Cutting and Structuring Video Clips", slideUrl: "p2m4l3", slidePages: 13 },
        { order: 4, title: "4.4 Creating Strong Hooks for Video Ads", slideUrl: "p2m4l4", slidePages: 13 },
        { order: 5, title: "4.5 Adding Text, Captions, and Subtitles", slideUrl: "p2m4l5", slidePages: 12 },
        { order: 6, title: "4.6 Exporting Video Creatives Correctly", slideUrl: "p2m4l6", slidePages: 12 },
      ]
    },
    {
      title: "Module 10: Setting Up Meta Ads",
      description: "Part 2: Paid Ads — Set up and launch your first Meta ad campaign.",
      order: 10,
      lessons: [
        { order: 1,  title: "5.1 Understanding Meta Ads Manager", slideUrl: "p2m5l1",  slidePages: 11 },
        { order: 2,  title: "5.2 What You Need From the Client Before Starting", slideUrl: "p2m5l2",  slidePages: 11 },
        { order: 3,  title: "5.3 Understanding Meta Business Manager", slideUrl: "p2m5l3",  slidePages: 9 },
        { order: 4,  title: "5.4 How Clients Give You Access to Their Ad Account", slideUrl: "p2m5l4",  slidePages: 10 },
        { order: 5,  title: "5.5 Connecting the Facebook Page, Instagram & Pixel", slideUrl: "p2m5l5",  slidePages: 11 },
        { order: 6,  title: "5.6 Creating and Installing the Meta Pixel", slideUrl: "p2m5l6",  slidePages: 10 },
        { order: 7,  title: "5.7 Creating Your First Campaign", slideUrl: "p2m5l7",  slidePages: 10 },
        { order: 8,  title: "5.8 Setting Up the Ad Set: Targeting and Budget", slideUrl: "p2m5l8",  slidePages: 10 },
        { order: 9,  title: "5.9 Creating the Ad: Uploading Creatives and Copy", slideUrl: "p2m5l9",  slidePages: 10 },
        { order: 10, title: "5.10 Reviewing and Launching the Campaign", slideUrl: "p2m5l10", slidePages: 10 },
      ]
    },
    {
      title: "Module 11: Understanding Performance and Optimisation",
      description: "Part 2: Paid Ads — Read metrics, identify problems, scale what works.",
      order: 11,
      lessons: [
        { order: 1, title: "6.1 Understanding the Most Important Ad Metrics", slideUrl: "p2m6l1", slidePages: 10 },
        { order: 2, title: "6.2 How to Identify When an Ad Is Underperforming", slideUrl: "p2m6l2", slidePages: 9 },
        { order: 3, title: "6.3 When to Turn Off an Ad", slideUrl: "p2m6l3", slidePages: 9 },
        { order: 4, title: "6.4 Scaling Winning Ads", slideUrl: "p2m6l4", slidePages: 9 },
        { order: 5, title: "6.5 Testing Creatives and Improving Performance", slideUrl: "p2m6l5", slidePages: 9 },
      ]
    },
  ]

  for (const mod of modules) {
    const created = await (prisma.module as any).create({
      data: {
        title: mod.title,
        description: mod.description,
        order: mod.order,
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

  console.log("\n🎉 Part 2 seeded! Total new lessons: 39")
}

main().catch(console.error).finally(() => prisma.$disconnect())
