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
  { id: 'mod5-lesson1', pdf: '/tmp/slides-mod5/Lesson_5_1_Fixed---90e13a19-733a-444a-815c-22dd2f8480e5.pdf', pages: 9 },
  { id: 'mod5-lesson2', pdf: '/tmp/slides-mod5/Lesson_5_2_Fixed---0b872231-9559-4f37-a041-40d7c7ecb5f2.pdf', pages: 9 },
  { id: 'mod5-lesson3', pdf: '/tmp/slides-mod5/Lesson_5_3_Fixed---d9c2feba-67b3-4989-86ff-c8f0094f5c50.pdf', pages: 7 },
  { id: 'mod5-lesson4', pdf: '/tmp/slides-mod5/Lesson_5_4_Fixed---91838bf0-c77b-41f2-9b30-f0173c3669dd.pdf', pages: 7 },
  { id: 'mod5-lesson5', pdf: '/tmp/slides-mod5/Lesson_5_5_Fixed---4f166d21-a493-4d2a-a944-a6cf97288552.pdf', pages: 6 },
  { id: 'mod5-lesson6', pdf: '/tmp/slides-mod5/Lesson_5_6_Fixed---5bbec0bc-2d86-4d38-be85-33a7cf828d7b.pdf', pages: 7 },
  { id: 'mod5-lesson7', pdf: '/tmp/slides-mod5/Lesson_5_7_Fixed---a79b86f1-a455-499d-bc2b-1b122a230892.pdf', pages: 7 },
  { id: 'mod5-lesson8', pdf: '/tmp/slides-mod5/Lesson_5_8_Fixed---654c53d4-6ed3-4ee4-933a-9d120360f498.pdf', pages: 6 },
  { id: 'mod5-lesson9', pdf: '/tmp/slides-mod5/Lesson_5_9_Fixed---9cb6ae70-3ca6-44b6-a624-75e03742acd3.pdf', pages: 7 },
]

console.log('Converting all PDFs...')
for (const lesson of lessons) {
  const tmpDir = `/tmp/hires-${lesson.id}`
  mkdirSync(tmpDir, { recursive: true })
  if (!existsSync(`${tmpDir}/slide-0.jpg`)) {
    execSync(`magick -density 200 -quality 88 "${lesson.pdf}" -resize 1600x "${tmpDir}/slide-%d.jpg"`, { stdio: 'pipe' })
    console.log(`  ✅ ${lesson.id}`)
  }
}

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
        if (retries === 0) console.error(`\n   ❌ Failed slide ${i+1}`)
        else await new Promise(r => setTimeout(r, 2000))
      }
    }
  }
  console.log(`✅ ${lesson.id} complete`)
}
console.log('\n🎉 Module 5 fully uploaded!')
