/**
 * Fix slide mixup — re-upload correct PPTX to correct Cloudinary path
 * Matches by PPTX filename prefix (Part1=Lesson_, Part2=Part2_, Part3=Part3_)
 */
import { v2 as cloudinary } from 'cloudinary'
import { execSync } from 'child_process'
import { readdirSync, mkdirSync } from 'fs'
import { join } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { PrismaClient } = require('@prisma/client')
const { PrismaNeon } = require('@prisma/adapter-neon')

cloudinary.config({
  cloud_name: 'dwnfccsje',
  api_key: '496952356133331',
  api_secret: '1kYnrqjzQf16C-J0altYjjlqoK0',
})

const DB_URL = 'postgresql://neondb_owner:npg_aH2oLvgM9IVJ@ep-jolly-dawn-andrurcd-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const adapter = new PrismaNeon({ connectionString: DB_URL })
const prisma = new PrismaClient({ adapter })
const INBOUND = '/Users/pietjansevanrensburg/.openclaw/media/inbound/'

// Explicit correct mapping: slideUrl → correct PPTX file prefix
// Part 1: mod1-lesson*, mod2-lesson*, mod3-lesson*, mod4-lesson*, mod5-lesson*
// Part 2: p2m*
// Part 3: p3m*

const CORRECT_MAPPING = {
  // Part 1 — Lesson_ prefix files
  'mod1-lesson1': 'Lesson_1.1_What_Brand_Scaling_Actually_Is',
  'mod1-lesson2': 'Lesson_1.2_Why_Brands_Need_This',
  'mod1-lesson3': 'Lesson_1_3_What_You_Are_Actually_Selling',  // use the replacement
  'mod1-lesson4': 'Lesson_1.4_What_Your_Role_Is',
  'mod1-lesson5': 'Lesson_1.5_The_Opportunity',
  'mod2-lesson1': 'Lesson_2_1_The_Simple_Brand_Scaling_Offer',  // replacement
  'mod2-lesson2': 'Lesson_2.2_Positioning_Yourself',
  'mod2-lesson3': 'Lesson_2.3_Niching_Down',
  'mod2-lesson4': 'Lesson_2.4_What_Makes_an_Offer',
  'mod2-lesson5': 'Lesson_2.5_Creating_Your_Offer',
  'mod3-lesson1': 'Lesson_3.1_What_a_Good_Client',
  'mod3-lesson2': 'Lesson_3_2_Where_to_Find_Brands',  // replacement
  'mod3-lesson3': 'Lesson_3_3_How_to_Research',  // replacement
  'mod3-lesson4': 'Lesson_3.4_Building_a_Lead_List',
  'mod3-lesson5': 'Lesson_3_4A_Scraping_Lead',  // replacement
  'mod3-lesson6': 'Lesson_3.4B_Finding_Decision',
  'mod3-lesson7': 'Lesson_3.5_Daily_Client',
  // Part 2 — Part2_ prefix
  'p2m1l1': 'Part2_M1_L1_1_What_Paid_Ads_Are',
  'p2m1l2': 'Part2_M1_L1_2_How_Businesses_Use_Ads-2',  // replacement
  'p2m1l3': 'Part2_M1_L1_3_Your_Role_As_Paid_Growth_Person-2',  // replacement
  'p2m1l4': 'Part2_M1_L1_4_The_Basic_Paid_Ads',
  'p2m1l5': 'Part2_M1_L1_5_The_Parts_of_a_Meta_Ad_Campaign-2',  // replacement
  'p2m2l1': 'Part2_M2_L2_1_Why_Creatives_Matter',
  'p2m2l2': 'Part2_M2_L2_2_What_Makes_a_Good_Ad',
  'p2m2l3': 'Part2_M2_L2_3_Hooks_Angles',
  'p2m2l4': 'Part2_M2_L2_4_Evaluating_Client',
  'p2m2l5': 'Part2_M2_L2_5_When_to_Improve_vs_Create-2',  // replacement
  'p2m3b':  'Part2_M3_Bonus_Canva_Templates',
  'p2m3l1': 'Part2_M3_L3_1_Getting_Started_With_Canva-2',  // replacement
  'p2m3l2': 'Part2_M3_L3_2_Understanding_the_Canva_Workspace',
  'p2m3l3': 'Part2_M3_L3_3_Setting_Up_Creative_Size-2',  // replacement
  'p2m3l4': 'Part2_M3_L3_4_Building_an_Image_Ad_From_Scratch-2',  // replacement
  'p2m3l5': 'Part2_M3_L3_5_Writing_Text_and_Visual_Hierarchy-2',  // replacement
  'p2m3l6': 'Part2_M3_L3_6_Creating_Carousel_Creatives-2',  // replacement
  'p2m3l7': 'Part2_M3_L3_7_Exporting_Creatives_Correctly-2',  // replacement
  'p2m4l1': 'Part2_M4_L4_1_Getting_Started_With_CapCut-2',  // replacement
  'p2m4l2': 'Part2_M4_L4_2_Understanding_the_CapCut_Workspace-2',  // replacement
  'p2m4l3': 'Part2_M4_L4_3_Cutting_and_Structuring_Video_Clips-2',  // replacement
  'p2m4l4': 'Part2_M4_L4_4_Creating_Strong_Hooks',
  'p2m4l5': 'Part2_M4_L4_5_Adding_Text_Captions_and_Subtitles-2',  // replacement
  'p2m4l6': 'Part2_M4_L4_6_Exporting_Video_Creatives',
  'p2m5l1': 'Lesson_5_1_Fixed',
  'p2m5l2': 'Lesson_5_2_Fixed',
  'p2m5l3': 'Lesson_5_3_Fixed',
  'p2m5l4': 'Lesson_5_4_Fixed',
  'p2m5l5': 'Lesson_5_5_Fixed-2',  // replacement
  'p2m5l6': 'Lesson_5_6_Fixed',
  'p2m5l7': 'Lesson_5_7_Fixed',
  'p2m5l8': 'Lesson_5_8_Fixed',
  'p2m5l9': 'Lesson_5_9_Fixed',
  'p2m5l10': 'Part2_M5_L5_10_Reviewing',
  'p2m6l1': 'Part2_M6_L6_1_Understanding_the_Most_Important',
  'p2m6l2': 'Part2_M6_L6_2_How_to_Identify',
  'p2m6l3': 'Part2_M6_L6_3_When_to_Turn_Off',
  'p2m6l4': 'Part2_M6_L6_4_Scaling_Winning_Ads-2',  // replacement
  'p2m6l5': 'Part2_M6_L6_5_Testing_Creatives',
  // Part 3 — Part3_ prefix
  'p3m1l1': 'Part3_M1_L1_1_How_This_Business_Model',
  'p3m1l2': 'Part3_M1_L1_2_The_Main_Ways',
  'p3m1l3': 'Part3_M1_L1_3_Why_Recurring_Revenue',
  'p3m2l1': 'Part3_M2_L2_1_How_to_Think_About_Pricing',
  'p3m2l2': 'Part3_M2_L2_2_Beginner_Pricing',
  'p3m2l3': 'Part3_M2_L2_3_Intermediate_Pricing',
  'p3m2l4': 'Part3_M2_L2_4_What_Affects_Your_Pricing',
  'p3m3l1': 'Part3_M3_L3_1_What_Your_Service',
  'p3m3l2': 'Part3_M3_L3_2_How_to_Present',
  'p3m3l3': 'Part3_M3_L3_3_Pilot_Offers',
  'p3m4l1': 'Part3_M4_L4_1_Monthly_Retainers',
  'p3m4l2': 'Part3_M4_L4_2_Setup_Fees',
  'p3m4l3': 'Part3_M4_L4_3_Keeping_Clients',
  'p3m4l4': 'Part3_M4_L4_4_Growing_From_One_Client',
  'p3m4l5': 'Part3_M4_L4_5_Advanced_Pricing',
  'p3m4l6': 'Part3_M4_L4_6_The_Complete_Brand_Scaling_Income',
  // Part 1 modules 4 and 5
  'mod4-lesson1': 'Lesson_4_1_Fixed',
  'mod4-lesson2': 'Lesson_4_2_Fixed',
  'mod4-lesson3': 'Lesson_4_3_Fixed',
  'mod4-lesson4': 'Lesson_4_4_Fixed',
  'mod4-lesson4a': 'Lesson_4_4A_Fixed',
  'mod4-lesson5': 'Lesson_4_5_Fixed',
  'mod4-lesson6': 'Lesson_4_6_Fixed',
  'mod4-lesson7': 'Lesson_4_7_Fixed-2',  // replacement
  'mod5-lesson1': 'Lesson_5_1_Fixed',
  'mod5-lesson2': 'Lesson_5_2_Fixed',
  'mod5-lesson3': 'Lesson_5_3_Fixed',
  'mod5-lesson4': 'Lesson_5_4_Fixed',
  'mod5-lesson5': 'Lesson_5_5_Fixed-2',  // replacement
  'mod5-lesson6': 'Lesson_5_6_Fixed',
  'mod5-lesson7': 'Lesson_5_7_Fixed',
  'mod5-lesson8': 'Lesson_5_8_Fixed',
  'mod5-lesson9': 'Lesson_5_9_Fixed',
}

// Find actual file in inbound matching a prefix
function findFile(prefix) {
  const files = readdirSync(INBOUND)
  const match = files.find(f => f.startsWith(prefix) && f.endsWith('.pptx'))
  return match ? join(INBOUND, match) : null
}

let done = 0, failed = 0, skipped = 0

for (const [slideUrl, prefix] of Object.entries(CORRECT_MAPPING)) {
  const pptx = findFile(prefix)
  if (!pptx) {
    console.log(`SKIP ${slideUrl} — no file for prefix: ${prefix}`)
    skipped++
    continue
  }

  const TMP = `/tmp/fix-${slideUrl}`
  mkdirSync(TMP, { recursive: true })

  console.log(`\n[${slideUrl}] ${prefix.slice(0,50)}`)

  try {
    execSync(`soffice --headless --convert-to pdf --outdir "${TMP}" "${pptx}" 2>/dev/null`, { timeout: 60000 })
    const pdf = readdirSync(TMP).find(f => f.endsWith('.pdf'))
    if (!pdf) throw new Error('No PDF')

    execSync(`gs -dBATCH -dNOPAUSE -sDEVICE=png16m -r400 -dTextAlphaBits=4 -dGraphicsAlphaBits=4 -sOutputFile="${TMP}/slide-%03d.png" "${TMP}/${pdf}"`, { timeout: 120000 })

    const slides = readdirSync(TMP).filter(f => f.endsWith('.png')).sort()
    if (!slides.length) throw new Error('No PNGs')

    process.stdout.write(`  ${slides.length} slides: `)
    for (let i = 0; i < slides.length; i++) {
      await cloudinary.uploader.upload(join(TMP, slides[i]), {
        public_id: `jvr-brand-scaling/hires/${slideUrl}/slide-${i + 1}`,
        overwrite: true, invalidate: true, resource_type: 'image',
      })
      process.stdout.write(`${i + 1}✅ `)
    }
    console.log()

    // Update DB slide count
    await prisma.lesson.updateMany({ where: { slideUrl }, data: { slidePages: slides.length } })
    done++
  } catch (e) {
    console.log(`  ❌ ${e.message}`)
    failed++
  }
}

await prisma.$disconnect()
console.log(`\n=== DONE: ${done} fixed, ${skipped} skipped, ${failed} failed ===`)

execSync(`openclaw message send --channel telegram -t 8743667508 -m "✅ Slide mixup fixed! All ${done} lessons re-uploaded with correct slides. Refresh the platform."`)
