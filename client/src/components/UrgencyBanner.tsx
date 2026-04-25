import { useEffect, useState } from "react";
import { calcVolumeDiscount } from "@shared/const";

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
  const [deadline, setDeadline] = useState<number>(() => getOrCreateDeadline());
  const [remaining, setRemaining] = useState<number>(deadline - Date.now());

  // Current tier badge — based on quantity now
  const { tier, discountPercent, freeShipping } = calcVolumeDiscount(cartSubtotal, cartQuantity);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const left = deadline - now;
      if (left <= 0) {
        // Rolling reset: expired → create new 24hr window
        const newDeadline = now + TWENTY_FOUR_HOURS;
        try { localStorage.setItem(DEADLINE_KEY, String(newDeadline)); } catch { /* ignore */ }
        setDeadline(newDeadline);
        setRemaining(TWENTY_FOUR_HOURS);
      } else {
        setRemaining(left);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const isUrgent = remaining < ONE_HOUR;

  return (
    <div
      className={`w-full text-center text-sm font-semibold py-2 px-4 select-none transition-colors duration-700 ${
        isUrgent
          ? "animate-pulse bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white"
          : "bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white"
      }`}
      style={{ zIndex: 9999 }}
    >
      <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
        <span>🔥 ซื้อ 2 เล่ม ลด 30% • ซื้อ 3 เล่มขึ้นไป ลด 35% + ส่งฟรี! หมดเวลาใน</span>
        <span
          className={`font-mono font-bold text-base tracking-widest ${
            isUrgent ? "text-yellow-300" : "text-yellow-200"
          }`}
        >
          {formatTime(remaining)}
        </span>
        {tier && cartQuantity > 0 && (
          <span className="ml-2 inline-flex items-center gap-1 bg-white/20 border border-white/30 rounded-full px-2.5 py-0.5 text-xs font-bold text-white">
            🎉 ตะกร้าคุณ: ลด {discountPercent}%{freeShipping ? " + ส่งฟรี" : ""}
          </span>
        )}
      </span>
    </div>
  );
}
