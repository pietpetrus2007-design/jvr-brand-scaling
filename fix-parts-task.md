Fix the course structure to support Part 1 and Part 2 as separate sections.

## 1. Update Database Schema

Add `part Int @default(1)` field to the Module model in prisma/schema.prisma.
Run: npx prisma db push && npx prisma generate

## 2. Update DB data

Write prisma/fix-parts.ts:
- Set part=1 for modules with order 1-5 (Part 1: Get Clients)
- Set part=2 for modules with order 6-11 (Part 2: Paid Ads)
- Also reset the order of Part 2 modules so they go 1-6 instead of 6-11:
  - order=6 → order=1, part=2
  - order=7 → order=2, part=2
  - order=8 → order=3, part=2
  - order=9 → order=4, part=2
  - order=10 → order=5, part=2
  - order=11 → order=6, part=2

## 3. Update API

In the dashboard course page API (wherever modules are fetched), filter by part when fetching.
The API should accept a `?part=1` or `?part=2` query param and return only those modules.

## 4. Update CourseView.tsx

Add a Part switcher at the top of the course view:
- Two tabs: "Part 1: Get Clients" and "Part 2: Paid Ads"
- Orange underline on active tab
- Switching tabs loads that part's modules
- Remember selected part in state (default: Part 1)
- Each part shows its own modules numbered from 1
- On mobile: show as horizontal scrollable tabs

## 5. Update Dashboard page

The dashboard page.tsx fetches modules — update it to pass the current part to CourseView, or let CourseView fetch its own modules client-side based on selected part.

Recommended: Make CourseView fetch modules itself client-side based on selected part.
- Add useEffect that fetches /api/modules?part=1 or /api/modules?part=2
- Show loading state while fetching
- Update when part tab changes

The /api/modules route (or wherever modules come from) needs to:
- Accept ?part=X query param
- Return modules + lessons + resources for that part only
- Order by module.order ASC, lesson.order ASC

## After changes:
- npm run build (fix errors)
- git add -A && git commit -m "feat: Part 1 / Part 2 switcher in course view"
- git push origin main
- vercel --prod
- openclaw system event --text "Done: Part switcher deployed" --mode now
