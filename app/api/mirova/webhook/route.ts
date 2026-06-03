export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import https from "https"

const KLAVIYO_API_KEY = "pk_Tx6fYg_6cf30df39f523f0a7474b5028575ec7b6e"
const KLAVIYO_LIST_ID = "Ta44CC" // Mirova WA Subscribers
async function grantWAConsent(phone: string, email: string | null) {
  const profileAttrs: Record<string, any> = {
    phone_number: phone,
    subscriptions: {
      whatsapp: {
        marketing: {
          consent: "SUBSCRIBED"
        },
        transactional: {
          consent: "SUBSCRIBED"
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
        historical_import: true
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
    const topic = req.headers.get('x-shopify-topic') || ''

    // For orders/paid — only process paid
    if (topic === 'orders/paid' && order.financial_status && order.financial_status !== 'paid') {
      return NextResponse.json({ ok: true, message: `Skipping — status: ${order.financial_status}` })
    }

    const email = order.email || order.customer?.email || null
    const phone = order.phone || order.customer?.phone || order.billing_address?.phone || order.shipping_address?.phone || null
    const firstName = order.customer?.first_name || order.billing_address?.first_name || ""
    const lastName = order.customer?.last_name || order.billing_address?.last_name || ""

    if (!phone) {
      console.log("Mirova webhook: no phone number on order", order.id)
      return NextResponse.json({ ok: true, message: "No phone number on order" })
    }

    console.log(`Mirova webhook: granting WA consent for ${phone} (${email})`)

    // Fire and don't await — let it process async while Klaviyo profile syncs
    grantWAConsent(phone, email).catch(e => console.error('WA consent error:', e?.message))

    // Also schedule a retry after 3 minutes to handle cases where profile doesn't exist yet
    setTimeout(() => {
      grantWAConsent(phone, email).catch(e => console.error('WA consent retry error:', e?.message))
    }, 3 * 60 * 1000)

    return NextResponse.json({ ok: true, phone, email })

  } catch (err: any) {
    console.error("Mirova webhook error:", err)
    return NextResponse.json({ error: "Internal error", detail: err?.message || String(err) }, { status: 500 })
  }
}
