import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! } as any)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Part 1: Get Clients
  // Module 1: Understanding Brand Scaling
  const mod1 = await (prisma.module as any).create({
    data: {
      title: "Module 1: Understanding Brand Scaling",
      description: "Part 1: Get Clients — The foundation of what brand scaling is and the opportunity it represents.",
      order: 1,
      lessons: {
        create: [
          {
            order: 1,
            title: "1.1 What Brand Scaling Actually Is",
            description: "",
            videoUrl: "",
            slideUrl: "https://res.cloudinary.com/dwnfccsje/raw/upload/v1776131672/jvr-brand-scaling/slides/lesson-1.pdf",
          },
          {
            order: 2,
            title: "1.2 Why Brands Need This",
            description: "",
            videoUrl: "",
            slideUrl: "https://res.cloudinary.com/dwnfccsje/raw/upload/v1776131674/jvr-brand-scaling/slides/lesson-2.pdf",
          },
          {
            order: 3,
            title: "1.3 What You Are Actually Selling",
            description: "",
            videoUrl: "",
            slideUrl: "https://res.cloudinary.com/dwnfccsje/raw/upload/v1776131674/jvr-brand-scaling/slides/lesson-3.pdf",
          },
          {
            order: 4,
            title: "1.4 What Your Role Is, and What It Is Not",
            description: "",
            videoUrl: "",
            slideUrl: "https://res.cloudinary.com/dwnfccsje/raw/upload/v1776131675/jvr-brand-scaling/slides/lesson-4.pdf",
          },
          {
            order: 5,
            title: "1.5 The Opportunity in This Business Model",
            description: "",
            videoUrl: "",
            slideUrl: "https://res.cloudinary.com/dwnfccsje/raw/upload/v1776131676/jvr-brand-scaling/slides/lesson-5.pdf",
          },
        ],
      },
    },
  })

  // Module 2: Your Offer (no slides yet)
  await (prisma.module as any).create({
    data: {
      title: "Module 2: Your Offer",
      description: "Part 1: Get Clients — How to build an offer that's easy to buy.",
      order: 2,
      lessons: {
        create: [
          { order: 1, title: "2.1 The Simple Brand Scaling Offer", description: "", videoUrl: "", slideUrl: "" },
          { order: 2, title: "2.2 Positioning Yourself Properly", description: "", videoUrl: "", slideUrl: "" },
          { order: 3, title: "2.3 Niching Down or Staying Broad", description: "", videoUrl: "", slideUrl: "" },
          { order: 4, title: "2.4 What Makes an Offer Easy to Buy", description: "", videoUrl: "", slideUrl: "" },
          { order: 5, title: "2.5 Creating Your Offer Statement", description: "", videoUrl: "", slideUrl: "" },
        ],
      },
    },
  })

  // Module 3: Finding Leads
  await (prisma.module as any).create({
    data: {
      title: "Module 3: Finding Leads",
      description: "Part 1: Get Clients — How to find and research the right clients.",
      order: 3,
      lessons: {
        create: [
          { order: 1, title: "3.1 What a Good Client Looks Like", description: "", videoUrl: "", slideUrl: "" },
          { order: 2, title: "3.2 Where to Find Brands", description: "", videoUrl: "", slideUrl: "" },
          { order: 3, title: "3.3 How to Research a Brand Before Contacting Them", description: "", videoUrl: "", slideUrl: "" },
          { order: 4, title: "3.4 Building a Lead List", description: "", videoUrl: "", slideUrl: "" },
          { order: 5, title: "3.4A Scraping Lead Lists with Instant Data Scraper", description: "", videoUrl: "", slideUrl: "" },
          { order: 6, title: "3.4B Finding Decision-Makers with Apollo", description: "", videoUrl: "", slideUrl: "" },
          { order: 7, title: "3.5 Daily Client Acquisition Routine", description: "", videoUrl: "", slideUrl: "" },
        ],
      },
    },
  })

  // Module 4: Outreach
  await (prisma.module as any).create({
    data: {
      title: "Module 4: Outreach",
      description: "Part 1: Get Clients — How to reach out and get replies.",
      order: 4,
      lessons: {
        create: [
          { order: 1, title: "4.1 Why Most Outreach Fails", description: "", videoUrl: "", slideUrl: "" },
          { order: 2, title: "4.2 What Good Outreach Actually Looks Like", description: "", videoUrl: "", slideUrl: "" },
          { order: 3, title: "4.3 Writing DMs That Get Replies", description: "Includes the full WhatsApp outreach section.", videoUrl: "", slideUrl: "" },
          { order: 4, title: "4.4 Writing Email Outreach That Gets Opened and Replied To", description: "", videoUrl: "", slideUrl: "" },
          { order: 5, title: "4.4A Building Email Outreach Systems with Klaviyo", description: "", videoUrl: "", slideUrl: "" },
          { order: 6, title: "4.5 Cold Calling Basics", description: "", videoUrl: "", slideUrl: "" },
          { order: 7, title: "4.6 Following Up Without Sounding Desperate", description: "", videoUrl: "", slideUrl: "" },
          { order: 8, title: "4.7 Outreach Volume and Daily Execution", description: "", videoUrl: "", slideUrl: "" },
        ],
      },
    },
  })

  // Module 5: Closing Clients
  await (prisma.module as any).create({
    data: {
      title: "Module 5: Closing Clients",
      description: "Part 1: Get Clients — How to run sales calls and close deals.",
      order: 5,
      lessons: {
        create: [
          { order: 1, title: "5.1 The Goal of Closing", description: "", videoUrl: "", slideUrl: "" },
          { order: 2, title: "5.2 How the Closing Process Usually Happens", description: "", videoUrl: "", slideUrl: "" },
          { order: 3, title: "5.3 The Sales Call Structure", description: "", videoUrl: "", slideUrl: "" },
          { order: 4, title: "5.4 Asking Better Questions", description: "", videoUrl: "", slideUrl: "" },
          { order: 5, title: "5.5 Presenting the Offer Clearly", description: "", videoUrl: "", slideUrl: "" },
          { order: 6, title: "5.6 Making the Offer Easy to Say Yes To", description: "", videoUrl: "", slideUrl: "" },
          { order: 7, title: "5.7 Handling Objections", description: "", videoUrl: "", slideUrl: "" },
          { order: 8, title: "5.8 Asking for the Close", description: "", videoUrl: "", slideUrl: "" },
          { order: 9, title: "5.9 What Happens After They Say Yes", description: "", videoUrl: "", slideUrl: "" },
        ],
      },
    },
  })

  console.log("✅ Part 1: Get Clients — all 5 modules seeded")
  console.log("   Module 1: 5 lessons (with slides)")
  console.log("   Module 2: 5 lessons")
  console.log("   Module 3: 7 lessons")
  console.log("   Module 4: 8 lessons")
  console.log("   Module 5: 9 lessons")
}

main().catch(console.error).finally(() => prisma.$disconnect())
