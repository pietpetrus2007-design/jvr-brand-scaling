import { v2 as cloudinary } from 'cloudinary'
import { execSync } from 'child_process'
import { readdirSync, mkdirSync } from 'fs'
import { join } from 'path'

cloudinary.config({
  cloud_name: 'dwnfccsje',
  api_key: '496952356133331',
  api_secret: '1kYnrqjzQf16C-J0altYjjlqoK0',
  timeout: 120000,
})

const PDF_DIR = '/tmp/slides-replace2'

const replacements = [
  { id: 'p2m4l1', pdf: 'Part2_M4_L4_1_Getting_Started_With_CapCut-2', pages: 12 },
  { id: 'p2m4l2', pdf: 'Part2_M4_L4_2_Understanding_the_CapCut_Workspace-2', pages: 12 },
  { id: 'p2m4l3', pdf: 'Part2_M4_L4_3_Cutting_and_Structuring_Video_Clips-2', pages: 13 },
  { id: 'p2m4l5', pdf: 'Part2_M4_L4_5_Adding_Text_Captions_and_Subtitles-2', pages: 12 },
  { id: 'p2m5l5', pdf: 'Part2_M5_L5_5_Connecting_Facebook_Page_Instagram_Pixel-2', pages: 11 },
  { id: 'p2m5l6', pdf: 'Part2_M5_L5_6_Creating_and_Installing_the_Meta_Pixel-2', pages: 10 },
  { id: 'p2m6l4', pdf: 'Part2_M6_L6_4_Scaling_Winning_Ads-2', pages: 9 },
]

function findPdf(prefix) {
  const files = readdirSync(PDF_DIR)
  const match = files.find(f => f.startsWith(prefix) && f.endsWith('.pdf'))
  return match ? join(PDF_DIR, match) : null
}

console.log('Converting batch 2...')
for (const r of replacements) {
  const tmpDir = `/tmp/hires-replace2-${r.id}`
  mkdirSync(tmpDir, { recursive: true })
  const pdfPath = findPdf(r.pdf)
  if (!pdfPath) { console.log(`  ❌ Not found: ${r.pdf}`); continue }
  execSync(`magick -density 200 -quality 88 "${pdfPath}" -resize 1600x "${tmpDir}/slide-%d.jpg"`, { stdio: 'pipe' })
  console.log(`  ✅ ${r.id}`)
}

console.log('\nUploading...')
for (const r of replacements) {
  const tmpDir = `/tmp/hires-replace2-${r.id}`
  const files = readdirSync(tmpDir).filter(f => f.endsWith('.jpg')).sort((a, b) =>
    parseInt(a.match(/\d+/)?.[0] || '0') - parseInt(b.match(/\d+/)?.[0] || '0')
  )
  process.stdout.write(`  ${r.id}: `)
  for (let i = 0; i < files.length; i++) {
    let retries = 3
    while (retries > 0) {
      try {
        await cloudinary.uploader.upload(join(tmpDir, files[i]), {
          folder: `jvr-brand-scaling/hires/${r.id}`,
          public_id: `slide-${i + 1}`,
          overwrite: true,
          resource_type: 'image',
          timeout: 60000,
          invalidate: true,
        })
        process.stdout.write(`${i+1}`)
        if (i < files.length - 1) process.stdout.write(',')
        break
      } catch (e) {
        retries--
        if (retries === 0) process.stdout.write(`❌`)
        else await new Promise(r => setTimeout(r, 2000))
      }
    }
  }
  console.log(' ✅')
}
console.log('\n🎉 Batch 2 done!')
