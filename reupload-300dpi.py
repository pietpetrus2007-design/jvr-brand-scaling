#!/usr/bin/env python3
"""
Re-upload ALL slides at 300 DPI for maximum quality.
Maps filenames to Cloudinary slide URLs via the DB.
"""
import os, subprocess, json, glob
from pathlib import Path

INBOUND = '/Users/pietjansevanrensburg/.openclaw/media/inbound/'
PROJECT = '/Users/pietjansevanrensburg/Projects/jvr-brand-scaling-v2'

log = open('/tmp/reupload-300dpi-log.txt', 'w', buffering=1)
def L(msg): print(msg); log.write(msg+'\n')

# Get all lessons from DB
result = subprocess.run(['node', '-e', '''
const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
require('dotenv').config();
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
prisma.lesson.findMany({ select: { id: true, title: true, slideUrl: true, slidePages: true } })
  .then(ls => { console.log(JSON.stringify(ls)); prisma.$disconnect(); });
'''], capture_output=True, text=True, cwd=PROJECT)

lessons = json.loads(result.stdout)
L(f"Found {len(lessons)} lessons in DB")

# Build a map: lesson title number → slideUrl
# e.g. "1.1" → "mod1-lesson1"
lesson_map = {}
for l in lessons:
    if l['slideUrl'] and l['slidePages'] and l['slidePages'] > 0:
        # Extract number from title like "1.1 What Brand Scaling..."
        parts = l['title'].split(' ')
        if parts and '.' in parts[0]:
            lesson_map[parts[0]] = l['slideUrl']

# Get all PPTX files - use originals (no "-2---" replacements, use latest)
# For each lesson number, use the newest file
pptx_files = sorted(glob.glob(INBOUND + 'Lesson_*.pptx'))

# Build filename → lesson number map
def get_lesson_num(fname):
    base = os.path.basename(fname)
    import re
    m = re.match(r'Lesson_(\d+)[_\.](\d+)(?:[_A-Z]*)', base)
    if m:
        return f"{m.group(1)}.{m.group(2)}"
    return None

# Group by lesson number, pick latest file for each
lesson_files = {}
for f in pptx_files:
    num = get_lesson_num(f)
    if num:
        # Prefer files with "-2---" (replacements) over originals
        if num not in lesson_files or '-2---' in f or 'Fixed' in f:
            lesson_files[num] = f

L(f"Found {len(lesson_files)} unique lessons with PPTX files")

# Process each
processed = 0
failed = 0
for num, pptx in sorted(lesson_files.items()):
    slide_url = lesson_map.get(num)
    if not slide_url:
        L(f"  SKIP {num} - no DB entry")
        continue
    
    TMP = f'/tmp/hq300-{slide_url}'
    os.makedirs(TMP, exist_ok=True)
    
    L(f"\nProcessing {num} → {slide_url}")
    L(f"  File: {os.path.basename(pptx)}")
    
    # Convert to PDF
    try:
        subprocess.run(['soffice', '--headless', '--convert-to', 'pdf', '--outdir', TMP, pptx],
                      capture_output=True, timeout=60)
    except:
        L(f"  ! PDF conversion failed")
        failed += 1
        continue
    
    pdfs = [f for f in os.listdir(TMP) if f.endswith('.pdf')]
    if not pdfs:
        L(f"  ! No PDF generated")
        failed += 1
        continue
    
    pdf = os.path.join(TMP, pdfs[0])
    
    # Convert PDF → PNG at 300 DPI
    try:
        subprocess.run(['gs', '-dBATCH', '-dNOPAUSE', '-sDEVICE=png16m', '-r300',
                       f'-sOutputFile={TMP}/slide-%03d.png', pdf],
                      capture_output=True, timeout=120)
    except:
        L(f"  ! GS conversion failed")
        failed += 1
        continue
    
    slides = sorted([f for f in os.listdir(TMP) if f.endswith('.png')])
    if not slides:
        L(f"  ! No PNGs generated")
        failed += 1
        continue
    
    L(f"  {len(slides)} slides — uploading at 300 DPI...")
    
    # Upload via node script
    upload_script = f"""
const {{ v2: cloudinary }} = require('cloudinary');
cloudinary.config({{ cloud_name: 'dwnfccsje', api_key: '496952356133331', api_secret: '1kYnrqjzQf16C-J0altYjjlqoK0' }});
const fs = require('fs'), path = require('path');
const slides = {json.dumps([os.path.join(TMP, s) for s in slides])};
const slideUrl = '{slide_url}';
(async () => {{
  for (let i = 0; i < slides.length; i++) {{
    await cloudinary.uploader.upload(slides[i], {{
      public_id: 'jvr-brand-scaling/hires/' + slideUrl + '/slide-' + (i+1),
      overwrite: true, invalidate: true, resource_type: 'image',
      quality: 'auto:best'
    }});
    process.stdout.write('    slide-' + (i+1) + ' ✅\\n');
  }}
  // Update DB slide count
  const {{ PrismaClient }} = require('@prisma/client');
  const {{ PrismaNeon }} = require('@prisma/adapter-neon');
  require('dotenv').config();
  const adapter = new PrismaNeon({{ connectionString: process.env.DATABASE_URL }});
  const prisma = new PrismaClient({{ adapter }});
  await prisma.lesson.updateMany({{ where: {{ slideUrl }}, data: {{ slidePages: slides.length }} }});
  await prisma.$disconnect();
  console.log('  Done: ' + slideUrl + ': ' + slides.length + ' slides');
}})();
"""
    
    r = subprocess.run(['node', '-e', upload_script], capture_output=True, text=True, cwd=PROJECT, timeout=300)
    if r.returncode == 0:
        L(r.stdout)
        processed += 1
    else:
        L(f"  ! Upload failed: {r.stderr[-200:]}")
        failed += 1

L(f"\n=== DONE ===")
L(f"Processed: {processed}, Failed: {failed}")
log.close()

# Notify Piet
subprocess.run(['openclaw', 'message', 'send', '--channel', 'telegram', '-t', '8743667508',
               '-m', f'✅ All slides re-uploaded at 300 DPI! {processed} lessons done.'])
