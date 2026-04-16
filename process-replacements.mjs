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

const PDF_DIR = '/tmp/slides-replace'

const replacements = [
  { id: 'p2m1l2', pdf: 'Part2_M1_L1_2_How_Businesses_Use_Ads-2', pages: 18 },
  { id: 'p2m1l3', pdf: 'Part2_M1_L1_3_Your_Role_As_Paid_Growth_Person-2', pages: 16 },
  { id: 'p2m1l5', pdf: 'Part2_M1_L1_5_The_Parts_of_a_Meta_Ad_Campaign-2', pages: 13 },
  { id: 'p2m2l5', pdf: 'Part2_M2_L2_5_When_to_Improve_vs_Create-2', pages: 13 },
  { id: 'p2m3l1', pdf: 'Part2_M3_L3_1_Getting_Started_With_Canva-2', pages: 13 },
  { id: 'p2m3l3', pdf: 'Part2_M3_L3_3_Setting_Up_Creative_Size-2', pages: 12 },
  { id: 'p2m3l4', pdf: 'Part2_M3_L3_4_Building_an_Image_Ad_From_Scratch-2', pages: 15 },
  { id: 'p2m3l5', pdf: 'Part2_M3_L3_5_Writing_Text_and_Visual_Hierarchy-2', pages: 14 },
  { id: 'p2m3l6', pdf: 'Part2_M3_L3_6_Creating_Carousel_Creatives-2', pages: 14 },
  { id: 'p2m3l7', pdf: 'Part2_M3_L3_7_Exporting_Creatives_Correctly-2', pages: 13 },
]

import { readdirSync as rds } from 'fs'
function findPdf(prefix) {
  const files = rds(PDF_DIR)
  const match = files.find(f => f.startsWith(prefix) && f.endsWith('.pdf'))
  return match ? join(PDF_DIR, match) : null
}

console.log('Converting to 300 DPI images...')
for (const r of replacements) {
  const tmpDir = `/tmp/hires-replace-${r.id}`
  mkdirSync(tmpDir, { recursive: true })
  const pdfPath = findPdf(r.pdf)
  if (!pdfPath) { console.log(`  ❌ PDF not found: ${r.pdf}`); continue }
  execSync(`magick -density 200 -quality 88 "${pdfPath}" -resize 1600x "${tmpDir}/slide-%d.jpg"`, { stdio: 'pipe' })
  console.log(`  ✅ ${r.id} converted`)
}

console.log('\nUploading replacements to Cloudinary (overwriting existing)...')
for (const r of replacements) {
  const tmpDir = `/tmp/hires-replace-${r.id}`
  if (!existsSync(tmpDir)) continue
  const files = rds(tmpDir).filter(f => f.endsWith('.jpg')).sort((a, b) =>
    parseInt(a.match(/\d+/)?.[0] || '0') - parseInt(b.match(/\d+/)?.[0] || '0')
  )
  process.stdout.write(`  ${r.id} (${files.length} slides): `)
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

console.log('\n🎉 All replacements uploaded!')
