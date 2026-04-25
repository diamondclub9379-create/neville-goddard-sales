export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

/**
 * Volume discount tiers — quantity-based promo.
 * Sorted descending by minQuantity so we match the best tier first.
 *
 * Promo:
 *   - 2 books → 30% off
 *   - 3+ books → 35% off + free shipping
 */
export const VOLUME_DISCOUNT_TIERS = [
  { minQuantity: 3, discountPercent: 35, label: "Mega Deal 35%", freeShipping: true },
  { minQuantity: 2, discountPercent: 30, label: "Combo 30%", freeShipping: false },
] as const;

export const STANDARD_SHIPPING_FEE = 50;

export type DiscountTierLabel = (typeof VOLUME_DISCOUNT_TIERS)[number]["label"] | null;

/**
 * Compute volume discount based on cart subtotal AND total quantity (number of books).
 * Returns the matched tier (or null), discount amount, shipping fee, and net total.
 *
 * `quantity` is the total number of items in the cart (sum of item.quantity).
 */
export function calcVolumeDiscount(subtotal: number, quantity: number = 0): {
  tier: DiscountTierLabel;
  discountPercent: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  freeShipping: boolean;
} {
  for (const t of VOLUME_DISCOUNT_TIERS) {
    if (quantity >= t.minQuantity) {
      const discountAmount = Math.round(subtotal * t.discountPercent / 100);
      const shippingFee = t.freeShipping ? 0 : STANDARD_SHIPPING_FEE;
      return {
        tier: t.label,
        discountPercent: t.discountPercent,
        discountAmount,
        shippingFee,
        total: subtotal - discountAmount + shippingFee,
        freeShipping: t.freeShipping,
      };
    }
  }
  return {
    tier: null,
    discountPercent: 0,
    discountAmount: 0,
    shippingFee: STANDARD_SHIPPING_FEE,
    total: subtotal + STANDARD_SHIPPING_FEE,
    freeShipping: false,
  };
}
