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

    // Get customer info
    const email = order.email || order.customer?.email
    const firstName = order.customer?.first_name || order.billing_address?.first_name || "there"
    const lastName = order.customer?.last_name || order.billing_address?.last_name || ""
    const fullName = [firstName, lastName].filter(Boolean).join(" ")

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

              <a href="https://program.brandscaling.co.za/login" style="display: inline-block; background: #FF6B00; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 16px 0;">Access Your Program →</a>

              <p style="font-size: 14px; color: #555; margin-top: 32px;">JvR Brand Scaling Program · brandscaling.co.za</p>
            </div>
          `
        }) } catch(e) { console.error('Email send failed:', e) }

        return NextResponse.json({ ok: true, action: 'upgraded', tier })
      }
      return NextResponse.json({ ok: true, message: "User already at this tier or higher" })
    }

    // New user — create account directly
    // Dedup: check if account already created for this email in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const recentUser = await prisma.user.findFirst({
      where: {
        email,
        createdAt: { gte: fiveMinutesAgo },
      }
    })
    if (recentUser) {
      return NextResponse.json({ ok: true, message: 'Duplicate order event, account already created' })
    }

    await prisma.user.create({
      data: {
        email,
        name: fullName,
        password: "",
        role: "student",
        tier: tier as "basic" | "community" | "mentorship",
        needsPasswordSetup: true,
      }
    })

    // Send welcome email with password setup link
    const encodedEmail = encodeURIComponent(email)
    try { await resend.emails.send({
      from: "program@brandscaling.co.za",
      to: email,
      subject: `Your account is ready — set your password`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px;">
          <h1 style="color: #FF6B00; font-size: 28px; margin-bottom: 8px;">Welcome to the program.</h1>
          <p style="color: #888; margin-bottom: 32px;">JvR Brand Scaling Program</p>

          <p style="font-size: 16px; line-height: 1.6;">Hey ${firstName},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #ccc;">Your payment was confirmed and your <strong style="color: #FF6B00;">${TIER_NAMES[tier]}</strong> account has been created.</p>

          <p style="font-size: 16px; line-height: 1.6; color: #ccc;">Click the button below to set your password and access the program immediately:</p>

          <a href="https://program.brandscaling.co.za/welcome?email=${encodedEmail}" style="display: inline-block; background: #FF6B00; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 16px 0;">Set Your Password →</a>

          <p style="font-size: 14px; color: #555; margin-top: 32px; border-top: 1px solid #222; padding-top: 24px;">If you have any issues, reply to this email.</p>
          <p style="font-size: 14px; color: #555;">JvR Brand Scaling Program · brandscaling.co.za</p>
        </div>
      `
    }) } catch(e) { console.error('Email send failed:', e) }

    return NextResponse.json({ ok: true, action: 'new_user', tier })

  } catch (err) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
