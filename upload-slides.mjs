import { v2 as cloudinary } from 'cloudinary'
import { readdirSync } from 'fs'
import { join } from 'path'

cloudinary.config({
  cloud_name: 'dwnfccsje',
  api_key: '496952356133331',
  api_secret: '1kYnrqjzQf16C-J0altYjjlqoK0',
})

const dir = '/tmp/slides-pdf'
const files = readdirSync(dir).filter(f => f.endsWith('.pdf')).sort()

const lessons = [
  { file: files.find(f => f.includes('1.1')), name: 'Lesson 1.1 — What Brand Scaling Actually Is', order: 1 },
  { file: files.find(f => f.includes('1.2')), name: 'Lesson 1.2 — Why Brands Need This', order: 2 },
  { file: files.find(f => f.includes('1.3')), name: 'Lesson 1.3 — What You Are Actually Selling', order: 3 },
  { file: files.find(f => f.includes('1.4')), name: 'Lesson 1.4 — What Your Role Is and What It Is Not', order: 4 },
  { file: files.find(f => f.includes('1.5')), name: 'Lesson 1.5 — The Opportunity in This Business Model', order: 5 },
]

for (const lesson of lessons) {
  if (!lesson.file) { console.log(`❌ Not found: ${lesson.name}`); continue }
  const path = join(dir, lesson.file)
  const result = await cloudinary.uploader.upload(path, {
    resource_type: 'raw',
    folder: 'jvr-brand-scaling/slides',
    public_id: `lesson-${lesson.order}`,
    overwrite: true,
  })
  console.log(`✅ ${lesson.name}`)
  console.log(`   URL: ${result.secure_url}`)
}
