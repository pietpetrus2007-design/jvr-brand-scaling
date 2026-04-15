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

const PDF_DIR = '/tmp/slides-p3'

const lessons = [
  { id: 'p3m1l1', pages: 10 },
  { id: 'p3m1l2', pages: 10 },
  { id: 'p3m1l3', pages: 9 },
  { id: 'p3m2l1', pages: 9 },
  { id: 'p3m2l2', pages: 9 },
  { id: 'p3m2l3', pages: 9 },
  { id: 'p3m2l4', pages: 9 },
  { id: 'p3m3l1', pages: 9 },
  { id: 'p3m3l2', pages: 9 },
  { id: 'p3m3l3', pages: 9 },
  { id: 'p3m4l1', pages: 9 },
  { id: 'p3m4l2', pages: 9 },
  { id: 'p3m4l3', pages: 9 },
  { id: 'p3m4l4', pages: 9 },
  { id: 'p3m4l5', pages: 9 },
  { id: 'p3m4l6', pages: 9 },
]

const pdfMap = {
  p3m1l1: 'Part3_M1_L1_1_How_This_Business_Model_Makes_Money',
  p3m1l2: 'Part3_M1_L1_2_The_Main_Ways_Advertisers_Charge_Clients',
  p3m1l3: 'Part3_M1_L1_3_Why_Recurring_Revenue_Is_the_Goal',
  p3m2l1: 'Part3_M2_L2_1_How_to_Think_About_Pricing',
  p3m2l2: 'Part3_M2_L2_2_Beginner_Pricing',
  p3m2l3: 'Part3_M2_L2_3_Intermediate_Pricing',
  p3m2l4: 'Part3_M2_L2_4_What_Affects_Your_Pricing',
  p3m3l1: 'Part3_M3_L3_1_What_Your_Service_Actually_Includes',
  p3m3l2: 'Part3_M3_L3_2_How_to_Present_Your_Offer_Clearly',
  p3m3l3: 'Part3_M3_L3_3_Pilot_Offers_and_Low_Risk_Starts',
  p3m4l1: 'Part3_M4_L4_1_Monthly_Retainers_Explained',
  p3m4l2: 'Part3_M4_L4_2_Setup_Fees_and_Hybrid_Deals',
  p3m4l3: 'Part3_M4_L4_3_Keeping_Clients_Long_Term',
  p3m4l4: 'Part3_M4_L4_4_Growing_From_One_Client_to_Multiple_Clients',
  p3m4l5: 'Part3_M4_L4_5_Advanced_Pricing_for_Bigger_Brands',
  p3m4l6: 'Part3_M4_L4_6_The_Complete_Brand_Scaling_Income_Model',
}

import { readdirSync as rds } from 'fs'
function findPdf(prefix) {
  const files = rds(PDF_DIR)
  const match = files.find(f => f.startsWith(prefix) && f.endsWith('.pdf'))
  return match ? join(PDF_DIR, match) : null
}

console.log('Converting PDFs to images...')
for (const lesson of lessons) {
  const tmpDir = `/tmp/hires-${lesson.id}`
  mkdirSync(tmpDir, { recursive: true })
  if (!existsSync(`${tmpDir}/slide-0.jpg`)) {
    const pdfPath = findPdf(pdfMap[lesson.id])
    execSync(`magick -density 200 -quality 88 "${pdfPath}" -resize 1600x "${tmpDir}/slide-%d.jpg"`, { stdio: 'pipe' })
    console.log(`  ✅ ${lesson.id}`)
  }
}

console.log('\nUploading to Cloudinary...')
for (const lesson of lessons) {
  const tmpDir = `/tmp/hires-${lesson.id}`
  const files = rds(tmpDir).filter(f => f.endsWith('.jpg')).sort((a, b) =>
    parseInt(a.match(/\d+/)?.[0] || '0') - parseInt(b.match(/\d+/)?.[0] || '0')
  )
  process.stdout.write(`  ${lesson.id}: `)
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
console.log('\n🎉 Part 3 uploaded!')
