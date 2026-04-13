export const TIER_ORDER = { basic: 0, community: 1, mentorship: 2 } as const

export function tierLabel(tier: string) {
  return tier.charAt(0).toUpperCase() + tier.slice(1)
}

export const UPGRADE_LINKS: Record<string, Record<string, string>> = {
  basic: {
    community: "https://brandscaling.co.za/products/upgrade-from-basic-to-community?variant=47713009336485",
    mentorship: "https://brandscaling.co.za/products/upgrade-from-basic-to-mentorship?variant=47712428982437",
  },
  community: {
    mentorship: "https://brandscaling.co.za/products/upgrade-from-community-to-mentorship?variant=47712430063781",
  },
}
