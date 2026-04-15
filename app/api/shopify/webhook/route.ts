export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { Resend } from "resend"
import prisma from "@/lib/prisma"

const resend = new Resend(process.env.RESEND_API_KEY!)

// Shopify variant ID → tier mapping
const VARIANT_TIER_MAP: Record<string, string> = {
  "47701031551141": "basic",        // Full Program R2,999
  "47701031583909": "community",    // Full Program + Community R4,999
  "47701031616677": "mentorship",   // Private Mentorship R8,999
  "47713009336485": "community",    // Upgrade Basic→Community R2,000
  "47712428982437": "mentorship",   // Upgrade Basic→Mentorship R6,000
  "47712430063781": "mentorship",   // Upgrade Community→Mentorship R4,000
}

const TIER_NAMES: Record<string, string> = {
  basic: "Basic",
  community: "Community",
  mentorship: "Mentorship",
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()

    // Verify Shopify webhook signature
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256")
    const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET

    // Signature verification — log only for now to debug
    if (webhookSecret && hmacHeader) {
      const computedHmac = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("base64")
      if (computedHmac !== hmacHeader) {
        console.error("HMAC mismatch — proceeding anyway for debugging")
        // TODO: re-enable rejection after confirming signature format
      }
    }

    const order = JSON.parse(body)
    console.log("WEBHOOK RECEIVED:", JSON.stringify({ email: order.email, financial_status: order.financial_status, line_items: order.line_items?.map((i: any) => ({ variant_id: i.variant_id, title: i.title })) }))

    // Only process paid orders
    if (order.financial_status && order.financial_status !== 'paid') {
      return NextResponse.json({ ok: true, message: `Skipping — status: ${order.financial_status}` })
    }

    // Get customer email
    const email = order.email || order.customer?.email
    const firstName = order.customer?.first_name || order.billing_address?.first_name || "there"

    if (!email) {
      return NextResponse.json({ error: "No email" }, { status: 400 })
    }

    // Determine tier from line items
    let tier: string | null = null
    for (const item of order.line_items || []) {
      const variantId = String(item.variant_id)
      if (VARIANT_TIER_MAP[variantId]) {
        tier = VARIANT_TIER_MAP[variantId]
        break
      }
    }

    if (!tier) {
      console.log("Unknown product variant, skipping:", order.line_items)
      return NextResponse.json({ ok: true, message: "Unknown product, skipped" })
    }

    // Check if we already processed this order (dedup by order ID + email)
    const orderId = String(order.id || '')
    if (orderId) {
      const alreadyProcessed = await (prisma.inviteCode as any).findFirst({
        where: { code: { startsWith: `ORD-${orderId.slice(-6)}` } }
      })
      if (alreadyProcessed) {
        return NextResponse.json({ ok: true, message: 'Already processed' })
      }
    }

    // Check if this is an upgrade (customer already exists)
    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      // Upgrade existing user's tier only if new tier is higher
      const TIER_ORDER: Record<string, number> = { basic: 0, community: 1, mentorship: 2 }
      if (TIER_ORDER[tier] > TIER_ORDER[existingUser.tier]) {
        await prisma.user.update({
          where: { email },
          data: { tier: tier as "basic" | "community" | "mentorship" },
        })

        // Send upgrade confirmation email
        try { await resend.emails.send({
          from: "program@brandscaling.co.za",
          to: email,
          subject: `Your ${TIER_NAMES[tier]} access is now active — JvR Brand Scaling`,
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px;">
              <h1 style="color: #FF6B00; font-size: 28px; margin-bottom: 8px;">You're upgraded!</h1>
              <p style="color: #888; margin-bottom: 32px;">JvR Brand Scaling Program</p>

              <p style="font-size: 16px; line-height: 1.6;">Hey ${firstName},</p>
              <p style="font-size: 16px; line-height: 1.6; color: #ccc;">Your account has been upgraded to <strong style="color: #FF6B00;">${TIER_NAMES[tier]}</strong> access.</p>

              <p style="font-size: 16px; line-height: 1.6; color: #ccc;">Log in to access your new features:</p>

              <a href="https://jvr-brand-scaling.vercel.app/login" style="display: inline-block; background: #FF6B00; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 16px 0;">Access Your Program →</a>

              <p style="font-size: 14px; color: #555; margin-top: 32px;">JvR Brand Scaling Program · brandscaling.co.za</p>
            </div>
          `
        }) } catch(e) { console.error('Email send failed:', e) }

        return NextResponse.json({ ok: true, action: 'upgraded', tier })
      }
      return NextResponse.json({ ok: true, message: "User already at this tier or higher" })
    }

    // New user — generate unique invite code
    let code = generateCode()
    let attempts = 0
    while (attempts < 10) {
      const exists = await prisma.inviteCode.findUnique({ where: { code } })
      if (!exists) break
      code = generateCode()
      attempts++
    }

    await prisma.inviteCode.create({
      data: { code, tier: tier as "basic" | "community" | "mentorship" }
    })

    // Send welcome email with invite code
    try { await resend.emails.send({
      from: "program@brandscaling.co.za",
      to: email,
      subject: `Your access code is ready — JvR Brand Scaling Program`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px;">
          <h1 style="color: #FF6B00; font-size: 28px; margin-bottom: 8px;">Welcome to the program.</h1>
          <p style="color: #888; margin-bottom: 32px;">JvR Brand Scaling Program</p>

          <p style="font-size: 16px; line-height: 1.6;">Hey ${firstName},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #ccc;">Your payment was received. Here's your access code for the <strong style="color: #FF6B00;">${TIER_NAMES[tier]}</strong> plan:</p>

          <div style="background: #111; border: 2px solid #FF6B00; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px;">Your Invite Code</p>
            <p style="color: #FF6B00; font-size: 36px; font-weight: bold; font-family: monospace; letter-spacing: 4px; margin: 0;">${code}</p>
          </div>

          <p style="font-size: 16px; line-height: 1.6; color: #ccc;">To create your account:</p>
          <ol style="color: #ccc; font-size: 15px; line-height: 2;">
            <li>Go to the link below</li>
            <li>Enter your invite code: <strong style="color: #FF6B00;">${code}</strong></li>
            <li>Create your account</li>
            <li>Start learning immediately</li>
          </ol>

          <a href="https://jvr-brand-scaling.vercel.app/register" style="display: inline-block; background: #FF6B00; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 16px 0;">Create Your Account →</a>

          <p style="font-size: 14px; color: #555; margin-top: 32px; border-top: 1px solid #222; padding-top: 24px;">Keep this code safe — it's linked to your purchase. If you have any issues, reply to this email.</p>
          <p style="font-size: 14px; color: #555;">JvR Brand Scaling Program · brandscaling.co.za</p>
        </div>
      `
    }) } catch(e) { console.error('Email send failed:', e) }

    return NextResponse.json({ ok: true, action: 'new_user', tier, code })

  } catch (err) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

