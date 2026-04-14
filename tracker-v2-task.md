Redesign the Progress Tracker to be simpler and more visually appealing.

## 1. Update Database Schema

In prisma/schema.prisma, replace the ProgressEntry model with:
```prisma
model ProgressEntry {
  id                   String   @id @default(cuid())
  userId               String
  businessesOutreached Int      @default(0)
  conversationsStarted Int      @default(0)
  potentialClients     Int      @default(0)
  activeClients        Int      @default(0)
  paymentsReceived     Int      @default(0)
  paymentsValue        Float    @default(0)
  moodScore            Int      @default(5)
  notes                String?
  createdAt            DateTime @default(now())
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```
Run: npx prisma db push && npx prisma generate

## 2. Update API routes

Update /api/tracker GET and POST to use new fields.
Update /api/admin/tracker to return new fields.

## 3. Redesign TrackerView.tsx

The form should be split into 4 visually distinct sections with orange section headers:

```
🎯 OUTREACH
  [Businesses Outreached — number input]

💬 PIPELINE  
  [Conversations Started — number input]
  [Potential Clients — number input]
  [Active Clients — number input]

💰 REVENUE
  [Payments Received — number input]
  [Total Revenue — R amount input]

🧠 MINDSET
  [How are you feeling? — slider 1-10 with emoji display]
  [Notes — optional textarea, small]
```

Design details:
- Each section is a dark card with orange section title
- Inputs are clean, minimal, full-width inside each card
- Number inputs start at 0, show a clean number stepper or just a plain input
- Slider shows emoji: 1-3=😔 4-6=😐 7-8=😊 9-10=🔥 and the number
- Submit button: full-width orange "Save Progress Entry"
- Success state: green tick + "Entry saved!" then reset form

History section (below form):
- Total stats bar at top: "All time — X outreached | X active clients | R X,XXX revenue"
- Each entry card: date + 4 key numbers in a row + mood emoji
- Clean, minimal, dark cards
- Show last 10 entries, "Show more" button if more

## 4. Update admin tracker tab to use new fields

## After changes:
- npm run build (fix errors)
- git add -A && git commit -m "feat: simplified tracker v2 with cleaner UI"
- git push origin main
- vercel --prod
- openclaw system event --text "Done: tracker v2 deployed" --mode now
