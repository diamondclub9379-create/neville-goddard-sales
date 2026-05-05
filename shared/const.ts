export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// Skool community — free lead-capture community.
// CTAs link to the internal /community path (handled by an Express
// redirect on the server) rather than skool.com directly. This gives
// us a short branded URL we can change in one place if we ever migrate
// community providers, and lets us add UTM params for tracking later.
export const SKOOL_COMMUNITY_URL =
  "https://www.skool.com/neville-goddard-thailand-7694/about";
export const COMMUNITY_PATH = "/community";

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
 * BOGO 5/5 promo — "ซื้อ 1 แถม 1" — active for one day only.
 * Bangkok timezone (UTC+7): 2026-05-05 00:00 → 2026-05-06 00:00 (exclusive).
 * Equivalent UTC: 2026-05-04 17:00 → 2026-05-05 17:00.
 */
export const BOGO_PROMO_START_MS = Date.UTC(2026, 4, 4, 17, 0, 0);
export const BOGO_PROMO_END_MS = Date.UTC(2026, 4, 5, 17, 0, 0);
export const BOGO_TIER_LABEL = "BOGO 5/5";

export function isBogoActive(now: number = Date.now()): boolean {
  return now >= BOGO_PROMO_START_MS && now < BOGO_PROMO_END_MS;
}

export interface CartLine {
  unitPrice: number;
  quantity: number;
}

/**
 * BOGO 5/5: for each book in the cart, ship one extra free copy.
 * Customer pays full subtotal; we ship 2× the cart with free shipping.
 * "ซื้อ N เล่ม ฟรี N เล่ม" — cart of 2 ships 4 books, cart of 3 ships 6 books.
 *
 * No price discount is applied (the value is the doubled shipment), so this
 * helper just exposes the freeUnits count for display.
 */
export function calcBogoDiscount(items: CartLine[]): { discountAmount: number; freeUnits: number } {
  let qty = 0;
  for (const it of items) qty += it.quantity;
  return { discountAmount: 0, freeUnits: qty };
}

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

export type PromoMode = "bogo" | "volume" | null;

export interface CartDiscountResult {
  promo: PromoMode;
  tier: string | null;
  discountPercent: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  freeShipping: boolean;
  freeUnits: number;
}

/**
 * Unified cart discount calculator. While BOGO 5/5 is active, applies BOGO
 * (every 2nd book free, free shipping for orders of 2+ books). Otherwise
 * falls back to the standard volume-tier discount.
 *
 * Pass `items` when available for exact BOGO calculation; without items
 * the discount is approximated from average price (used by display-only
 * components like the urgency banner).
 */
export function calcCartDiscount(
  subtotal: number,
  quantity: number = 0,
  items?: CartLine[],
  now: number = Date.now(),
): CartDiscountResult {
  if (isBogoActive(now)) {
    if (quantity < 1) {
      return {
        promo: null,
        tier: null,
        discountPercent: 0,
        discountAmount: 0,
        shippingFee: STANDARD_SHIPPING_FEE,
        total: subtotal + STANDARD_SHIPPING_FEE,
        freeShipping: false,
        freeUnits: 0,
      };
    }
    // Customer pays full subtotal; we ship one free copy of every book in cart.
    return {
      promo: "bogo",
      tier: BOGO_TIER_LABEL,
      discountPercent: 0,
      discountAmount: 0,
      shippingFee: 0,
      total: subtotal,
      freeShipping: true,
      freeUnits: quantity,
    };
  }
  const v = calcVolumeDiscount(subtotal, quantity);
  return {
    promo: v.tier ? "volume" : null,
    tier: v.tier,
    discountPercent: v.discountPercent,
    discountAmount: v.discountAmount,
    shippingFee: v.shippingFee,
    total: v.total,
    freeShipping: v.freeShipping,
    freeUnits: 0,
  };
}
