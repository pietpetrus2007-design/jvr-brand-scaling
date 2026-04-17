import { v2 as cloudinary } from 'cloudinary'
import { execSync } from 'child_process'
import { readdirSync, mkdirSync } from 'fs'
import { join } from 'path'

cloudinary.config({
  cloud_name: 'dwnfccsje',
  api_key: '496952356133331',
  api_secret: '1kYnrqjzQf16C-J0altYjjlqoK0',
})

const PPTX = '/Users/pietjansevanrensburg/.openclaw/media/inbound/Lesson_1_3_What_You_Are_Actually_Selling---65f828d9-2b94-4ff7-a3bd-2bb54542eb86.pptx'
const LESSON_ID = 'p1m1l3'
const TMP = `/tmp/replace-${LESSON_ID}`
mkdirSync(TMP, { recursive: true })

console.log('Converting PPTX → PDF...')
execSync(`python3 -c "
import subprocess
subprocess.run(['soffice', '--headless', '--convert-to', 'pdf', '--outdir', '${TMP}', '${PPTX}'])
"`)

const pdfs = readdirSync(TMP).filter(f => f.endsWith('.pdf'))
if (pdfs.length === 0) throw new Error('PDF conversion failed')
const pdf = join(TMP, pdfs[0])
console.log(`PDF: ${pdf}`)

console.log('Converting PDF → images...')
execSync(`gs -dBATCH -dNOPAUSE -sDEVICE=png16m -r200 -sOutputFile="${TMP}/slide-%03d.png" "${pdf}"`)

const slides = readdirSync(TMP)
  .filter(f => f.endsWith('.png'))
  .sort()
  .map(f => join(TMP, f))

console.log(`Got ${slides.length} slides, uploading...`)

for (let i = 0; i < slides.length; i++) {
  const num = i + 1
  const publicId = `jvr-brand-scaling/hires/${LESSON_ID}/slide-${num}`
  const result = await cloudinary.uploader.upload(slides[i], {
    public_id: publicId,
    overwrite: true,
    invalidate: true,
    resource_type: 'image',
    quality: 'auto:best',
  })
  console.log(`  ✅ slide-${num} uploaded`)
}

console.log(`\n✅ Done! ${LESSON_ID}: ${slides.length} slides replaced`)
console.log('Update DB slide count if needed.')
