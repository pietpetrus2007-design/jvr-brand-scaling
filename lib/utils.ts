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

export const UPGRADE_PRODUCT_URLS: Record<string, Record<string, string>> = {
  basic: {
    community: "https://brandscaling.co.za/products/upgrade-from-basic-to-community",
    mentorship: "https://brandscaling.co.za/products/upgrade-from-basic-to-mentorship",
  },
  community: {
    mentorship: "https://brandscaling.co.za/products/upgrade-from-community-to-mentorship",
  },
}

export function getUpgradeUrl(fromTier: string, toTier: string, email?: string): string {
  return UPGRADE_PRODUCT_URLS[fromTier]?.[toTier] ?? "https://brandscaling.co.za"
}

// Keep for backwards compatibility
export const UPGRADE_LINKS: Record<string, Record<string, string>> = {
  basic: {
    community: "https://brandscaling.co.za/products/upgrade-from-basic-to-community",
    mentorship: "https://brandscaling.co.za/products/upgrade-from-basic-to-mentorship",
  },
  community: {
    mentorship: "https://brandscaling.co.za/products/upgrade-from-community-to-mentorship",
  },
}
