import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! } as any)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const mod4 = await (prisma.module as any).findFirst({ where: { order: 4 } })
  if (!mod4) { console.log("Module 4 not found"); return }

  const lessons = await (prisma.lesson as any).findMany({ where: { moduleId: mod4.id }, orderBy: { order: 'asc' } })

  const data = [
    { id: 'mod4-lesson1', pages: 11, resources: [
      { label: 'ChatGPT (AI writing assistant)', url: 'https://chat.openai.com' },
      { label: 'Claude (AI writing assistant)', url: 'https://claude.ai' },
    ]},
    { id: 'mod4-lesson2', pages: 11, resources: [
      { label: 'ChatGPT (refine outreach)', url: 'https://chat.openai.com' },
      { label: 'Claude (refine outreach)', url: 'https://claude.ai' },
    ]},
    { id: 'mod4-lesson3', pages: 15, resources: [
      { label: 'ChatGPT (write DMs)', url: 'https://chat.openai.com' },
      { label: 'Claude (write DMs)', url: 'https://claude.ai' },
      { label: 'Instagram DMs', url: 'https://www.instagram.com/direct/inbox/' },
      { label: 'WhatsApp', url: 'https://web.whatsapp.com' },
    ]},
    { id: 'mod4-lesson4', pages: 9, resources: [
      { label: 'Apollo.io (find emails)', url: 'https://www.apollo.io' },
      { label: 'ChatGPT (write emails)', url: 'https://chat.openai.com' },
      { label: 'Gmail', url: 'https://mail.google.com' },
      { label: 'Mailchimp', url: 'https://mailchimp.com' },
      { label: 'Instantly.ai', url: 'https://instantly.ai' },
    ]},
    { id: 'mod4-lesson5', pages: 9, resources: [
      { label: 'Klaviyo (email outreach)', url: 'https://www.klaviyo.com' },
      { label: 'Instant Data Scraper (Chrome Extension)', url: 'https://chrome.google.com/webstore/detail/instant-data-scraper/ofaokhiedipichpaobibbnahnkdoiiah' },
    ]},
    { id: 'mod4-lesson6', pages: 9, resources: [
      { label: 'Google Sheets (call tracker)', url: 'https://sheets.google.com' },
      { label: 'ChatGPT (write call scripts)', url: 'https://chat.openai.com' },
      { label: 'Otter.ai (call recording)', url: 'https://otter.ai' },
    ]},
    { id: 'mod4-lesson7', pages: 11, resources: [
      { label: 'Gmail', url: 'https://mail.google.com' },
      { label: 'ChatGPT (write follow-ups)', url: 'https://chat.openai.com' },
      { label: 'Apollo.io (track follow-ups)', url: 'https://www.apollo.io' },
      { label: 'Notion (organise leads)', url: 'https://www.notion.so' },
      { label: 'Google Sheets (tracker)', url: 'https://sheets.google.com' },
    ]},
    { id: 'mod4-lesson8', pages: 9, resources: [
      { label: 'Google Sheets (daily tracker)', url: 'https://sheets.google.com' },
      { label: 'Apollo.io', url: 'https://www.apollo.io' },
      { label: 'ChatGPT', url: 'https://chat.openai.com' },
      { label: 'Notion', url: 'https://www.notion.so' },
      { label: 'Instant Data Scraper', url: 'https://chrome.google.com/webstore/detail/instant-data-scraper/ofaokhiedipichpaobibbnahnkdoiiah' },
    ]},
  ]

  for (let i = 0; i < lessons.length; i++) {
    const d = data[i]
    await (prisma.lesson as any).update({
      where: { id: lessons[i].id },
      data: { slideUrl: d.id, slidePages: d.pages }
    })
    for (let j = 0; j < d.resources.length; j++) {
      await (prisma.resource as any).create({
        data: { lessonId: lessons[i].id, label: d.resources[j].label, url: d.resources[j].url, order: j + 1 }
      })
    }
    console.log(`✅ ${lessons[i].title} — ${d.pages} slides, ${d.resources.length} resources`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
