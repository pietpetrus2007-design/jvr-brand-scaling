Extend the group calls feature with instant/unscheduled calls and student targeting.

## Changes needed

### 1. Update GroupCall schema (prisma/schema.prisma)
Add fields to GroupCall:
- `startedAt DateTime?` — when admin clicked "Start Now" (null = scheduled but not started yet)
- `inviteAll Boolean @default(true)` — if false, only invited users can see it
- Add relation: `invitedUsers GroupCallInvite[]`

Add new model:
```prisma
model GroupCallInvite {
  id          String    @id @default(cuid())
  callId      String
  userId      String
  call        GroupCall @relation(fields: [callId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([callId, userId])
}
```

Add reverse relation on User: `groupCallInvites GroupCallInvite[]`

Run: npx prisma migrate dev --name add-call-invites

### 2. Update /api/admin/calls POST
Accept optional fields:
- `startNow: boolean` — if true, set scheduledAt = now, startedAt = now
- `inviteAll: boolean` — default true
- `invitedUserIds: string[]` — if inviteAll=false, create GroupCallInvite records

### 3. Add PATCH /api/admin/calls/[id]
- Body: `{ action: "start" }` — sets startedAt = now on existing scheduled call

### 4. Update GET /api/calls
- Check if user is invited: if inviteAll=true, show to everyone; if false, only show if user has a GroupCallInvite
- Return call if: isActive=true AND (startedAt != null OR scheduledAt > now) AND user is invited

### 5. Update admin Group Calls UI
In the admin calls section, add:

**Instant Call section:**
- "Start Instant Call" button
- Title input (optional, default "Live Group Call")
- Student selector:
  - Toggle: "All Students" (default) or "Select Students"
  - If "Select Students": searchable list of all users with checkboxes (show name + email + tier badge)
- "Start Call Now" button → creates call with startNow=true, opens Jitsi in admin's browser

**For scheduled calls:**
- Add a "Start Now" button next to each scheduled call → PATCH to set startedAt

### 6. Update CallCountdown component
- If call.startedAt is set (live now): show pulsing red "🔴 LIVE — Join Now" banner instead of countdown
- Poll /api/calls every 15 seconds to detect when a call goes live
- Instant call = no countdown, just the live banner immediately

### 7. Admin sees their own call
When admin starts a call (instant or scheduled), automatically open JitsiCall modal for the admin too.

## After building:
- npx prisma migrate dev --name add-call-invites  
- npm run build (fix errors)
- git add -A && git commit -m "feat: instant calls + student targeting"
- git push origin main
- vercel --prod
- openclaw message send --channel telegram -t 8743667508 -m "✅ Instant calls + student targeting is live!"
