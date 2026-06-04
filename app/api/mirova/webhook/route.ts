export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import https from "https"

const KLAVIYO_API_KEY = "pk_Tx6fYg_6cf30df39f523f0a7474b5028575ec7b6e"
const KLAVIYO_LIST_ID = "Ta44CC" // Mirova WA Subscribers
function klaviyoReq(path: string, method: string, body: string): Promise<{status: number, data: string}> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'a.klaviyo.com',
      path,
      method,
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
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve({ status: res.statusCode || 0, data }))
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function grantWAConsent(phone: string, email: string | null) {
  // Step 1: If we have email, find existing profile and patch phone + consent onto it
  if (email) {
    const searchRes = await klaviyoReq(
      `/api/profiles/?filter=equals(email,"${encodeURIComponent(email)}")&fields[profile]=id,phone_number`,
      'GET', ''
    )
    if (searchRes.status === 200) {
      const searchData = JSON.parse(searchRes.data)
      const profiles = searchData.data || []
      if (profiles.length > 0) {
        const profileId = profiles[0].id
        // Patch phone number onto existing profile
        const patchBody = JSON.stringify({
          data: {
            type: 'profile',
            id: profileId,
            attributes: { phone_number: phone }
          }
        })
        await klaviyoReq(`/api/profiles/${profileId}/`, 'PATCH', patchBody)
        console.log(`Patched phone ${phone} onto existing profile ${profileId} (${email})`)
      }
    }
  }

  // Step 2: Bulk subscribe with both email + phone (creates or updates profile with WA consent)
  const profileAttrs: Record<string, any> = {
    phone_number: phone,
    subscriptions: {
      whatsapp: {
        marketing: { consent: 'SUBSCRIBED', consented_at: new Date(Date.now() - 60000).toISOString() },
        transactional: { consent: 'SUBSCRIBED', consented_at: new Date(Date.now() - 60000).toISOString() }
      }
    }
  }
  if (email) profileAttrs.email = email

  const payload = JSON.stringify({
    data: {
      type: 'profile-subscription-bulk-create-job',
      attributes: {
        profiles: { data: [{ type: 'profile', attributes: profileAttrs }] },
        historical_import: true
      },
      relationships: { list: { data: { type: 'list', id: KLAVIYO_LIST_ID } } }
    }
  })

  const result = await klaviyoReq('/api/profile-subscription-bulk-create-jobs/', 'POST', payload)
  if (result.status >= 400) throw new Error(`Klaviyo ${result.status}: ${result.data}`)
  return result.status
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

    // Extract email and phone from any webhook type
    const email = order.email || order.customer?.email || null
    const phone = order.phone || order.customer?.phone || 
                  order.billing_address?.phone || order.shipping_address?.phone ||
                  order.default_address?.phone || null
    const firstName = order.first_name || order.customer?.first_name || order.billing_address?.first_name || ""
    const lastName = order.last_name || order.customer?.last_name || order.billing_address?.last_name || ""

    if (!phone) {
      console.log("Mirova webhook: no phone number on order", order.id)
      return NextResponse.json({ ok: true, message: "No phone number on order" })
    }

    // Normalise SA numbers to E.164 format (+27...)
    let normalisedPhone = phone.replace(/\s+/g, '').replace(/-/g, '')
    if (normalisedPhone.startsWith('0') && normalisedPhone.length === 10) {
      normalisedPhone = '+27' + normalisedPhone.slice(1)
    } else if (normalisedPhone.startsWith('27') && !normalisedPhone.startsWith('+')) {
      normalisedPhone = '+' + normalisedPhone
    }

    console.log(`Mirova webhook [${topic}]: phone=${normalisedPhone} email=${email}`)

    // Grant consent — await it so we know it succeeded before responding
    await grantWAConsent(normalisedPhone, email)

    return NextResponse.json({ ok: true, phone: normalisedPhone, email })

  } catch (err: any) {
    console.error("Mirova webhook error:", err)
    return NextResponse.json({ error: "Internal error", detail: err?.message || String(err) }, { status: 500 })
  }
}
