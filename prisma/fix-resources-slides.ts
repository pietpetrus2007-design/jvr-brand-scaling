import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { v2 as cloudinary } from "cloudinary"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

cloudinary.config({
  cloud_name: "dwnfccsje",
  api_key: "496952356133331",
  api_secret: "1kYnrqjzQf16C-J0altYjjlqoK0",
})

// Map: lessonId → tools from the "Tools & Resources" slide
const LESSON_RESOURCES: Record<string, { label: string; url: string }[]> = {
  "mod2-lesson3": [
    { label: "Meta Ad Library", url: "https://www.facebook.com/ads/library" },
    { label: "Google Maps", url: "https://maps.google.com" },
    { label: "Google Search", url: "https://www.google.com" },
  ],
  "mod3-lesson1": [
    { label: "Google Maps", url: "https://maps.google.com" },
    { label: "Meta Ad Library", url: "https://www.facebook.com/ads/library" },
    { label: "Google Search", url: "https://www.google.com" },
  ],
  "mod3-lesson3": [
    { label: "Meta Ad Library", url: "https://www.facebook.com/ads/library" },
    { label: "Google Search", url: "https://www.google.com" },
    { label: "Google Maps", url: "https://maps.google.com" },
    { label: "Instagram", url: "https://www.instagram.com" },
  ],
  "mod3-lesson4": [
    { label: "Google Sheets", url: "https://sheets.google.com" },
    { label: "Microsoft Excel", url: "https://www.microsoft.com/excel" },
    { label: "Notion", url: "https://www.notion.so" },
  ],
  "mod3-lesson5": [
    { label: "Instant Data Scraper", url: "https://chrome.google.com/webstore/detail/instant-data-scraper/ofaokhiedipichpaobibbnahnkdoiiah" },
  ],
}

// Also add missing Apollo lesson (3.4B → mod3-lesson6 or similar)
// First let's find 3.4B and 3.5 IDs
async function main() {
  // Find 3.4B and 3.5
  const extra = await prisma.lesson.findMany({
    where: { title: { contains: "3.4B" } },
    include: { resources: true }
  })
  const extra35 = await prisma.lesson.findMany({
    where: { title: { contains: "3.5" } },
    include: { resources: true }
  })
  
  if (extra.length > 0) {
    LESSON_RESOURCES[extra[0].slideUrl!] = [
      { label: "Apollo", url: "https://www.apollo.io" },
    ]
    console.log(`Found 3.4B: ${extra[0].slideUrl}`)
  }
  if (extra35.length > 0) {
    const lesson35 = extra35.find(l => l.title.includes("Daily"))
    if (lesson35) {
      LESSON_RESOURCES[lesson35.slideUrl!] = [
        { label: "Google Sheets", url: "https://sheets.google.com" },
        { label: "Apollo", url: "https://www.apollo.io" },
        { label: "Instant Data Scraper", url: "https://chrome.google.com/webstore/detail/instant-data-scraper/ofaokhiedipichpaobibbnahnkdoiiah" },
      ]
      console.log(`Found 3.5: ${lesson35.slideUrl}`)
    }
  }

  for (const [slideUrl, tools] of Object.entries(LESSON_RESOURCES)) {
    const lesson = await prisma.lesson.findFirst({
      where: { slideUrl },
      include: { resources: true }
    })
    if (!lesson) { console.log(`Lesson not found: ${slideUrl}`); continue }

    console.log(`\nProcessing: ${lesson.title} (${slideUrl}, ${lesson.slidePages} slides)`)

    // Delete existing resources
    await prisma.resource.deleteMany({ where: { lessonId: lesson.id } })

    // Create new resources
    for (let i = 0; i < tools.length; i++) {
      await prisma.resource.create({
        data: {
          lessonId: lesson.id,
          label: tools[i].label,
          url: tools[i].url,
          order: i + 1,
        }
      })
      console.log(`  + Resource: ${tools[i].label}`)
    }

    // Delete the last slide (Tools & Resources slide) from Cloudinary
    const lastSlide = lesson.slidePages
    const publicId = `jvr-brand-scaling/hires/${slideUrl}/slide-${lastSlide}`
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true })
      console.log(`  - Deleted slide-${lastSlide} from Cloudinary`)
    } catch (e: any) {
      console.log(`  ! Could not delete slide-${lastSlide}: ${e.message}`)
    }

    // Reduce slidePages by 1
    await prisma.lesson.update({
      where: { id: lesson.id },
      data: { slidePages: lastSlide - 1 }
    })
    console.log(`  ✅ slidePages: ${lastSlide} → ${lastSlide - 1}`)
  }

  await prisma.$disconnect()
  console.log("\n✅ All done!")
}

main().catch(console.error)
