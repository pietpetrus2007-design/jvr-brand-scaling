Build an AI Q&A assistant for the JvR Brand Scaling course platform.

## What it does
Students can ask questions about the course content. The AI answers based on JvR's exact teaching — not generic internet advice. It only answers questions relevant to the Brand Scaling business model in the South African context.

## 1. Add Anthropic API key to .env and Vercel
ANTHROPIC_API_KEY=  (will be provided)

Actually use the existing Claude API that OpenClaw uses — but for this we need to call it directly from the server. Use the Anthropic SDK.

Install: npm install @anthropic-ai/sdk

## 2. Create /api/ai/chat route

POST /api/ai/chat
Body: { question: string, lessonContext?: string }

The system prompt (hardcoded, not changeable by users):

```
You are the JvR Brand Scaling AI Assistant. You help students who have purchased the JvR Brand Scaling course.

Your role:
- Answer questions about the Brand Scaling business model
- Give advice specific to the South African market (use Rand, reference SA platforms, SA business culture)
- Reference the course content when answering
- Be direct and practical — no fluff, no filler
- Sound like a knowledgeable mentor, not a chatbot

The Brand Scaling business model:
- Students learn to scale brands by running paid ads (Meta, TikTok, Google) for businesses
- They find clients through outreach (DMs, email, cold calling)
- They charge monthly retainers (R5,000-R30,000/month per client) or revenue share
- The goal is multiple clients = recurring income
- Students do NOT need experience — they learn while earning
- Key skills: client outreach, Meta Ads, creative strategy, reporting

South Africa specifics:
- Use Rand (R) for all pricing examples
- Reference local platforms: Facebook/Instagram (Meta) dominant in SA
- SA businesses are often on Facebook, Instagram, WhatsApp
- Good niches in SA: e-commerce, restaurants, fitness, beauty, real estate
- Beginner pricing: R3,000-R8,000/month retainer
- Intermediate: R8,000-R20,000/month
- Advanced: R20,000+ or revenue share

Rules:
- ONLY answer questions related to Brand Scaling, running ads, finding clients, pricing, outreach, business growth
- If someone asks something off-topic, redirect: "That's outside what I cover — I focus on Brand Scaling. What would you like to know about the course?"
- Never make up statistics or claim specific results
- Be encouraging but honest
- Keep answers concise and actionable (3-5 paragraphs max)
```

The route should:
1. Take the student's question
2. Call Claude claude-haiku-3 (cheapest, fastest) with the system prompt + question
3. Return the response
4. Handle errors gracefully

## 3. New dashboard page: /dashboard/ask

Add "🤖 Ask AI" to the nav between Tracker and Profile.

Page layout:
- Title: "Ask the AI" with subtitle "Your Brand Scaling coach — available 24/7"
- Chat interface:
  - Messages displayed in a scrollable chat thread
  - Student messages on right (orange bubble)
  - AI responses on left (dark bubble with small "AI" badge)
  - Input at bottom with "Ask" button
  - Enter key submits
  - Loading state while AI responds (typing indicator with 3 dots)
- First message auto-displayed: "Hey! I'm your Brand Scaling AI assistant. Ask me anything about finding clients, running ads, pricing your services, or growing your income. I'm here to help. 🔥"
- Mobile responsive
- Messages persist in state (cleared on page reload — no DB needed)

## 4. Add to nav
Add { href: "/dashboard/ask", label: "Ask AI", icon: "🤖" } to DashboardNav links

## After building:
- npm run build (fix errors)
- git add -A && git commit -m "feat: AI assistant - 24/7 brand scaling coach"
- git push origin main  
- vercel --prod
- Add ANTHROPIC_API_KEY env var to Vercel (will be provided after build)
- openclaw system event --text "Done: AI assistant deployed" --mode now

Note: Use the anthropic SDK with model "claude-haiku-4-5" - fast and cheap for Q&A
