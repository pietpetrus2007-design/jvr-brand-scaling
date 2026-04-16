import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import Anthropic from "@anthropic-ai/sdk"

const SYSTEM_PROMPT = `You are the JvR Brand Scaling AI Assistant. You help students who have purchased the JvR Brand Scaling course.

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
- Keep answers SHORT and direct. Simple question = 2-3 sentences max. Complex question = max 4-5 sentences. Never use long lists unless absolutely necessary.
- Match the length of the question. If they ask something simple, answer simply.
- No filler. No "Great question!". Just the answer.`

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let question: string
  let lessonContext: string | undefined
  try {
    const body = await req.json()
    question = body.question?.trim()
    lessonContext = body.lessonContext?.trim()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (!question) return NextResponse.json({ error: "Question is required" }, { status: 400 })

  const userContent = lessonContext
    ? `Lesson context: ${lessonContext}\n\nQuestion: ${question}`
    : question

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    })

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("")

    return NextResponse.json({ answer: text })
  } catch (err) {
    console.error("AI chat error:", err)
    return NextResponse.json({ error: "Failed to get a response. Please try again." }, { status: 500 })
  }
}
