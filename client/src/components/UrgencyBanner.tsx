import { useEffect, useState } from "react";
import { calcCartDiscount, isBogoActive, BOGO_PROMO_END_MS } from "@shared/const";

const DEADLINE_KEY = "discountDeadline";
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

function getOrCreateDeadline(): number {
  try {
    const stored = localStorage.getItem(DEADLINE_KEY);
    if (stored) {
      const deadline = parseInt(stored, 10);
      if (!isNaN(deadline) && deadline > Date.now()) {
        return deadline;
      }
    }
    // No valid deadline → create a new rolling 24hr one
    const newDeadline = Date.now() + TWENTY_FOUR_HOURS;
    localStorage.setItem(DEADLINE_KEY, String(newDeadline));
    return newDeadline;
  } catch {
    return Date.now() + TWENTY_FOUR_HOURS;
  }
}

function formatTime(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, "0")).join(":");
}

interface UrgencyBannerProps {
  cartSubtotal?: number;
  cartQuantity?: number;
}

export function UrgencyBanner({ cartSubtotal = 0, cartQuantity = 0 }: UrgencyBannerProps) {
  const [now, setNow] = useState<number>(() => Date.now());
  const bogo = isBogoActive(now);

  // Volume-mode rolling deadline (used only when BOGO is not active)
  const [volumeDeadline, setVolumeDeadline] = useState<number>(() => getOrCreateDeadline());

  // Active deadline depends on mode
  const deadline = bogo ? BOGO_PROMO_END_MS : volumeDeadline;
  const remaining = deadline - now;

  const calc = calcCartDiscount(cartSubtotal, cartQuantity, undefined, now);

  useEffect(() => {
    const tick = () => {
      const t = Date.now();
      setNow(t);
      // Volume-mode rolling reset (don't touch when BOGO active)
      if (!isBogoActive(t) && volumeDeadline - t <= 0) {
        const newDeadline = t + TWENTY_FOUR_HOURS;
        try { localStorage.setItem(DEADLINE_KEY, String(newDeadline)); } catch { /* ignore */ }
        setVolumeDeadline(newDeadline);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [volumeDeadline]);

  const isUrgent = remaining < ONE_HOUR && remaining > 0;

  const message = bogo
    ? "🎁 5/5 พิเศษ! ซื้อ 1 แถม 1 — ซื้อกี่เล่ม ฟรีเท่านั้น! ส่งฟรีทุกออเดอร์ หมดเวลาใน"
    : "🔥 ซื้อ 2 เล่ม ลด 30% • ซื้อ 3 เล่มขึ้นไป ลด 35% + ส่งฟรี! หมดเวลาใน";

  const bgClasses = bogo
    ? isUrgent
      ? "animate-pulse bg-gradient-to-r from-rose-700 via-pink-600 to-rose-700 text-white"
      : "bg-gradient-to-r from-rose-600 via-pink-500 to-rose-600 text-white"
    : isUrgent
      ? "animate-pulse bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white"
      : "bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white";

  return (
    <div
      className={`w-full text-center text-sm font-semibold py-2 px-4 select-none transition-colors duration-700 ${bgClasses}`}
      style={{ zIndex: 9999 }}
    >
      <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
        <span>{message}</span>
        <span
          className={`font-mono font-bold text-base tracking-widest ${
            isUrgent ? "text-yellow-300" : "text-yellow-200"
          }`}
        >
          {formatTime(remaining)}
        </span>
        {calc.tier && cartQuantity > 0 && (
          <span className="ml-2 inline-flex items-center gap-1 bg-white/20 border border-white/30 rounded-full px-2.5 py-0.5 text-xs font-bold text-white">
            🎉 ตะกร้าคุณ:{" "}
            {bogo
              ? `ฟรี ${calc.freeUnits} เล่ม + ส่งฟรี`
              : `ลด ${calc.discountPercent}%${calc.freeShipping ? " + ส่งฟรี" : ""}`}
          </span>
        )}
      </span>
    </div>
  );
}
