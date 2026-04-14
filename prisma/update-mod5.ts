import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! } as any)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const mod5 = await (prisma.module as any).findFirst({ where: { order: 5 } })
  if (!mod5) { console.log("Module 5 not found"); return }

  const lessons = await (prisma.lesson as any).findMany({ where: { moduleId: mod5.id }, orderBy: { order: 'asc' } })

  const data = [
    { id: 'mod5-lesson1', pages: 9, resources: [
      { label: 'Google Sheets (track leads)', url: 'https://sheets.google.com' },
      { label: 'ChatGPT (prepare for calls)', url: 'https://chat.openai.com' },
      { label: 'Notion (organise pipeline)', url: 'https://www.notion.so' },
    ]},
    { id: 'mod5-lesson2', pages: 9, resources: [
      { label: 'Gmail (closing conversations)', url: 'https://mail.google.com' },
      { label: 'Google Sheets (track pipeline)', url: 'https://sheets.google.com' },
      { label: 'ChatGPT (structure messages)', url: 'https://chat.openai.com' },
    ]},
    { id: 'mod5-lesson3', pages: 7, resources: [
      { label: 'Google Sheets (call notes)', url: 'https://sheets.google.com' },
      { label: 'ChatGPT (refine questions)', url: 'https://chat.openai.com' },
      { label: 'Notion (organise structure)', url: 'https://www.notion.so' },
    ]},
    { id: 'mod5-lesson4', pages: 7, resources: [
      { label: 'Google Sheets (track answers)', url: 'https://sheets.google.com' },
      { label: 'ChatGPT (practice questions)', url: 'https://chat.openai.com' },
    ]},
    { id: 'mod5-lesson5', pages: 6, resources: [
      { label: 'Google Sheets (connect offer to client)', url: 'https://sheets.google.com' },
      { label: 'ChatGPT (structure your pitch)', url: 'https://chat.openai.com' },
    ]},
    { id: 'mod5-lesson6', pages: 7, resources: [
      { label: 'Google Sheets (track leads)', url: 'https://sheets.google.com' },
      { label: 'ChatGPT (simplify offer)', url: 'https://chat.openai.com' },
      { label: 'Notion (organise proposals)', url: 'https://www.notion.so' },
      { label: 'Wave (free invoicing for SA)', url: 'https://www.waveapps.com' },
    ]},
    { id: 'mod5-lesson7', pages: 7, resources: [
      { label: 'Google Sheets (track objections)', url: 'https://sheets.google.com' },
      { label: 'ChatGPT (practice responses)', url: 'https://chat.openai.com' },
      { label: 'Notion (objection library)', url: 'https://www.notion.so' },
    ]},
    { id: 'mod5-lesson8', pages: 6, resources: [
      { label: 'Google Sheets (track close attempts)', url: 'https://sheets.google.com' },
      { label: 'ChatGPT (sharpen your close)', url: 'https://chat.openai.com' },
      { label: 'Notion (track outcomes)', url: 'https://www.notion.so' },
    ]},
    { id: 'mod5-lesson9', pages: 7, resources: [
      { label: 'Gmail (send clear onboarding)', url: 'https://mail.google.com' },
      { label: 'Google Sheets (onboarding checklist)', url: 'https://sheets.google.com' },
      { label: 'Notion (client onboarding doc)', url: 'https://www.notion.so' },
      { label: 'Wave (invoicing)', url: 'https://www.waveapps.com' },
      { label: 'ChatGPT (write onboarding messages)', url: 'https://chat.openai.com' },
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
