/**
 * Re-upload ALL slides at 300 DPI for maximum sharpness
 */
import { v2 as cloudinary } from 'cloudinary'
import { execSync } from 'child_process'
import { readdirSync, mkdirSync, writeFileSync } from 'fs'
import { join, basename } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { PrismaClient } = require('@prisma/client')
const { PrismaNeon } = require('@prisma/adapter-neon')
const dotenv = require('dotenv')
dotenv.config()

cloudinary.config({
  cloud_name: 'dwnfccsje',
  api_key: '496952356133331',
  api_secret: '1kYnrqjzQf16C-J0altYjjlqoK0',
})

const DB_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_aH2oLvgM9IVJ@ep-jolly-dawn-andrurcd-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const adapter = new PrismaNeon({ connectionString: DB_URL })
const prisma = new PrismaClient({ adapter })

const INBOUND = '/Users/pietjansevanrensburg/.openclaw/media/inbound/'

// Get all lessons
const lessons = await prisma.lesson.findMany({
  select: { id: true, title: true, slideUrl: true, slidePages: true }
})

console.log(`Found ${lessons.length} lessons`)

// Build lesson number → slideUrl map
const lessonMap = {}
for (const l of lessons) {
  if (!l.slideUrl || !l.slidePages) continue
  const num = l.title.split(' ')[0]
  if (num && num.includes('.')) lessonMap[num] = { slideUrl: l.slideUrl, id: l.id }
}

// Get all PPTX files
const allFiles = readdirSync(INBOUND).filter(f => f.endsWith('.pptx') && f.startsWith('Lesson_'))

// Map: lessonNum → best file (prefer Fixed/-2--- replacements)
const fileMap = {}
for (const f of allFiles) {
  const m = f.match(/Lesson_(\d+)[_\.](\d+)/)
  if (!m) continue
  const num = `${m[1]}.${m[2]}`
  const existing = fileMap[num]
  const isReplacement = f.includes('-2---') || f.includes('Fixed')
  if (!existing || isReplacement) fileMap[num] = f
}

console.log(`Found ${Object.keys(fileMap).length} unique lesson files\n`)

let done = 0, skipped = 0, failed = 0

for (const [num, fname] of Object.entries(fileMap).sort()) {
  const entry = lessonMap[num]
  if (!entry) { console.log(`SKIP ${num} - not in DB`); skipped++; continue }

  const { slideUrl } = entry
  const pptx = join(INBOUND, fname)
  const TMP = `/tmp/hq300-${slideUrl}`
  mkdirSync(TMP, { recursive: true })

  console.log(`[${num}] ${slideUrl} ← ${fname.slice(0, 50)}...`)

  try {
    execSync(`soffice --headless --convert-to pdf --outdir "${TMP}" "${pptx}" 2>/dev/null`, { timeout: 60000 })
    const pdf = readdirSync(TMP).find(f => f.endsWith('.pdf'))
    if (!pdf) throw new Error('No PDF')

    execSync(`gs -dBATCH -dNOPAUSE -sDEVICE=png16m -r300 -sOutputFile="${TMP}/slide-%03d.png" "${TMP}/${pdf}"`, { timeout: 120000 })

    const slides = readdirSync(TMP).filter(f => f.endsWith('.png')).sort()
    if (!slides.length) throw new Error('No PNGs')

    process.stdout.write(`  ${slides.length} slides: `)
    for (let i = 0; i < slides.length; i++) {
      await cloudinary.uploader.upload(join(TMP, slides[i]), {
        public_id: `jvr-brand-scaling/hires/${slideUrl}/slide-${i + 1}`,
        overwrite: true, invalidate: true, resource_type: 'image',
      })
      process.stdout.write(`${i + 1}✅ `)
    }
    console.log()

    // Update DB count if changed
    const lesson = lessons.find(l => l.slideUrl === slideUrl)
    if (lesson && lesson.slidePages !== slides.length) {
      await prisma.lesson.update({ where: { id: lesson.id }, data: { slidePages: slides.length } })
      console.log(`  Updated slidePages: ${lesson.slidePages} → ${slides.length}`)
    }
    done++
  } catch (e) {
    console.log(`  ❌ Failed: ${e.message}`)
    failed++
  }
}

await prisma.$disconnect()
console.log(`\n✅ Done! ${done} uploaded, ${skipped} skipped, ${failed} failed`)

// Notify
execSync(`openclaw message send --channel telegram -t 8743667508 -m "✅ All ${done} lessons re-uploaded at 300 DPI — slides are now sharper on all screens!"`)
