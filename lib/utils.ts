export const TIER_ORDER = { basic: 0, community: 1, mentorship: 2 } as const

export function tierLabel(tier: string) {
  return tier.charAt(0).toUpperCase() + tier.slice(1)
}

// Base checkout URLs (email will be appended dynamically)
export const UPGRADE_VARIANT_IDS: Record<string, Record<string, string>> = {
  basic: {
    community: "47713009336485",
    mentorship: "47712428982437",
  },
  community: {
    mentorship: "47712430063781",
  },
}

export function getUpgradeUrl(fromTier: string, toTier: string, email?: string): string {
  const variantId = UPGRADE_VARIANT_IDS[fromTier]?.[toTier]
  if (!variantId) return "https://brandscaling.co.za"
  const base = `https://jvr-8226.myshopify.com/cart/${variantId}:1`
  return email ? `${base}?checkout[email]=${encodeURIComponent(email)}` : base
}

// Keep for backwards compatibility
export const UPGRADE_LINKS: Record<string, Record<string, string>> = {
  basic: {
    community: "https://jvr-8226.myshopify.com/cart/47713009336485:1",
    mentorship: "https://jvr-8226.myshopify.com/cart/47712428982437:1",
  },
  community: {
    mentorship: "https://jvr-8226.myshopify.com/cart/47712430063781:1",
  },
}
