/**
 * auto-replace-slide.mjs
 * Usage: node auto-replace-slide.mjs <path-to-pptx>
 * Auto-detects lesson from filename and uploads to correct Cloudinary path.
 */
import { v2 as cloudinary } from 'cloudinary'
import { execSync } from 'child_process'
import { readdirSync, mkdirSync } from 'fs'
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

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const PPTX = process.argv[2]
if (!PPTX) { console.error('Usage: node auto-replace-slide.mjs <path-to-pptx>'); process.exit(1) }

// Extract lesson number from filename e.g. "Lesson_3_2_..." → "3.2"
const fname = basename(PPTX)
const match = fname.match(/Lesson_(\d+)_(\d+)/i)
if (!match) { console.error('Cannot parse lesson number from filename:', fname); process.exit(1) }

const lessonNum = `${match[1]}.${match[2]}`
console.log(`Detected lesson: ${lessonNum}`)

// Find lesson in DB
const lessons = await prisma.lesson.findMany({
  where: { title: { contains: lessonNum } },
  select: { id: true, title: true, slideUrl: true, slidePages: true }
})

if (lessons.length === 0) {
  console.error(`No lesson found with "${lessonNum}" in title`)
  await prisma.$disconnect()
  process.exit(1)
}

// If multiple matches, pick the one whose title best matches the filename
let lesson = lessons[0]
if (lessons.length > 1) {
  console.log(`Multiple matches:`)
  lessons.forEach((l, i) => console.log(`  ${i+1}. ${l.title} (${l.slideUrl})`))
  // Pick based on filename keywords
  const fnLower = fname.toLowerCase()
  const scored = lessons.map(l => {
    const words = l.title.toLowerCase().split(/\s+/).slice(1) // skip the "X.X" part
    const score = words.filter(w => fnLower.includes(w)).length
    return { ...l, score }
  })
  scored.sort((a, b) => b.score - a.score)
  lesson = scored[0]
  console.log(`Auto-selected: ${lesson.title}`)
}

console.log(`Replacing: ${lesson.title} → ${lesson.slideUrl}`)

// Convert PPTX → PNG
const TMP = `/tmp/auto-replace-${lesson.slideUrl}`
mkdirSync(TMP, { recursive: true })

console.log('Converting PPTX → PDF...')
execSync(`soffice --headless --convert-to pdf --outdir "${TMP}" "${PPTX}" 2>/dev/null`)
const pdf = readdirSync(TMP).find(f => f.endsWith('.pdf'))
if (!pdf) { console.error('PDF conversion failed'); process.exit(1) }

console.log('Converting PDF → images...')
execSync(`gs -dBATCH -dNOPAUSE -sDEVICE=png16m -r200 -sOutputFile="${TMP}/slide-%03d.png" "${TMP}/${pdf}"`)

const slides = readdirSync(TMP).filter(f => f.endsWith('.png')).sort()
console.log(`Uploading ${slides.length} slides to ${lesson.slideUrl}...`)

for (let i = 0; i < slides.length; i++) {
  await cloudinary.uploader.upload(join(TMP, slides[i]), {
    public_id: `jvr-brand-scaling/hires/${lesson.slideUrl}/slide-${i+1}`,
    overwrite: true,
    invalidate: true,
    resource_type: 'image',
  })
  process.stdout.write(`  slide-${i+1} ✅\n`)
}

// Update slide count in DB if changed
if (slides.length !== lesson.slidePages) {
  await prisma.lesson.update({
    where: { id: lesson.id },
    data: { slidePages: slides.length }
  })
  console.log(`Updated slidePages: ${lesson.slidePages} → ${slides.length}`)
}

await prisma.$disconnect()
console.log(`\n✅ Done! ${lesson.title}: ${slides.length} slides replaced`)
