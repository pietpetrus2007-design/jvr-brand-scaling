import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! } as any)
const prisma = new PrismaClient({ adapter } as any)

async function addResources(slideUrl: string, resources: { label: string; url: string }[]) {
  const lesson = await (prisma.lesson as any).findFirst({ where: { slideUrl } })
  if (!lesson) { console.log(`  ⚠️  Not found: ${slideUrl}`); return }
  for (let i = 0; i < resources.length; i++) {
    await (prisma.resource as any).create({
      data: { lessonId: lesson.id, label: resources[i].label, url: resources[i].url, order: i + 1 }
    })
  }
  console.log(`✅ ${slideUrl} — ${resources.length} resources`)
}

async function main() {
  // Module 6: Understanding Paid Ads
  await addResources('p2m5l1', [
    { label: 'Meta Ads Manager', url: 'https://www.facebook.com/adsmanager' },
  ])
  await addResources('p2m5l3', [
    { label: 'Meta Business Manager', url: 'https://business.facebook.com' },
  ])
  await addResources('p2m5l5', [
    { label: 'Meta Business Manager', url: 'https://business.facebook.com' },
    { label: 'Facebook Events Manager (Pixel)', url: 'https://www.facebook.com/events_manager' },
  ])
  await addResources('p2m5l6', [
    { label: 'Facebook Events Manager (Pixel)', url: 'https://www.facebook.com/events_manager' },
    { label: 'Meta Pixel Helper (Chrome Extension)', url: 'https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc' },
  ])
  await addResources('p2m5l7', [
    { label: 'Meta Ads Manager', url: 'https://www.facebook.com/adsmanager' },
  ])
  await addResources('p2m5l8', [
    { label: 'Meta Ads Manager', url: 'https://www.facebook.com/adsmanager' },
    { label: 'Meta Audience Insights', url: 'https://www.facebook.com/business/insights/tools/audience' },
  ])
  await addResources('p2m5l9', [
    { label: 'Meta Ads Manager', url: 'https://www.facebook.com/adsmanager' },
    { label: 'Canva (image ad creation)', url: 'https://www.canva.com' },
    { label: 'CapCut (video ad creation)', url: 'https://www.capcut.com' },
  ])
  await addResources('p2m5l10', [
    { label: 'Meta Ads Manager', url: 'https://www.facebook.com/adsmanager' },
  ])

  // Module 7: Creative Strategy
  await addResources('p2m2l1', [
    { label: 'Meta Ad Library (competitor research)', url: 'https://www.facebook.com/ads/library' },
  ])
  await addResources('p2m2l3', [
    { label: 'Meta Ad Library', url: 'https://www.facebook.com/ads/library' },
    { label: 'ChatGPT (write hooks and angles)', url: 'https://chat.openai.com' },
  ])
  await addResources('p2m2l4', [
    { label: 'Meta Ad Library', url: 'https://www.facebook.com/ads/library' },
    { label: 'Meta Ads Manager', url: 'https://www.facebook.com/adsmanager' },
  ])

  // Module 8: Canva
  await addResources('p2m3b', [
    { label: 'Canva', url: 'https://www.canva.com' },
    { label: 'Canva Templates', url: 'https://www.canva.com/templates' },
  ])
  await addResources('p2m3l1', [
    { label: 'Canva (sign up free)', url: 'https://www.canva.com' },
  ])
  await addResources('p2m3l2', [
    { label: 'Canva', url: 'https://www.canva.com' },
  ])
  await addResources('p2m3l3', [
    { label: 'Meta Ad Specs', url: 'https://www.facebook.com/business/ads-guide' },
    { label: 'Canva', url: 'https://www.canva.com' },
  ])
  await addResources('p2m3l4', [
    { label: 'Canva', url: 'https://www.canva.com' },
    { label: 'Unsplash (free stock photos)', url: 'https://unsplash.com' },
    { label: 'Pexels (free stock photos)', url: 'https://www.pexels.com' },
  ])
  await addResources('p2m3l5', [
    { label: 'Google Fonts', url: 'https://fonts.google.com' },
    { label: 'Canva', url: 'https://www.canva.com' },
  ])
  await addResources('p2m3l6', [
    { label: 'Canva', url: 'https://www.canva.com' },
    { label: 'Meta Ad Specs (carousel)', url: 'https://www.facebook.com/business/ads-guide/carousel' },
  ])
  await addResources('p2m3l7', [
    { label: 'Canva', url: 'https://www.canva.com' },
    { label: 'Meta Ad Specs', url: 'https://www.facebook.com/business/ads-guide' },
  ])

  // Module 9: CapCut
  await addResources('p2m4l1', [
    { label: 'CapCut (download)', url: 'https://www.capcut.com' },
  ])
  await addResources('p2m4l2', [
    { label: 'CapCut', url: 'https://www.capcut.com' },
  ])
  await addResources('p2m4l3', [
    { label: 'CapCut', url: 'https://www.capcut.com' },
  ])
  await addResources('p2m4l4', [
    { label: 'CapCut', url: 'https://www.capcut.com' },
    { label: 'Meta Ad Library (hook research)', url: 'https://www.facebook.com/ads/library' },
    { label: 'ChatGPT (write hooks)', url: 'https://chat.openai.com' },
  ])
  await addResources('p2m4l5', [
    { label: 'CapCut', url: 'https://www.capcut.com' },
  ])
  await addResources('p2m4l6', [
    { label: 'CapCut', url: 'https://www.capcut.com' },
    { label: 'Meta Ad Specs (video)', url: 'https://www.facebook.com/business/ads-guide/video' },
  ])

  // Module 11: Performance
  await addResources('p2m6l1', [
    { label: 'Meta Ads Manager', url: 'https://www.facebook.com/adsmanager' },
    { label: 'Google Sheets (track metrics)', url: 'https://sheets.google.com' },
  ])
  await addResources('p2m6l2', [
    { label: 'Meta Ads Manager', url: 'https://www.facebook.com/adsmanager' },
  ])
  await addResources('p2m6l3', [
    { label: 'Meta Ads Manager', url: 'https://www.facebook.com/adsmanager' },
    { label: 'Google Sheets (decision tracker)', url: 'https://sheets.google.com' },
  ])
  await addResources('p2m6l4', [
    { label: 'Meta Ads Manager', url: 'https://www.facebook.com/adsmanager' },
  ])
  await addResources('p2m6l5', [
    { label: 'Meta Ads Manager', url: 'https://www.facebook.com/adsmanager' },
    { label: 'Meta Ad Library', url: 'https://www.facebook.com/ads/library' },
    { label: 'Google Sheets (testing tracker)', url: 'https://sheets.google.com' },
  ])

  console.log("\n🎉 All Part 2 resources added!")
}

main().catch(console.error).finally(() => prisma.$disconnect())
