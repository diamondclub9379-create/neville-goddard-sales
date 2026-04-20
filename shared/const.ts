export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

/** Volume discount tiers — sorted descending by minSubtotal so we match the best tier first */
export const VOLUME_DISCOUNT_TIERS = [
  { minSubtotal: 2000, discountPercent: 20, label: "VIP 20%", freeShipping: true },
  { minSubtotal: 1500, discountPercent: 15, label: "Gold 15%", freeShipping: true },
  { minSubtotal: 1000, discountPercent: 10, label: "Silver 10%", freeShipping: true },
] as const;

export const STANDARD_SHIPPING_FEE = 50;

export type DiscountTierLabel = (typeof VOLUME_DISCOUNT_TIERS)[number]["label"] | null;

/**
 * Compute volume discount for a given subtotal.
 * Returns the matched tier (or null), discount amount, shipping fee, and net total.
 */
export function calcVolumeDiscount(subtotal: number): {
  tier: DiscountTierLabel;
  discountPercent: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
} {
  for (const t of VOLUME_DISCOUNT_TIERS) {
    if (subtotal >= t.minSubtotal) {
      const discountAmount = Math.round(subtotal * t.discountPercent / 100);
      return {
        tier: t.label,
        discountPercent: t.discountPercent,
        discountAmount,
        shippingFee: 0,
        total: subtotal - discountAmount,
      };
    }
  }
  return {
    tier: null,
    discountPercent: 0,
    discountAmount: 0,
    shippingFee: STANDARD_SHIPPING_FEE,
    total: subtotal + STANDARD_SHIPPING_FEE,
  };
}
