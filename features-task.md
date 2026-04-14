Add two features to the JvR Brand Scaling platform:

## 1. Photo uploads in chat

Students can upload images in chat rooms (any room they have access to).

### Implementation
- Install: npm install cloudinary multer @types/multer
- Cloudinary credentials:
  - Cloud name: dwnfccsje
  - API Key: 496952356133331
  - API Secret: 1kYnrqjzQf16C-J0altYjjlqoK0
- Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to .env and Vercel env vars

### API: POST /api/upload
- Accepts multipart form data with an image file
- Uploads to Cloudinary
- Returns { url: "https://res.cloudinary.com/..." }
- Max file size: 5MB
- Accepted types: image/jpeg, image/png, image/gif, image/webp

### Database: Update Message model
Add `imageUrl String?` field to Message model
Run: npx prisma db push

### Chat UI changes
- Add image upload button (📷) next to the message input
- On click: open file picker (images only)
- Show preview before sending
- On send: upload to Cloudinary first, then send message with imageUrl
- In message feed: if message has imageUrl, display the image inline (max height 300px, object-fit cover, rounded corners)
- Images are clickable to open full size in a new tab

## 2. Announcements section

Admin can post announcements. All students see them.

### Database: New Announcement model
```
model Announcement {
  id        String   @id @default(cuid())
  title     String
  content   String
  imageUrl  String?
  userId    String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```
Add relation to User model too.
Run: npx prisma db push

### API routes
- GET /api/announcements — returns all announcements, newest first
- POST /api/announcements — admin only, creates announcement { title, content, imageUrl? }
- DELETE /api/announcements/[id] — admin only

### Dashboard page: /dashboard/announcements
- New sidebar nav item: 📢 Announcements (between Community and Profile)
- Lists all announcements, newest first
- Each card: title, content, image (if any), date, posted by admin name
- Clean card layout, black bg, orange accents
- If no announcements: "No announcements yet. Check back soon."

### Admin panel additions
- Add "Announcements" section to /admin page
- Form to create new announcement: title (required), content (required), optional image upload (same Cloudinary setup)
- List of existing announcements with delete button

## After building
- Add env vars to Vercel:
  vercel env add CLOUDINARY_CLOUD_NAME production <<< "dwnfccsje"
  vercel env add CLOUDINARY_API_KEY production <<< "496952356133331"
  vercel env add CLOUDINARY_API_SECRET production <<< "1kYnrqjzQf16C-J0altYjjlqoK0"
- npm run build (fix all errors)
- git add -A && git commit -m "feat: photo uploads in chat + announcements section"
- git push origin main
- vercel --prod
- openclaw system event --text "Done: photo uploads and announcements deployed" --mode now
