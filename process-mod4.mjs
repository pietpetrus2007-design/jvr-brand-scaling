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
  { id: 'mod4-lesson1', pdf: '/tmp/slides-mod4/Lesson_4_1_Fixed---d372b129-0390-4650-9537-552960693d6c.pdf', pages: 11 },
  { id: 'mod4-lesson2', pdf: '/tmp/slides-mod4/Lesson_4_2_Fixed---891d9961-6058-4b41-8e16-3efab4793c95.pdf', pages: 11 },
  { id: 'mod4-lesson3', pdf: '/tmp/slides-mod4/Lesson_4_3_Fixed---d931fc92-f54f-4ea4-bb46-b1fde3c8fe9c.pdf', pages: 15 },
  { id: 'mod4-lesson4', pdf: '/tmp/slides-mod4/Lesson_4_4_Fixed---bd5773ab-d9b3-4495-9ca5-54fff356a4c3.pdf', pages: 9 },
  { id: 'mod4-lesson5', pdf: '/tmp/slides-mod4/Lesson_4_4A_Fixed---6b837777-6654-4c2b-8581-4bdd49c7f632.pdf', pages: 9 },
  { id: 'mod4-lesson6', pdf: '/tmp/slides-mod4/Lesson_4_5_Fixed---913249f1-8ed1-4e05-8df3-3472f72a122c.pdf', pages: 9 },
  { id: 'mod4-lesson7', pdf: '/tmp/slides-mod4/Lesson_4_6_Fixed---8bbe9788-aaee-48f9-91bf-b36f51a85d71.pdf', pages: 11 },
  { id: 'mod4-lesson8', pdf: '/tmp/slides-mod4/Lesson_4_7_Fixed---0805d74e-52af-48ec-a80c-464433348f1f.pdf', pages: 9 },
]

for (const lesson of lessons) {
  const tmpDir = `/tmp/hires-${lesson.id}`
  mkdirSync(tmpDir, { recursive: true })
  console.log(`🔄 Converting ${lesson.id} (${lesson.pages} slides)...`)
  execSync(`magick -density 200 -quality 90 "${lesson.pdf}" -resize 1600x "${tmpDir}/slide-%d.jpg"`, { stdio: 'pipe' })
  const files = readdirSync(tmpDir).filter(f => f.endsWith('.jpg')).sort((a, b) =>
    parseInt(a.match(/\d+/)?.[0] || '0') - parseInt(b.match(/\d+/)?.[0] || '0')
  )
  for (let i = 0; i < files.length; i++) {
    await cloudinary.uploader.upload(join(tmpDir, files[i]), {
      folder: `jvr-brand-scaling/hires/${lesson.id}`,
      public_id: `slide-${i + 1}`,
      overwrite: true,
      resource_type: 'image',
    })
    process.stdout.write(`   slide ${i+1}/${files.length}\r`)
  }
  console.log(`✅ ${lesson.id} — ${files.length} slides uploaded`)
}
console.log('\nDone! Module 4 complete.')
