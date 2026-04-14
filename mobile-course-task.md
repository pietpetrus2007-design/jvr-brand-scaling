Fix the course view for mobile in app/dashboard/CourseView.tsx.

## Problem
On mobile, clicking a lesson sets selectedLesson state but the lesson content panel is rendered below the sidebar, so users have to scroll way down to see it. Feels broken.

## Fix: Mobile-first lesson view

Add a `mobileView` state: "list" | "lesson"

On mobile (< lg):
- Default: show the module/lesson list ("list" view)
- When user clicks a lesson: switch to "lesson" view (full screen lesson content)
- In lesson view: show a "← Back to Course" button at the top that returns to "list" view
- Auto-scroll to top when switching to lesson view

On desktop (lg+): keep the current side-by-side layout, no changes.

Implementation:
```tsx
const [mobileView, setMobileView] = useState<'list' | 'lesson'>('list')

function handleLessonClick(lesson: Lesson) {
  setSelectedLesson(lesson)
  setMobileView('lesson')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
```

Mobile lesson view should show:
- "← Back" button (orange text, top left)
- Lesson title
- Slides iframe (if slideUrl)
- Video (if videoUrl)
- Mark complete button
- Description

Wrap the sidebar in `<div className="lg:block ${mobileView === 'lesson' ? 'hidden' : 'block'}">` 
Wrap the lesson panel in `<div className="lg:block ${mobileView === 'list' ? 'hidden lg:flex' : 'block'}">` 

Keep all existing functionality intact.

After fixing:
- npm run build (fix errors)
- git add -A && git commit -m "fix: mobile course view with back navigation"
- git push origin main
- vercel --prod
- openclaw system event --text "Done: mobile course fix deployed" --mode now
