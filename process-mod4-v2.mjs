import { v2 as cloudinary } from 'cloudinary'
import { execSync } from 'child_process'
import { readdirSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

cloudinary.config({
  cloud_name: 'dwnfccsje',
  api_key: '496952356133331',
  api_secret: '1kYnrqjzQf16C-J0altYjjlqoK0',
  timeout: 120000,
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

// Step 1: Convert ALL PDFs to images first
console.log('Converting all PDFs to images...')
for (const lesson of lessons) {
  const tmpDir = `/tmp/hires-${lesson.id}`
  if (!existsSync(`${tmpDir}/slide-0.jpg`)) {
    mkdirSync(tmpDir, { recursive: true })
    execSync(`magick -density 200 -quality 88 "${lesson.pdf}" -resize 1600x "${tmpDir}/slide-%d.jpg"`, { stdio: 'pipe' })
    console.log(`  ✅ Converted ${lesson.id}`)
  } else {
    console.log(`  ⏭️  Already converted ${lesson.id}`)
  }
}

// Step 2: Upload one lesson at a time
for (const lesson of lessons) {
  const tmpDir = `/tmp/hires-${lesson.id}`
  const files = readdirSync(tmpDir).filter(f => f.endsWith('.jpg')).sort((a, b) =>
    parseInt(a.match(/\d+/)?.[0] || '0') - parseInt(b.match(/\d+/)?.[0] || '0')
  )
  console.log(`\n📤 Uploading ${lesson.id} (${files.length} slides)...`)
  for (let i = 0; i < files.length; i++) {
    let retries = 3
    while (retries > 0) {
      try {
        await cloudinary.uploader.upload(join(tmpDir, files[i]), {
          folder: `jvr-brand-scaling/hires/${lesson.id}`,
          public_id: `slide-${i + 1}`,
          overwrite: true,
          resource_type: 'image',
          timeout: 60000,
        })
        process.stdout.write(`   ${i+1}/${files.length} ✓\r`)
        break
      } catch (e) {
        retries--
        if (retries === 0) console.error(`\n   ❌ Failed slide ${i+1}: ${e.message}`)
        else await new Promise(r => setTimeout(r, 2000))
      }
    }
  }
  console.log(`✅ ${lesson.id} complete`)
}
console.log('\n🎉 Module 4 fully uploaded!')
