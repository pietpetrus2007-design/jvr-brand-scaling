Fix the PDF slide viewer in the lesson view. The current iframe approach shows a black box because browsers block cross-origin PDF iframes.

## Solution: Use Google Docs PDF viewer

Replace the iframe src with Google's free PDF viewer which can display any public PDF URL:
```
https://docs.google.com/viewer?url=ENCODED_PDF_URL&embedded=true
```

So the iframe src becomes:
```
`https://docs.google.com/viewer?url=${encodeURIComponent(lesson.slideUrl)}&embedded=true`
```

This works reliably in all browsers with no auth needed.

## Update in app/dashboard/CourseView.tsx (or wherever the lesson viewer is)

Find the slide iframe and update the src to use Google Docs viewer:
```tsx
{lesson.slideUrl && (
  <div className="mb-6">
    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
      <span>📄</span> Lesson Slides
    </h3>
    <div className="rounded-lg overflow-hidden border border-[#FF6B00]/30" style={{ height: '500px' }}>
      <iframe
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(lesson.slideUrl)}&embedded=true`}
        width="100%"
        height="100%"
        frameBorder="0"
        title="Lesson Slides"
      />
    </div>
    <a
      href={lesson.slideUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 mt-3 text-sm text-[#FF6B00] hover:underline"
    >
      ↓ Download Slides
    </a>
  </div>
)}
```

## After fixing
- npm run build (fix all errors)
- git add -A && git commit -m "fix: use Google Docs viewer for PDF slides"
- git push origin main
- vercel --prod
- openclaw system event --text "Done: slide viewer fix deployed" --mode now
