Build automatic tier downgrade system based on registration date.

## Rules
- Basic: lifetime, never downgrades
- Community: after 3 months from createdAt → downgrade to basic
- Mentorship: after 1 month → downgrade to community; after 3 months → downgrade to basic

## 1. Create API route: /api/cron/downgrade-tiers

This route will be called by a cron job (or Vercel cron).

POST /api/cron/downgrade-tiers
- Protected by a secret header: x-cron-secret = process.env.CRON_SECRET

Logic:
```
const now = new Date()

// Mentorship → Community (after 1 month)
const mentorshipCutoff = new Date(now)
mentorshipCutoff.setMonth(mentorshipCutoff.getMonth() - 1)

await prisma.user.updateMany({
  where: {
    tier: 'mentorship',
    createdAt: { lt: mentorshipCutoff }
  },
  data: { tier: 'community' }
})

// Community → Basic (after 3 months)
const communityCutoff = new Date(now)
communityCutoff.setMonth(communityCutoff.getMonth() - 3)

await prisma.user.updateMany({
  where: {
    tier: 'community',
    createdAt: { lt: communityCutoff }
  },
  data: { tier: 'basic' }
})
```

Return: { mentorshipDowngraded: N, communityDowngraded: N }

## 2. Add Vercel Cron

Create vercel.json with:
```json
{
  "crons": [
    {
      "path": "/api/cron/downgrade-tiers",
      "schedule": "0 2 * * *"
    }
  ]
}
```
This runs daily at 2am UTC.

## 3. Add CRON_SECRET to .env and Vercel
Generate a random secret: Math.random().toString(36).slice(2)
Add to .env: CRON_SECRET=<secret>
Add to Vercel env vars

## 4. Update profile page text
In ProfileView.tsx, update Community tier description:
- "3 months access" instead of "Lifetime access"
- Add: "Downgrades to Basic after 3 months"

Update Mentorship:
- "1 month mentorship access"
- "Downgrades to Community after 1 month, Basic after 3 months"

## After building:
- Add CRON_SECRET to .env and Vercel
- npm run build
- git add -A && git commit -m "feat: automatic tier downgrade system"
- git push origin main
- vercel --prod
- openclaw message send --channel telegram -t 8743667508 -m "✅ Tier downgrade system live — Community expires after 3 months, Mentorship after 1 month"

## 5. Expired tier messages in CommunityView

When a user tries to access a room they no longer have access to (due to downgrade), show a specific message based on what they lost:

### Mentorship expired (trying to access 1-on-1 chat):
Message: "Your 1-on-1 mentorship has ended. Ready to get back in? Upgrade to Mentorship and continue where you left off."
Button: "Upgrade to Mentorship" → https://brandscaling.co.za/products/brand-scaling-mentorship-upgrade (use existing UPGRADE_LINKS from utils)

### Community expired (trying to access Q&A or Just Chatting):
Message: "Your Community access has ended. Want to keep learning with the group? Upgrade back to Community."
Button: "Upgrade to Community" → use existing community upgrade link from UPGRADE_LINKS

The logic: if tier is 'basic' and they click a locked room, check if they were ever on a higher tier (we can infer this from createdAt — if account is older than 3 months and on basic, they likely downgraded). Show the "expired" message instead of the regular "upgrade" message.

Actually simpler: just update the locked room message in CommunityView to say "Your access to this room has ended — upgrade to unlock it again" with the correct upgrade buttons. Same component, just updated copy.
