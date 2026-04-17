Add group video/audio call feature to the JvR Brand Scaling platform using Jitsi Meet (free, no API key needed).

## How it works
- Admin schedules a call (title, date, time)
- All students see a countdown on their dashboard
- When the countdown hits zero → "Join Now" button appears
- Clicking joins the Jitsi call embedded in the platform (full screen iframe)
- Admin has host controls via Jitsi (mute all, etc.)
- All tiers can join

## 1. Database changes (prisma/schema.prisma)

Add GroupCall model:
```prisma
model GroupCall {
  id          String   @id @default(cuid())
  title       String
  scheduledAt DateTime
  roomName    String   @unique  // unique Jitsi room name
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
}
```

Run: npx prisma migrate dev --name add-group-calls

## 2. API routes

### GET /api/calls
- Returns the next upcoming call (scheduledAt > now, isActive=true)
- Returns null if no upcoming call

### POST /api/admin/calls (admin only)
- Body: { title, scheduledAt }
- Creates a new GroupCall with roomName = `brandscaling-${cuid().slice(0,8)}`
- Returns the created call

### DELETE /api/admin/calls/[id] (admin only)
- Deletes/cancels a call (sets isActive=false)

## 3. Countdown component: app/dashboard/CallCountdown.tsx

"use client" component that:
- Fetches /api/calls on mount
- If no upcoming call: returns null (shows nothing)
- If call found:
  - Shows a banner/card at the top of dashboard
  - Countdown timer: Days, Hours, Minutes, Seconds (updates every second)
  - Design: dark card, orange accent, "📹 Upcoming Group Call: {title}" heading
  - When countdown reaches 0: hides countdown, shows big orange "Join Now →" button
  - "Join Now" button opens the Jitsi call in a fullscreen modal/overlay

## 4. Jitsi call modal: app/dashboard/JitsiCall.tsx

"use client" component:
- Full screen overlay (fixed inset-0 z-50 bg-black)
- Embeds: <iframe src={`https://meet.jit.si/${roomName}#userInfo.displayName="${userName}"&config.prejoinPageEnabled=false`} allow="camera; microphone; fullscreen" className="w-full h-full" />
- Close button (X) in top right corner
- Admin user gets moderator=true passed in URL

## 5. Admin UI: add to admin section

In the admin dashboard (or existing admin area), add a "Group Calls" section:
- Form: Title input + Date/Time picker + "Schedule Call" button
- List of upcoming calls with cancel button

## 6. Add CallCountdown to dashboard layout

In app/dashboard/layout.tsx, import and add <CallCountdown /> above {children}

## After building:
- npx prisma migrate dev --name add-group-calls
- npm run build (fix all errors)
- git add -A && git commit -m "feat: group video calls with Jitsi + countdown timer"
- git push origin main
- vercel --prod
- openclaw message send --channel telegram -t 8743667508 -m "✅ Group calls feature is live! Schedule a call from the admin panel."
