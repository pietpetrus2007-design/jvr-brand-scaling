Replace the PDF iframe slide viewer with a proper image slideshow in the JvR Brand Scaling platform.

## Background
Slides have been uploaded to Cloudinary as image resources. Each slide PDF is stored as a multi-page image accessible via:
`https://res.cloudinary.com/dwnfccsje/image/upload/pg_{N}/jvr-brand-scaling/slides-img/{publicId}.jpg`

Where N is the page number (1-based) and publicId is like "mod1-lesson1".

## 1. Update Lesson model

In prisma/schema.prisma, change the existing fields:
- Keep `slideUrl` — rename its meaning to store the Cloudinary public ID (e.g. "mod1-lesson1")
- Add `slidePages Int @default(0)` — number of pages

Run: npx prisma db push && npx prisma generate

## 2. Update DB with new values

Write prisma/update-slides-to-img.ts:
- For each lesson in mod 1 and mod 2, update:
  - slideUrl = the Cloudinary public ID (e.g. "mod1-lesson1")  
  - slidePages = 7 (all lessons have 7 pages)

Module 1 lessons (order 1-5): mod1-lesson1 through mod1-lesson5
Module 2 lessons (order 1-5): mod2-lesson1 through mod2-lesson5

Run the script.

## 3. Add Resources model

Add to prisma/schema.prisma:
```prisma
model Resource {
  id        String   @id @default(cuid())
  lessonId  String
  label     String
  url       String
  order     Int      @default(0)
  createdAt DateTime @default(now())
  lesson    Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
}
```
Add `resources Resource[]` to Lesson model.
Run: npx prisma db push && npx prisma generate

## 4. Seed resources for Lesson 2.3

Write prisma/seed-resources.ts:
- Find lesson with title containing "2.3" or "Niching"
- Create 3 resources:
  - { label: "Meta Ad Library", url: "https://www.facebook.com/ads/library", order: 1 }
  - { label: "Google Maps (find local businesses)", url: "https://maps.google.com", order: 2 }
  - { label: "Google Search", url: "https://www.google.com", order: 3 }

## 5. Build SlideViewer component

Create app/dashboard/SlideViewer.tsx:
```tsx
"use client"
import { useState } from "react"

interface Props {
  publicId: string  // e.g. "mod1-lesson1"
  pages: number
}

const CLOUD = "https://res.cloudinary.com/dwnfccsje/image/upload"

export default function SlideViewer({ publicId, pages }: Props) {
  const [current, setCurrent] = useState(1)
  
  if (!publicId || pages === 0) return null

  const src = `${CLOUD}/pg_${current},f_jpg,q_85,w_1200/${publicId}.jpg`  // note: path without folder prefix since public_id includes it
  
  // Actually the full public_id stored is "mod1-lesson1" but the folder is "jvr-brand-scaling/slides-img"
  // So the full path is: jvr-brand-scaling/slides-img/mod1-lesson1
  const fullSrc = `${CLOUD}/pg_${current},f_jpg,q_85,w_1200/jvr-brand-scaling/slides-img/${publicId}.jpg`

  return (
    <div className="space-y-3">
      <div className="relative bg-white rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <img
          src={fullSrc}
          alt={`Slide ${current}`}
          className="w-full h-full object-contain"
          key={fullSrc}
        />
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrent(p => Math.max(1, p - 1))}
            disabled={current === 1}
            className="px-4 py-2 bg-[#111] border border-[#333] text-white rounded-lg text-sm disabled:opacity-30 hover:bg-[#222] transition-colors"
          >
            ← Previous
          </button>
          <span className="text-[#888] text-sm">
            Slide <span className="text-white font-semibold">{current}</span> of <span className="text-white font-semibold">{pages}</span>
          </span>
          <button
            onClick={() => setCurrent(p => Math.min(pages, p + 1))}
            disabled={current === pages}
            className="px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-sm disabled:opacity-30 hover:bg-[#e05e00] transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
```

## 6. Update CourseView.tsx

- Import SlideViewer
- Replace the entire PDF iframe section with:
```tsx
{selectedLesson.slideUrl && selectedLesson.slidePages > 0 && (
  <div className="space-y-2">
    <p className="text-white font-semibold text-sm">📄 Lesson Slides</p>
    <SlideViewer publicId={selectedLesson.slideUrl} pages={selectedLesson.slidePages} />
  </div>
)}
```
- Add Resources section after slides/video:
```tsx
{selectedLesson.resources && selectedLesson.resources.length > 0 && (
  <div className="space-y-3">
    <p className="text-white font-semibold text-sm">🔗 Resources</p>
    <div className="flex flex-wrap gap-2">
      {selectedLesson.resources.map((r: any) => (
        <a
          key={r.id}
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#111] border border-[#FF6B00]/30 text-[#FF6B00] rounded-lg text-sm hover:bg-[#FF6B00]/10 transition-colors"
        >
          {r.label} →
        </a>
      ))}
    </div>
  </div>
)}
```

## 7. Update API to include slidePages and resources

Make sure the API that fetches lessons/modules returns:
- slidePages field
- resources array (include { id, label, url, order })

## 8. Update admin panel

In the lesson form, add:
- "Cloudinary Slide ID" input (for slideUrl, e.g. "mod1-lesson1")  
- "Number of slides" input (for slidePages)
- Resources section: list existing resources with delete, add new resource form (label + url)

Add API routes:
- POST /api/resources — create resource { lessonId, label, url }
- DELETE /api/resources/[id] — delete resource

## 9. Build and deploy

- npm run build (fix ALL errors before deploying)
- git add -A && git commit -m "feat: image slideshow viewer with resources section"
- git push origin main
- vercel --prod
- openclaw system event --text "Done: image slideshow deployed" --mode now
