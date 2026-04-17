import { v2 as cloudinary } from 'cloudinary'
import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'

cloudinary.config({
  cloud_name: 'dwnfccsje',
  api_key: '496952356133331',
  api_secret: '1kYnrqjzQf16C-J0altYjjlqoK0'
})

const PPTX = '/Users/pietjansevanrensburg/.openclaw/media/inbound/Lesson_1_3_What_You_Are_Actually_Selling---65f828d9-2b94-4ff7-a3bd-2bb54542eb86.pptx'
const LESSON_ID = 'p1m1l3'
const OUT_DIR = '/tmp/slides-p1l3'

mkdirSync(OUT_DIR, { recursive: true })

// Convert to images
console.log('Converting slides...')
execSync(`cd "${OUT_DIR}" && libreoffice --headless --convert-to png --outdir . "${PPTX}" 2>/dev/null || soffice --headless --convert-to png --outdir . "${PPTX}" 2>/dev/null`, { stdio: 'inherit' })

// Check output
const files = execSync(`ls "${OUT_DIR}"/*.png 2>/dev/null || echo ""`).toString().trim().split('\n').filter(Boolean)
console.log(`Got ${files.length} PNG files`)

if (files.length === 0) {
  // Try pdftoppm approach
  console.log('Trying PDF approach...')
  execSync(`cd "${OUT_DIR}" && libreoffice --headless --convert-to pdf "${PPTX}" 2>/dev/null`)
  const pdf = execSync(`ls "${OUT_DIR}"/*.pdf`).toString().trim()
  execSync(`pdftoppm -r 150 -png "${pdf}" "${OUT_DIR}/slide"`)
}

const pngs = execSync(`ls "${OUT_DIR}"/*.png 2>/dev/null || ls "${OUT_DIR}"/*.jpg 2>/dev/null`).toString().trim().split('\n').filter(Boolean).sort()
console.log(`Uploading ${pngs.length} slides as ${LESSON_ID}...`)

for (let i = 0; i < pngs.length; i++) {
  const slideNum = i + 1
  const publicId = `jvr-brand-scaling/hires/${LESSON_ID}/slide-${slideNum}`
  const result = await cloudinary.uploader.upload(pngs[i], {
    public_id: publicId,
    overwrite: true,
    invalidate: true,
    resource_type: 'image',
  })
  console.log(`  slide-${slideNum} → ${result.secure_url}`)
}

console.log(`\nDone! ${LESSON_ID} now has ${pngs.length} slides`)
