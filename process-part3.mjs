/**
 * process-part3.mjs
 *
 * Pipeline:
 *  1. PPTX → PDF  (LibreOffice headless)
 *  2. PDF  → PNG  (Ghostscript, 400 DPI)
 *  3. PNG  → Cloudinary  (folder: jvr-brand-scaling/hires/<id>/, public_id: slide-N)
 *  4. DB   → delete all Part 3 modules, create 2 new modules + 8 lessons
 *  5. openclaw notification
 *
 * Prerequisites:
 *   python3 generate-part3-slides.py   ← run this first
 */

import 'dotenv/config'
import { v2 as cloudinary } from 'cloudinary'
import { execSync } from 'child_process'
import { readdirSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

// ── Config ────────────────────────────────────────────────────────────────────

cloudinary.config({
  cloud_name: 'dwnfccsje',
  api_key:    '496952356133331',
  api_secret: '1kYnrqjzQf16C-J0altYjjlqoK0',
  timeout:    120000,
})

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma  = new PrismaClient({ adapter })

const PPTX_DIR = '/tmp/part3-pptx'
const PDF_DIR  = '/tmp/part3-pdfs'
const PNG_DIR  = '/tmp/part3-pngs'

// Find executables (PATH first, then Homebrew fallback)
function findBin(name, fallback) {
  try { execSync(`which ${name}`, { stdio: 'pipe' }); return name } catch {}
  return fallback
}
const SOFFICE = findBin('soffice', '/opt/homebrew/bin/soffice')
const GS      = findBin('gs',      '/opt/homebrew/bin/gs')

const LESSONS = [
  { id: 'p3m1l1', module: 1, order: 1 },
  { id: 'p3m1l2', module: 1, order: 2 },
  { id: 'p3m1l3', module: 1, order: 3 },
  { id: 'p3m2l1', module: 2, order: 1 },
  { id: 'p3m2l2', module: 2, order: 2 },
  { id: 'p3m2l3', module: 2, order: 3 },
  { id: 'p3m2l4', module: 2, order: 4 },
  { id: 'p3m2l5', module: 2, order: 5 },
]

// ── Step 1: PPTX → PDF ────────────────────────────────────────────────────────

console.log('\n── Step 1: PPTX → PDF (LibreOffice) ────────────────────────────')
mkdirSync(PDF_DIR, { recursive: true })

for (const lesson of LESSONS) {
  const pptxPath = join(PPTX_DIR, `${lesson.id}.pptx`)
  const pdfPath  = join(PDF_DIR,  `${lesson.id}.pdf`)

  if (!existsSync(pptxPath)) {
    console.error(`  ❌  PPTX missing: ${pptxPath}`)
    console.error('       Run:  python3 generate-part3-slides.py  first.')
    process.exit(1)
  }

  if (existsSync(pdfPath)) {
    console.log(`  ⏭️   ${lesson.id}.pdf  (already exists)`)
    continue
  }

  try {
    execSync(
      `"${SOFFICE}" --headless --convert-to pdf --outdir "${PDF_DIR}" "${pptxPath}"`,
      { stdio: 'pipe' }
    )
    console.log(`  ✅  ${lesson.id}.pdf`)
  } catch (e) {
    console.error(`  ❌  LibreOffice error for ${lesson.id}:`, e.stderr?.toString() || e.message)
    process.exit(1)
  }
}

// ── Step 2: PDF → PNG (Ghostscript 400 DPI) ───────────────────────────────────

console.log('\n── Step 2: PDF → PNG (Ghostscript 400 DPI) ─────────────────────')

const slideCounts = {}

for (const lesson of LESSONS) {
  const pdfPath = join(PDF_DIR, `${lesson.id}.pdf`)
  const outDir  = join(PNG_DIR, lesson.id)
  mkdirSync(outDir, { recursive: true })

  const pngFiles = () =>
    readdirSync(outDir).filter(f => /^slide-\d+\.png$/.test(f))

  if (existsSync(join(outDir, 'slide-1.png'))) {
    const n = pngFiles().length
    slideCounts[lesson.id] = n
    console.log(`  ⏭️   ${lesson.id}  (${n} slides, already converted)`)
    continue
  }

  try {
    execSync(
      `"${GS}" -dNOPAUSE -dBATCH -sDEVICE=png16m -r400 ` +
      `-sOutputFile="${outDir}/slide-%d.png" "${pdfPath}"`,
      { stdio: 'pipe' }
    )
    const n = pngFiles().length
    slideCounts[lesson.id] = n
    console.log(`  ✅  ${lesson.id}  (${n} slides)`)
  } catch (e) {
    console.error(`  ❌  Ghostscript error for ${lesson.id}:`, e.stderr?.toString() || e.message)
    process.exit(1)
  }
}

// ── Step 3: Upload to Cloudinary ──────────────────────────────────────────────

console.log('\n── Step 3: Uploading to Cloudinary ──────────────────────────────')

for (const lesson of LESSONS) {
  const outDir = join(PNG_DIR, lesson.id)
  const files  = readdirSync(outDir)
    .filter(f => /^slide-\d+\.png$/.test(f))
    .sort((a, b) => {
      const num = s => parseInt(s.match(/\d+/)[0])
      return num(a) - num(b)
    })

  process.stdout.write(`  ${lesson.id} (${files.length} slides): `)

  for (let i = 0; i < files.length; i++) {
    const slideNum = i + 1
    let retries = 3

    while (retries > 0) {
      try {
        await cloudinary.uploader.upload(join(outDir, files[i]), {
          folder:        `jvr-brand-scaling/hires/${lesson.id}`,
          public_id:     `slide-${slideNum}`,
          overwrite:     true,
          resource_type: 'image',
          timeout:       90000,
        })
        process.stdout.write(slideNum.toString())
        if (i < files.length - 1) process.stdout.write(',')
        break
      } catch (e) {
        retries--
        if (retries === 0) {
          process.stdout.write(`❌${slideNum}`)
        } else {
          await new Promise(r => setTimeout(r, 3000))
        }
      }
    }
  }
  console.log(' ✅')
}

// ── Step 4: Rebuild Part 3 in DB ──────────────────────────────────────────────

console.log('\n── Step 4: Rebuilding Part 3 in DB ──────────────────────────────')

// Delete all Part 3 modules (lessons cascade via onDelete: Cascade)
const { count } = await prisma.module.deleteMany({ where: { part: 3 } })
console.log(`  Deleted ${count} existing Part 3 module(s)`)

const MODULE_DEFS = [
  {
    title:       'Module 1: Getting Paid',
    description: 'Part 3: Running the Business — How to structure your fees and get paid reliably.',
    order: 1, part: 3,
    lessons: [
      {
        order: 1, title: '1.1 Retainer vs Performance-Based',
        description: 'Understand the two main payment models and when to use each one.',
        slideUrl: 'p3m1l1',
      },
      {
        order: 2, title: '1.2 How to Price Yourself',
        description: 'Set your rates with confidence at every stage of your journey.',
        slideUrl: 'p3m1l2',
      },
      {
        order: 3, title: '1.3 The Pilot Phase',
        description: 'Use a strategic 2-week pilot to convert hesitant businesses into paying clients.',
        slideUrl: 'p3m1l3',
      },
    ],
  },
  {
    title:       'Module 2: Running the Business',
    description: 'Part 3: Running the Business — Invoicing, non-payment, client management, and mindset.',
    order: 2, part: 3,
    lessons: [
      {
        order: 1, title: '2.1 How to Invoice and Collect Payment',
        description: 'Send professional invoices and payment links so money arrives on time.',
        slideUrl: 'p3m2l1',
      },
      {
        order: 2, title: "2.2 What to Do When a Client Doesn't Pay",
        description: 'Handle late payments professionally without burning the relationship.',
        slideUrl: 'p3m2l2',
      },
      {
        order: 3, title: '2.3 Asking for a Raise and Dropping Bad Clients',
        description: 'Know when and how to increase your rate, and when to walk away.',
        slideUrl: 'p3m2l3',
      },
      {
        order: 4, title: '2.4 What to Say When They Ask for Guarantees',
        description: 'Answer the guarantee question honestly and confidently every time.',
        slideUrl: 'p3m2l4',
      },
      {
        order: 5, title: '2.5 The Mindset That Keeps You Going',
        description: 'Build the mental foundation to stay consistent through the hard early days.',
        slideUrl: 'p3m2l5',
      },
    ],
  },
]

for (const mod of MODULE_DEFS) {
  const created = await prisma.module.create({
    data: {
      title:       mod.title,
      description: mod.description,
      order:       mod.order,
      part:        mod.part,
      lessons: {
        create: mod.lessons.map(l => ({
          order:       l.order,
          title:       l.title,
          description: l.description,
          videoUrl:    '',
          slideUrl:    l.slideUrl,
          slidePages:  slideCounts[l.slideUrl] ?? 6,
        })),
      },
    },
    include: { lessons: { orderBy: { order: 'asc' } } },
  })
  console.log(`  ✅  ${created.title}`)
  for (const l of created.lessons) {
    console.log(`       • ${l.title}  [${l.slideUrl}, ${l.slidePages} slides]`)
  }
}

await prisma.$disconnect()

// ── Done ──────────────────────────────────────────────────────────────────────

console.log('\n🎉  Part 3 fully rebuilt — 2 modules, 8 lessons\n')

try {
  execSync(
    'openclaw system event --text "Done: Part 3 rebuilt with 8 new lessons" --mode now',
    { stdio: 'inherit' }
  )
} catch {
  // openclaw not critical — silently skip if not available
}
