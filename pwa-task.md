Add PWA support and update the landing page for JvR Brand Scaling.

## 1. PWA Support

### app/manifest.json
Create a web app manifest:
```json
{
  "name": "JvR Brand Scaling",
  "short_name": "JvR",
  "description": "Learn Brand Scaling — land clients, run ads, scale revenue.",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#FF6B00",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Icons
Create simple orange square PNG icons programmatically using sharp or canvas:
- public/icons/icon-192.png — 192x192px, orange (#FF6B00) background, white "JvR" text centered
- public/icons/icon-512.png — 512x512px, same design

Install sharp: npm install sharp
Write a script scripts/gen-icons.mjs that generates both icons using sharp and run it.

### app/layout.tsx updates
Add to <head>:
```tsx
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#FF6B00" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="JvR Brand Scaling" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

### Service Worker (basic)
Create public/sw.js — basic cache-first service worker for static assets:
```js
const CACHE = 'jvr-v1'
const STATIC = ['/', '/login', '/register']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)))
})

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  )
})
```

Register in app/layout.tsx via a client component:
```tsx
// app/SwRegister.tsx
'use client'
import { useEffect } from 'react'
export default function SwRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
    }
  }, [])
  return null
}
```

## 2. Landing page updates

Remove the stats bar ("500+ Students", "3 Tiers" etc.) completely.

Replace with a "Who This Is For" section:
- Section heading: "Is This For You?"
- 4 cards in a 2x2 grid:
  1. "Starting From Zero" — You have no experience but you're hungry to build a real income.
  2. "Want Real Income" — Done with low-paying jobs. You want to get paid for delivering results.
  3. "Work For Yourself" — You want freedom to work on your own terms and choose your clients.
  4. "Ready To Act" — You want a step-by-step system you can apply immediately.
- Each card: dark bg (#0a0a0a), orange icon (✓), white title, grey description, subtle orange border on hover

Keep everything else the same.

## After building
- npm run build (fix all errors)
- git add -A && git commit -m "feat: PWA support + landing page who-this-is-for section"
- git push origin main
- vercel --prod
- openclaw system event --text "Done: PWA and landing page update deployed" --mode now
