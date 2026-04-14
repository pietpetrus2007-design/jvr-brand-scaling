import { v2 as cloudinary } from 'cloudinary'
import { execSync } from 'child_process'
import { readdirSync, mkdirSync } from 'fs'
import { join } from 'path'

cloudinary.config({
  cloud_name: 'dwnfccsje',
  api_key: '496952356133331',
  api_secret: '1kYnrqjzQf16C-J0altYjjlqoK0',
})

const lessons = [
  { id: 'mod3-lesson1', pdf: '/tmp/slides-mod3/Lesson_3.1_What_a_Good_Client_Looks_Like---74783bd2-e4d1-461f-b253-a33dede0de4b.pdf' },
  { id: 'mod3-lesson2', pdf: '/tmp/slides-mod3/Lesson_3.2_Where_to_Find_Brands---9956d886-7161-4790-8a12-ff7f8c25e9c0.pdf' },
  { id: 'mod3-lesson3', pdf: '/tmp/slides-mod3/Lesson_3.3_How_to_Research_a_Brand_Before_Contacting_Them---ec15fd5e-633d-4a76-8de7-6b38d89c63c0.pdf' },
  { id: 'mod3-lesson4', pdf: '/tmp/slides-mod3/Lesson_3.4_Building_a_Lead_List---d59a4817-9ee1-45d3-8ce9-49d8171483b6.pdf' },
  { id: 'mod3-lesson5', pdf: '/tmp/slides-mod3/Lesson_3.4A_Scraping_Lead_Lists_with_Instant_Data_Scraper---398af0b7-5507-4eaa-88c1-b575ab529d65.pdf' },
  { id: 'mod3-lesson6', pdf: '/tmp/slides-mod3/Lesson_3.4B_Finding_Decision_Makers_with_Apollo---ea965ef8-1030-4196-8567-6b66466ce5ed.pdf' },
  { id: 'mod3-lesson7', pdf: '/tmp/slides-mod3/Lesson_3.5_Daily_Client_Acquisition_Routine---6efb6932-9aab-4f0a-acba-d56ec041b559.pdf' },
]

const pageCounts = {}

for (const lesson of lessons) {
  const tmpDir = `/tmp/hires-${lesson.id}`
  mkdirSync(tmpDir, { recursive: true })
  console.log(`🔄 Converting ${lesson.id}...`)
  execSync(`magick -density 300 -quality 95 "${lesson.pdf}" -resize 1920x "${tmpDir}/slide-%d.jpg"`, { stdio: 'pipe' })
  const files = readdirSync(tmpDir).filter(f => f.endsWith('.jpg')).sort((a, b) => {
    return parseInt(a.match(/\d+/)?.[0] || '0') - parseInt(b.match(/\d+/)?.[0] || '0')
  })
  pageCounts[lesson.id] = files.length
  for (let i = 0; i < files.length; i++) {
    await cloudinary.uploader.upload(join(tmpDir, files[i]), {
      folder: `jvr-brand-scaling/hires/${lesson.id}`,
      public_id: `slide-${i + 1}`,
      overwrite: true,
      resource_type: 'image',
    })
    process.stdout.write(`   slide ${i+1}/${files.length}\r`)
  }
  console.log(`✅ ${lesson.id} — ${files.length} slides`)
}

console.log('\nPage counts:', JSON.stringify(pageCounts))
