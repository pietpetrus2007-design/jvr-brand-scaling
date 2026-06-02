export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import https from "https"

const KLAVIYO_API_KEY = "pk_Tx6fYg_838a6cd158dfe40ef9b6a7765ecb0e79fd"
const KLAVIYO_LIST_ID = "VxHbNn" // Mirova Main Email List
const CONSENT_DATE = new Date().toISOString()

async function grantWAConsent(phone: string, email: string | null) {
  const profileAttrs: Record<string, any> = {
    phone_number: phone,
    subscriptions: {
      whatsapp: {
        marketing: {
          consent: "SUBSCRIBED",
          consented_at: CONSENT_DATE
        },
        transactional: {
          consent: "SUBSCRIBED",
          consented_at: CONSENT_DATE
        }
      }
    }
  }

  if (email) profileAttrs.email = email

  const payload = {
    data: {
      type: "profile-subscription-bulk-create-job",
      attributes: {
        profiles: {
          data: [{
            type: "profile",
            attributes: profileAttrs
          }]
        },
        historical_import: false
      },
      relationships: {
        list: {
          data: {
            type: "list",
            id: KLAVIYO_LIST_ID
          }
        }
      }
    }
  }

  const body = JSON.stringify(payload)
  
  return new Promise<number>((resolve, reject) => {
    const options = {
      hostname: 'a.klaviyo.com',
      path: '/api/profile-subscription-bulk-create-jobs/',
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        'revision': '2024-10-15',
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Klaviyo error ${res.statusCode}: ${data}`))
        } else {
          resolve(res.statusCode || 200)
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()

    // Verify Shopify webhook signature
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256")
    const webhookSecret = process.env.MIROVA_SHOPIFY_WEBHOOK_SECRET

    if (webhookSecret && hmacHeader) {
      const computedHmac = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("base64")
      if (computedHmac !== hmacHeader) {
        console.error("Mirova webhook: HMAC mismatch")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    const order = JSON.parse(body)

    // Only process paid orders
    if (order.financial_status && order.financial_status !== 'paid') {
      return NextResponse.json({ ok: true, message: `Skipping — status: ${order.financial_status}` })
    }

    const email = order.email || order.customer?.email || null
    const phone = order.phone || order.customer?.phone || order.billing_address?.phone || null
    const firstName = order.customer?.first_name || order.billing_address?.first_name || ""
    const lastName = order.customer?.last_name || order.billing_address?.last_name || ""

    if (!phone) {
      console.log("Mirova webhook: no phone number on order", order.id)
      return NextResponse.json({ ok: true, message: "No phone number on order" })
    }

    console.log(`Mirova webhook: granting WA consent for ${phone} (${email})`)

    await grantWAConsent(phone, email)

    console.log(`Mirova webhook: WA consent granted for ${phone}`)
    return NextResponse.json({ ok: true, phone, email })

  } catch (err: any) {
    console.error("Mirova webhook error:", err)
    return NextResponse.json({ error: "Internal error", detail: err?.message || String(err) }, { status: 500 })
  }
}
