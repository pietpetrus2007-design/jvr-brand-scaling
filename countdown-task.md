Add a 21-day countdown banner to the course page for non-admin users.

## What it does
- Shows a full-width banner at the top of the course page
- Displays a live countdown: Days, Hours, Minutes, Seconds
- Target date: 21 days from NOW (calculate from today's date at build time, or make it configurable via an env var)
- Hidden for admin users (role === 'admin')
- Disappears automatically when countdown hits zero

## Implementation

### 1. Create a LAUNCH_DATE env variable
In .env and Vercel env:
LAUNCH_DATE=2026-05-11T00:00:00+02:00

(21 days from today = May 11 2026)

Add to Vercel: vercel env add LAUNCH_DATE production

### 2. Create app/dashboard/LaunchCountdown.tsx

"use client" component:
- Reads NEXT_PUBLIC_LAUNCH_DATE from env
- Calculates time remaining every second
- If countdown <= 0: returns null (banner disappears)
- Shows: "🚀 Full course unlocks in X days X hours X minutes X seconds"
- Design: black bg with orange accent, full width, dismissible

```tsx
"use client"
import { useState, useEffect } from "react"

export default function LaunchCountdown({ isAdmin }: { isAdmin: boolean }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, done: false })
  
  useEffect(() => {
    const target = new Date(process.env.NEXT_PUBLIC_LAUNCH_DATE || '2026-05-11T00:00:00+02:00')
    
    const tick = () => {
      const now = new Date()
      const diff = target.getTime() - now.getTime()
      if (diff <= 0) { setTimeLeft(t => ({ ...t, done: true })); return }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        done: false
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  
  if (isAdmin || timeLeft.done) return null
  
  return (
    <div style={{ background: 'linear-gradient(90deg, #111 0%, #1a0a00 100%)', borderBottom: '1px solid rgba(255,107,0,0.3)' }}
      className="w-full px-4 py-3 text-center">
      <p className="text-white text-sm font-semibold">
        🚀 Full course content unlocks in{" "}
        <span className="text-[#FF6B00] font-black">{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
        {" "}— you're in early! 🔥
      </p>
    </div>
  )
}
```

### 3. Add to dashboard layout
In app/dashboard/layout.tsx, import LaunchCountdown and add it below DashboardNav:

```tsx
import LaunchCountdown from "./LaunchCountdown"
// In the return:
<DashboardNav user={user} />
<LaunchCountdown isAdmin={user.role === 'admin'} />
<CallCountdown ... />
```

### 4. Add NEXT_PUBLIC_LAUNCH_DATE to next.config
Make sure it's exposed to the client:
In next.config.ts or .js add:
env: { NEXT_PUBLIC_LAUNCH_DATE: process.env.LAUNCH_DATE }

### After building:
- Add LAUNCH_DATE to .env: LAUNCH_DATE=2026-05-11T00:00:00+02:00
- Add to Vercel: vercel env add LAUNCH_DATE production (value: 2026-05-11T00:00:00+02:00)
- npm run build
- git add -A && git commit -m "feat: 21-day launch countdown banner for students"
- git push origin main
- vercel --prod
- openclaw message send --channel telegram -t 8743667508 -m "✅ Countdown banner live — students see 21-day timer, admins see nothing"
