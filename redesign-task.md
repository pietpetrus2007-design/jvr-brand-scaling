Do a full visual redesign of the JvR Brand Scaling platform. Keep all functionality — only improve the look and feel.

## Design Direction
- Black (#000) background throughout
- Orange (#FF6B00) as the primary accent — use it more aggressively
- White text, #888 muted text
- Inter font
- Premium, bold, high-contrast — think Vercel/Linear meets a hype brand
- Subtle orange glows behind key elements
- Smooth hover transitions (150ms)

## Landing Page (app/page.tsx) — Full redesign
- Full viewport hero section:
  - Large bold headline: "Scale Brands. Build Wealth." (two lines, second line in orange)
  - Subheading: "The exact system used to land clients, run ads, and grow revenue for brands — taught step by step."
  - Two CTA buttons side by side: "Get Access →" (orange, links to https://brandscaling.co.za) and "Already have a code? Register →" (outlined, links to /register)
  - Subtle orange radial gradient glow behind the headline
- Stats bar below hero: "500+ Students" | "3 Tiers" | "Lifetime Access" | "Real Results" — separated by dots, orange numbers
- Features section: 3 cards (Land Clients / Scale Revenue / Get Paid) with orange icons, dark card bg (#0a0a0a), subtle orange border on hover
- Second CTA section at bottom: "Ready to start?" with big orange button
- Footer: minimal, just logo + copyright

## Login page (/login)
- Centered card, max-w-md
- Logo at top with orange glow
- "Welcome back" heading in white, bold
- Clear orange "Sign In" button
- Below the form: TWO clearly visible options:
  - "Don't have access yet? → Get Access" (links to brandscaling.co.za)  
  - "Have an invite code? → Register here" (links to /register) — make this PROMINENT, orange text, not hidden

## Register page (/register)
- At the TOP of the page, before anything else, show a clear banner:
  ```
  🎟️ Have an invite code?
  Enter it below to get started — your code was sent after purchase.
  ```
- Step 1 card: "Enter Your Invite Code" — large input, orange border on focus, big orange "Verify Code →" button
- Show the tier they're unlocking after verification (e.g. "✅ Community access unlocked!")
- Step 2 card: "Create Your Account" — name, email, password fields
- Clear and welcoming — not clinical

## Dashboard Layout
- Sidebar (desktop): 
  - Logo at top: "JvR" in orange + "Brand Scaling" in white, bold
  - Nav items: larger click targets, orange left border + bg when active
  - User section at bottom: avatar circle with initials, name, tier badge (orange for mentorship, purple for community, blue for basic)
  - Sign out button with icon
- Bottom nav (mobile): icons + labels, orange active state

## Dashboard — Course page
- Module cards with orange left border
- Lesson rows with checkmark when completed (orange check)
- Progress bar in orange
- Video player area: dark bg, centered, rounded corners
- "Mark Complete" button: orange, full width

## Dashboard — Community page
- Room sidebar: cleaner, orange active state with glow
- Message bubbles: slightly rounded, better spacing
- Avatar circles: colored by tier (orange=mentorship, purple=community, blue=basic)
- Tier badges in messages: pill shape, colored bg
- Chat input: orange glow on focus, camera icon in orange
- Images in chat: rounded corners, subtle border, click to expand
- Locked room screen: bigger lock icon, more enticing upgrade copy, orange upgrade buttons

## Dashboard — Announcements page
- Cards with orange top border
- Admin badge on poster name
- Clean date formatting

## Dashboard — Profile page
- Tier badge: large, prominent, colored
- Progress stats in orange
- Upgrade code input: orange border, clear label

## Admin panel
- Stats cards: orange numbers, dark bg
- Tables: cleaner, hover highlight
- Buttons: orange primary, dark outlined secondary

## After redesign
- npm run build (fix all errors)
- git add -A && git commit -m "design: full visual redesign — more orange, premium feel"
- git push origin main
- vercel --prod
- openclaw system event --text "Done: full redesign deployed" --mode now
