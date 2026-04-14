import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! } as any)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const mod3 = await (prisma.module as any).findFirst({ where: { order: 3 } })
  const lessons = await (prisma.lesson as any).findMany({ where: { moduleId: mod3.id }, orderBy: { order: 'asc' } })

  const resources: Record<number, { label: string; url: string }[]> = {
    1: [ // 3.1
      { label: "Google Maps", url: "https://maps.google.com" },
      { label: "Meta Ad Library", url: "https://www.facebook.com/ads/library" },
      { label: "Google Search", url: "https://www.google.com" },
    ],
    3: [ // 3.3
      { label: "Meta Ad Library", url: "https://www.facebook.com/ads/library" },
      { label: "Google Search", url: "https://www.google.com" },
      { label: "Google Maps", url: "https://maps.google.com" },
      { label: "Instagram", url: "https://www.instagram.com" },
    ],
    4: [ // 3.4
      { label: "Google Sheets", url: "https://sheets.google.com" },
      { label: "Excel", url: "https://www.microsoft.com/excel" },
      { label: "Notion", url: "https://www.notion.so" },
    ],
    5: [ // 3.4A
      { label: "Instant Data Scraper (Chrome Extension)", url: "https://chrome.google.com/webstore/detail/instant-data-scraper/ofaokhiedipichpaobibbnahnkdoiiah" },
    ],
    6: [ // 3.4B
      { label: "Apollo.io", url: "https://www.apollo.io" },
    ],
    7: [ // 3.5
      { label: "Google Sheets", url: "https://sheets.google.com" },
      { label: "Apollo.io", url: "https://www.apollo.io" },
      { label: "Instant Data Scraper", url: "https://chrome.google.com/webstore/detail/instant-data-scraper/ofaokhiedipichpaobibbnahnkdoiiah" },
    ],
  }

  for (let i = 0; i < lessons.length; i++) {
    const lessonResources = resources[i + 1]
    if (!lessonResources) continue
    for (let j = 0; j < lessonResources.length; j++) {
      await (prisma.resource as any).create({
        data: { lessonId: lessons[i].id, label: lessonResources[j].label, url: lessonResources[j].url, order: j + 1 }
      })
    }
    console.log(`✅ ${lessons[i].title} — ${lessonResources.length} resources`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
