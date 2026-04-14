Add a Progress Tracker feature to the JvR Brand Scaling platform.

## Database Schema

Add to prisma/schema.prisma:
```prisma
model ProgressEntry {
  id               String   @id @default(cuid())
  userId           String
  dmsSent          Int      @default(0)
  whatsappsSent    Int      @default(0)
  emailsSent       Int      @default(0)
  coldCalls        Int      @default(0)
  replies          Int      @default(0)
  pendingClients   Int      @default(0)
  clientsAcquired  Int      @default(0)
  paymentsReceived Int      @default(0)
  paymentsValue    Float    @default(0)
  moodScore        Int      @default(5)  // 1-10
  notes            String?
  createdAt        DateTime @default(now())
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```
Add `progressEntries ProgressEntry[]` to User model.
Run: npx prisma db push && npx prisma generate

## API Routes

### GET /api/tracker
- Returns current user's progress entries (newest first)
- export const dynamic = 'force-dynamic'

### POST /api/tracker
- Creates a new progress entry for current user
- Body: { dmsSent, whatsappsSent, emailsSent, coldCalls, replies, pendingClients, clientsAcquired, paymentsReceived, paymentsValue, moodScore, notes }

### GET /api/admin/tracker
- Admin only — returns all students' entries with user name/email
- Grouped or flat list, newest first

## Dashboard Page: /dashboard/tracker

### New nav item
Add "📊 Tracker" to the dashboard sidebar nav (between Community and Profile).

### Lock screen
Check if user has completed ALL lessons (Progress count >= total lesson count).
If not: show a lock screen:
- Lock icon
- "Progress Tracker — Locked"
- "Complete the full course to unlock your personal progress tracker."
- Show their current completion percentage with orange progress bar
- "Keep going! You're X% through the course."

### Unlocked view
Two sections:

**1. Log New Entry (form at top)**
Card with title "Log Your Progress"
Fields (all numeric inputs, starting at 0):
- Social Media DMs Sent
- WhatsApp Messages Sent  
- Emails Sent
- Cold Calls Made
- Replies Received
- Pending Clients (in conversation)
- Clients Acquired
- Payments Received (count)
- Payment Value (R amount, text input)
- How are you feeling? (slider 1-10, shows emoji based on score: 1-3=😔, 4-6=😐, 7-8=😊, 9-10=🔥)
- Notes (optional textarea)
- Submit button: "Save Entry" (orange)

**2. Your History**
List of past entries, newest first.
Each entry card shows:
- Date (formatted nicely: "Today", "Yesterday", "14 Apr")
- Key stats in a grid: DMs | WhatsApps | Emails | Calls | Replies | Clients | Revenue
- Mood emoji + score
- Notes (if any)
- Totals summary at top: "Total: X DMs | X clients | RX,XXX revenue"

## Admin tracker view
In /admin page, add a "Progress Tracker" tab/section:
- Table: Student name | Date | DMs | WA | Email | Calls | Replies | Pending | Clients | Payments | Value | Mood
- Filter by student name
- Show totals row at bottom
- Export as CSV button (just creates a download link with the data)

## After building
- npm run build (fix errors)
- git add -A && git commit -m "feat: progress tracker with course completion lock"
- git push origin main
- vercel --prod
- openclaw system event --text "Done: progress tracker deployed" --mode now
