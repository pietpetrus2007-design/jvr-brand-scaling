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

const PDF_DIR = '/tmp/slides-p2'

const lessons = [
  // Module 6 (db order 6, continues from Part 1's 5 modules)
  { id: 'p2m1l1', pdf: 'Part2_M1_L1_1_What_Paid_Ads_Are', pages: 14 },
  { id: 'p2m1l2', pdf: 'Part2_M1_L1_2_How_Businesses_Use_Ads', pages: 18 },
  { id: 'p2m1l3', pdf: 'Part2_M1_L1_3_Your_Role_As_Paid_Growth_Person', pages: 16 },
  { id: 'p2m1l4', pdf: 'Part2_M1_L1_4_The_Basic_Paid_Ads_System', pages: 16 },
  { id: 'p2m1l5', pdf: 'Part2_M1_L1_5_The_Parts_of_a_Meta_Ad_Campaign', pages: 13 },
  // Module 7
  { id: 'p2m2l1', pdf: 'Part2_M2_L2_1_Why_Creatives_Matter_More_Than_Targeting', pages: 12 },
  { id: 'p2m2l2', pdf: 'Part2_M2_L2_2_What_Makes_a_Good_Ad_Creative', pages: 13 },
  { id: 'p2m2l3', pdf: 'Part2_M2_L2_3_Hooks_Angles_and_Messaging', pages: 14 },
  { id: 'p2m2l4', pdf: 'Part2_M2_L2_4_Evaluating_Client_Creatives', pages: 15 },
  { id: 'p2m2l5', pdf: 'Part2_M2_L2_5_When_to_Improve_vs_Create', pages: 13 },
  // Module 8 (Canva)
  { id: 'p2m3b',  pdf: 'Part2_M3_Bonus_Canva_Templates_and_Creative_Optimization', pages: 16 },
  { id: 'p2m3l1', pdf: 'Part2_M3_L3_1_Getting_Started_With_Canva', pages: 13 },
  { id: 'p2m3l2', pdf: 'Part2_M3_L3_2_Understanding_the_Canva_Workspace', pages: 12 },
  { id: 'p2m3l3', pdf: 'Part2_M3_L3_3_Setting_Up_Creative_Size', pages: 12 },
  { id: 'p2m3l4', pdf: 'Part2_M3_L3_4_Building_an_Image_Ad_From_Scratch', pages: 15 },
  { id: 'p2m3l5', pdf: 'Part2_M3_L3_5_Writing_Text_and_Visual_Hierarchy', pages: 14 },
  { id: 'p2m3l6', pdf: 'Part2_M3_L3_6_Creating_Carousel_Creatives', pages: 14 },
  { id: 'p2m3l7', pdf: 'Part2_M3_L3_7_Exporting_Creatives_Correctly', pages: 13 },
  // Module 9 (CapCut)
  { id: 'p2m4l1', pdf: 'Part2_M4_L4_1_Getting_Started_With_CapCut', pages: 12 },
  { id: 'p2m4l2', pdf: 'Part2_M4_L4_2_Understanding_the_CapCut_Workspace', pages: 12 },
  { id: 'p2m4l3', pdf: 'Part2_M4_L4_3_Cutting_and_Structuring_Video_Clips', pages: 13 },
  { id: 'p2m4l4', pdf: 'Part2_M4_L4_4_Creating_Strong_Hooks_for_Video_Ads', pages: 13 },
  { id: 'p2m4l5', pdf: 'Part2_M4_L4_5_Adding_Text_Captions_and_Subtitles', pages: 12 },
  { id: 'p2m4l6', pdf: 'Part2_M4_L4_6_Exporting_Video_Creatives_Correctly', pages: 12 },
  // Module 10 (Meta Ads)
  { id: 'p2m5l1',  pdf: 'Part2_M5_L5_1_Understanding_Meta_Ads_Manager', pages: 11 },
  { id: 'p2m5l2',  pdf: 'Part2_M5_L5_2_What_You_Need_From_the_Client', pages: 11 },
  { id: 'p2m5l3',  pdf: 'Part2_M5_L5_3_Understanding_Meta_Business_Manager', pages: 9 },
  { id: 'p2m5l4',  pdf: 'Part2_M5_L5_4_How_Clients_Give_You_Access', pages: 10 },
  { id: 'p2m5l5',  pdf: 'Part2_M5_L5_5_Connecting_Facebook_Page_Instagram_Pixel', pages: 11 },
  { id: 'p2m5l6',  pdf: 'Part2_M5_L5_6_Creating_and_Installing_the_Meta_Pixel', pages: 10 },
  { id: 'p2m5l7',  pdf: 'Part2_M5_L5_7_Creating_Your_First_Campaign', pages: 10 },
  { id: 'p2m5l8',  pdf: 'Part2_M5_L5_8_Setting_Up_the_Ad_Set', pages: 10 },
  { id: 'p2m5l9',  pdf: 'Part2_M5_L5_9_Creating_the_Ad', pages: 10 },
  { id: 'p2m5l10', pdf: 'Part2_M5_L5_10_Reviewing_and_Launching_the_Campaign', pages: 10 },
  // Module 11 (Optimization)
  { id: 'p2m6l1', pdf: 'Part2_M6_L6_1_Understanding_the_Most_Important_Ad_Metrics', pages: 10 },
  { id: 'p2m6l2', pdf: 'Part2_M6_L6_2_How_to_Identify_When_an_Ad_Is_Underperforming', pages: 9 },
  { id: 'p2m6l3', pdf: 'Part2_M6_L6_3_When_to_Turn_Off_an_Ad', pages: 9 },
  { id: 'p2m6l4', pdf: 'Part2_M6_L6_4_Scaling_Winning_Ads', pages: 9 },
  { id: 'p2m6l5', pdf: 'Part2_M6_L6_5_Testing_Creatives_and_Improving_Performance', pages: 9 },
]

// Find PDF file by prefix
function findPdf(prefix) {
  const files = readdirSync(PDF_DIR)
  const match = files.find(f => f.startsWith(prefix) && f.endsWith('.pdf'))
  return match ? join(PDF_DIR, match) : null
}

console.log('Step 1: Converting all PDFs to images...')
for (const lesson of lessons) {
  const tmpDir = `/tmp/hires-${lesson.id}`
  mkdirSync(tmpDir, { recursive: true })
  if (!existsSync(`${tmpDir}/slide-0.jpg`)) {
    const pdfPath = findPdf(lesson.pdf)
    if (!pdfPath) { console.log(`  ❌ PDF not found: ${lesson.pdf}`); continue }
    execSync(`magick -density 200 -quality 88 "${pdfPath}" -resize 1600x "${tmpDir}/slide-%d.jpg"`, { stdio: 'pipe' })
    console.log(`  ✅ ${lesson.id} (${lesson.pages} slides)`)
  } else {
    console.log(`  ⏭️  ${lesson.id} already converted`)
  }
}

console.log('\nStep 2: Uploading to Cloudinary...')
for (const lesson of lessons) {
  const tmpDir = `/tmp/hires-${lesson.id}`
  const files = readdirSync(tmpDir).filter(f => f.endsWith('.jpg')).sort((a, b) =>
    parseInt(a.match(/\d+/)?.[0] || '0') - parseInt(b.match(/\d+/)?.[0] || '0')
  )
  process.stdout.write(`  ${lesson.id} (${files.length} slides): `)
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

console.log('\n🎉 All Part 2 slides uploaded!')
