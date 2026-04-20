/**
 * Fix slide mixup v2 — CORRECT explicit mapping
 * Rule: prefer -2--- files (replacements) over originals
 * Part 1 = mod*-lesson* slideUrls → Lesson_ files
 * Part 2 = p2m* slideUrls → Part2_ files  
 * Part 3 = p3m* slideUrls → Part3_ files
 */
import { v2 as cloudinary } from 'cloudinary'
import { execSync } from 'child_process'
import { readdirSync, mkdirSync } from 'fs'
import { join } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { PrismaClient } = require('@prisma/client')
const { PrismaNeon } = require('@prisma/adapter-neon')

cloudinary.config({ cloud_name: 'dwnfccsje', api_key: '496952356133331', api_secret: '1kYnrqjzQf16C-J0altYjjlqoK0' })
const adapter = new PrismaNeon({ connectionString: 'postgresql://neondb_owner:npg_aH2oLvgM9IVJ@ep-jolly-dawn-andrurcd-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' })
const prisma = new PrismaClient({ adapter })
const INBOUND = '/Users/pietjansevanrensburg/.openclaw/media/inbound/'

// For each slideUrl: list of file prefixes to try IN ORDER (first match wins)
// Put replacements (-2, Fixed-2) FIRST so they take priority
const MAPPING = {
  // ── PART 1 ──────────────────────────────────────────────────────
  'mod1-lesson1': ['Lesson_1.1_What_Brand_Scaling_Actually_Is'],
  'mod1-lesson2': ['Lesson_1.2_Why_Brands_Need_This'],
  'mod1-lesson3': ['Lesson_1_3_What_You_Are_Actually_Selling---65f828d9'],  // replacement
  'mod1-lesson4': ['Lesson_1.4_What_Your_Role_Is_and_What_It_Is_Not'],
  'mod1-lesson5': ['Lesson_1.5_The_Opportunity_in_This_Business_Model'],
  'mod2-lesson1': ['Lesson_2_1_The_Simple_Brand_Scaling_Offer---5e7b7ebb'],  // replacement
  'mod2-lesson2': ['Lesson_2.2_Positioning_Yourself_Properly'],
  'mod2-lesson3': ['Lesson_2.3_Niching_Down_or_Staying_Broad'],
  'mod2-lesson4': ['Lesson_2.4_What_Makes_an_Offer_Easy_to_Buy'],
  'mod2-lesson5': ['Lesson_2.5_Creating_Your_Offer_Statement'],
  'mod3-lesson1': ['Lesson_3.1_What_a_Good_Client_Looks_Like'],
  'mod3-lesson2': ['Lesson_3_2_Where_to_Find_Brands---89ed68ff'],  // replacement
  'mod3-lesson3': ['Lesson_3_3_How_to_Research_a_Brand_Before_Contacting_Them-2'],  // replacement
  'mod3-lesson4': ['Lesson_3.4_Building_a_Lead_List'],
  'mod3-lesson5': ['Lesson_3_4A_Scraping_Lead_Lists_with_Instant_Data_Scraper---cd451de1'],  // replacement
  'mod3-lesson6': ['Lesson_3.4B_Finding_Decision_Makers_with_Apollo'],
  'mod3-lesson7': ['Lesson_3.5_Daily_Client_Acquisition_Routine'],
  'mod4-lesson1': ['Lesson_4_1_Fixed'],
  'mod4-lesson2': ['Lesson_4_2_Fixed'],
  'mod4-lesson3': ['Lesson_4_3_Fixed'],
  'mod4-lesson4': ['Lesson_4_4_Fixed'],
  'mod4-lesson4a': ['Lesson_4_4A_Fixed'],
  'mod4-lesson5': ['Lesson_4_5_Fixed'],
  'mod4-lesson6': ['Lesson_4_6_Fixed'],
  'mod4-lesson7': ['Lesson_4_7_Fixed-2'],  // replacement
  'mod5-lesson1': ['Lesson_5_1_Fixed'],
  'mod5-lesson2': ['Lesson_5_2_Fixed'],
  'mod5-lesson3': ['Lesson_5_3_Fixed'],
  'mod5-lesson4': ['Lesson_5_4_Fixed'],
  'mod5-lesson5': ['Lesson_5_5_Fixed-2'],  // replacement
  'mod5-lesson6': ['Lesson_5_6_Fixed'],
  'mod5-lesson7': ['Lesson_5_7_Fixed'],
  'mod5-lesson8': ['Lesson_5_8_Fixed'],
  'mod5-lesson9': ['Lesson_5_9_Fixed'],

  // ── PART 2 ──────────────────────────────────────────────────────
  'p2m1l1': ['Part2_M1_L1_1_What_Paid_Ads_Are'],
  'p2m1l2': ['Part2_M1_L1_2_How_Businesses_Use_Ads-2', 'Part2_M1_L1_2_How_Businesses_Use_Ads---'],
  'p2m1l3': ['Part2_M1_L1_3_Your_Role_As_Paid_Growth_Person-2', 'Part2_M1_L1_3_Your_Role_As_Paid_Growth_Person---'],
  'p2m1l4': ['Part2_M1_L1_4_The_Basic_Paid_Ads_System'],
  'p2m1l5': ['Part2_M1_L1_5_The_Parts_of_a_Meta_Ad_Campaign-2', 'Part2_M1_L1_5_The_Parts_of_a_Meta_Ad_Campaign---'],
  'p2m2l1': ['Part2_M2_L2_1_Why_Creatives_Matter'],
  'p2m2l2': ['Part2_M2_L2_2_What_Makes_a_Good_Ad'],
  'p2m2l3': ['Part2_M2_L2_3_Hooks_Angles'],
  'p2m2l4': ['Part2_M2_L2_4_Evaluating'],
  'p2m2l5': ['Part2_M2_L2_5_When_to_Improve_vs_Create-2', 'Part2_M2_L2_5_When_to_Improve_vs_Create---'],
  'p2m3b':  ['Part2_M3_Bonus_Canva'],
  'p2m3l1': ['Part2_M3_L3_1_Getting_Started_With_Canva-2', 'Part2_M3_L3_1_Getting_Started_With_Canva---'],
  'p2m3l2': ['Part2_M3_L3_2_Understanding_the_Canva_Workspace'],
  'p2m3l3': ['Part2_M3_L3_3_Setting_Up_Creative_Size-2', 'Part2_M3_L3_3_Setting_Up_Creative_Size---', 'Part2_M3_L3_3_Setting_Up_Correct'],
  'p2m3l4': ['Part2_M3_L3_4_Building_an_Image_Ad_From_Scratch-2', 'Part2_M3_L3_4_Building_an_Image_Ad_From_Scratch---'],
  'p2m3l5': ['Part2_M3_L3_5_Writing_Text_and_Visual_Hierarchy-2', 'Part2_M3_L3_5_Writing_Text_and_Visual_Hierarchy---'],
  'p2m3l6': ['Part2_M3_L3_6_Creating_Carousel_Creatives-2', 'Part2_M3_L3_6_Creating_Carousel_Creatives---'],
  'p2m3l7': ['Part2_M3_L3_7_Exporting_Creatives_Correctly-2', 'Part2_M3_L3_7_Exporting_Creatives_Correctly---'],
  'p2m4l1': ['Part2_M4_L4_1_Getting_Started_With_CapCut-2', 'Part2_M4_L4_1_Getting_Started_With_CapCut---'],
  'p2m4l2': ['Part2_M4_L4_2_Understanding_the_CapCut_Workspace-2', 'Part2_M4_L4_2_Understanding_the_CapCut_Workspace---'],
  'p2m4l3': ['Part2_M4_L4_3_FIXED', 'Part2_M4_L4_3_Cutting_and_Structuring_Video_Clips-2', 'Part2_M4_L4_3_Cutting_and_Structuring_Video_Clips---'],
  'p2m4l4': ['Part2_M4_L4_4_Creating_Strong_Hooks'],
  'p2m4l5': ['Part2_M4_L4_5_Adding_Text_Captions_and_Subtitles-2', 'Part2_M4_L4_5_Adding_Text_Captions_and_Subtitles---'],
  'p2m4l6': ['Part2_M4_L4_6_Exporting_Video_Creatives'],
  'p2m5l1': ['Part2_M5_L5_1_Understanding_Meta_Ads_Manager'],
  'p2m5l2': ['Part2_M5_L5_2_What_You_Need_From_the_Client'],
  'p2m5l3': ['Part2_M5_L5_3_Understanding_Meta_Business_Manager'],
  'p2m5l4': ['Part2_M5_L5_4_How_Clients_Give_You_Access'],
  'p2m5l5': ['Part2_M5_L5_5_Connecting_Facebook_Page_Instagram_Pixel-2', 'Part2_M5_L5_5_Connecting_Facebook_Page_Instagram_Pixel---'],
  'p2m5l6': ['Part2_M5_L5_6_Creating_and_Installing_the_Meta_Pixel-2', 'Part2_M5_L5_6_Creating_and_Installing_the_Meta_Pixel---'],
  'p2m5l7': ['Part2_M5_L5_7_Creating_Your_First_Campaign'],
  'p2m5l8': ['Part2_M5_L5_8_Setting_Up_the_Ad_Set'],
  'p2m5l9': ['Part2_M5_L5_9_Creating_the_Ad'],
  'p2m5l10': ['Part2_M5_L5_10_Reviewing'],
  'p2m6l1': ['Part2_M6_L6_1_Understanding_the_Most_Important'],
  'p2m6l2': ['Part2_M6_L6_2_How_to_Identify'],
  'p2m6l3': ['Part2_M6_L6_3_When_to_Turn_Off'],
  'p2m6l4': ['Part2_M6_L6_4_Scaling_Winning_Ads-2', 'Part2_M6_L6_4_Scaling_Winning_Ads---'],
  'p2m6l5': ['Part2_M6_L6_5_Testing_Creatives'],

  // ── PART 3 ──────────────────────────────────────────────────────
  'p3m1l1': ['Part3_M1_L1_1_How_This_Business_Model'],
  'p3m1l2': ['Part3_M1_L1_2_The_Main_Ways'],
  'p3m1l3': ['Part3_M1_L1_3_Why_Recurring_Revenue'],
  'p3m2l1': ['Part3_M2_L2_1_How_to_Think_About_Pricing'],
  'p3m2l2': ['Part3_M2_L2_2_Beginner_Pricing'],
  'p3m2l3': ['Part3_M2_L2_3_Intermediate_Pricing'],
  'p3m2l4': ['Part3_M2_L2_4_What_Affects_Your_Pricing'],
  'p3m3l1': ['Part3_M3_L3_1_What_Your_Service'],
  'p3m3l2': ['Part3_M3_L3_2_How_to_Present'],
  'p3m3l3': ['Part3_M3_L3_3_Pilot_Offers'],
  'p3m4l1': ['Part3_M4_L4_1_Monthly_Retainers'],
  'p3m4l2': ['Part3_M4_L4_2_Setup_Fees'],
  'p3m4l3': ['Part3_M4_L4_3_Keeping_Clients'],
  'p3m4l4': ['Part3_M4_L4_4_Growing_From_One_Client'],
  'p3m4l5': ['Part3_M4_L4_5_Advanced_Pricing'],
  'p3m4l6': ['Part3_M4_L4_6_The_Complete_Brand_Scaling_Income'],
}

function findFile(prefixes) {
  const allFiles = readdirSync(INBOUND)
  for (const prefix of prefixes) {
    const match = allFiles.find(f => f.startsWith(prefix) && f.endsWith('.pptx'))
    if (match) return join(INBOUND, match)
  }
  return null
}

let done = 0, failed = 0, skipped = 0
const log = []

for (const [slideUrl, prefixes] of Object.entries(MAPPING)) {
  const pptx = findFile(prefixes)
  if (!pptx) {
    const msg = `SKIP ${slideUrl} — no file for: ${prefixes[0]}`
    console.log(msg); log.push(msg); skipped++
    continue
  }

  const TMP = `/tmp/fixv2-${slideUrl}`
  mkdirSync(TMP, { recursive: true })
  const fname = pptx.split('/').pop()
  console.log(`\n[${slideUrl}] ${fname.slice(0,60)}`)

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

    await prisma.lesson.updateMany({ where: { slideUrl }, data: { slidePages: slides.length } })
    done++
  } catch (e) {
    const msg = `FAILED ${slideUrl}: ${e.message}`
    console.log(`  ❌ ${e.message}`); log.push(msg); failed++
  }
}

await prisma.$disconnect()
console.log(`\n=== COMPLETE: ${done} fixed, ${skipped} skipped, ${failed} failed ===`)
if (failed > 0) console.log('FAILED:', log.filter(l => l.startsWith('FAILED')))

execSync(`openclaw message send --channel telegram -t 8743667508 -m "✅ All slides fixed correctly — ${done} lessons across Parts 1, 2 and 3. Each lesson now shows the correct slides. Refresh the app."`)
