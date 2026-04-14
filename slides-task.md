Update the course lesson view to support PDF slides embedded from Cloudinary.

The Lesson model now has a `slideUrl` field (String, default "").

## Update the lesson/course view

In the student dashboard course view, when a lesson is selected:

1. If `lesson.slideUrl` is not empty: show an embedded PDF viewer above the video
   - Use an <iframe> with the slideUrl + "#toolbar=0&navpanes=0" appended
   - Title above it: "📄 Lesson Slides"
   - Height: 500px on desktop, 300px on mobile
   - Width: 100%
   - Rounded corners, orange border
   - Below it: a "Download Slides" link (opens slideUrl in new tab)

2. If `lesson.videoUrl` is not empty: show video embed below slides (existing behavior)

3. If both are empty: show a placeholder "Content coming soon" message

## Update the API

Make sure GET /api/lessons (or wherever lesson data is fetched) returns the `slideUrl` field.

## Update admin panel

In the lesson edit form in /admin, add a "Slide URL" input field so admin can paste the Cloudinary PDF URL when adding/editing lessons.

## After changes
- npm run build (fix all errors)
- git add -A && git commit -m "feat: PDF slide viewer in lessons"
- git push origin main
- vercel --prod
- openclaw system event --text "Done: slide viewer deployed" --mode now
