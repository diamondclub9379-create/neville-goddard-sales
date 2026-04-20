import { VOLUME_DISCOUNT_TIERS, STANDARD_SHIPPING_FEE } from "@shared/const";
import { Button } from "@/components/ui/button";
import { X, TrendingUp, Truck, Percent } from "lucide-react";

interface TierNudgePopupProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubtotal: number;
  onContinueShopping: () => void;
}

/**
 * Replaces the old BundleUpsellPopup.
 * Shows the next volume discount tier the customer can unlock by adding more books.
 */
export function BundleUpsellPopup({ isOpen, onClose, currentSubtotal, onContinueShopping }: TierNudgePopupProps) {
  if (!isOpen) return null;

  // Find the next tier the customer hasn't yet unlocked
  const nextTier = [...VOLUME_DISCOUNT_TIERS]
    .reverse()
    .find(t => t.minSubtotal > currentSubtotal);

  // If already at max tier, show a congratulations message
  const isMaxTier = !nextTier;
  const amountNeeded = nextTier ? nextTier.minSubtotal - currentSubtotal : 0;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-400/40 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-amber-400/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-amber-400">
              {isMaxTier ? "🎉 คุณได้รับส่วนลดสูงสุดแล้ว!" : "💡 เพิ่มส่วนลดได้อีก!"}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {isMaxTier ? (
            <div className="text-center space-y-3">
              <div className="text-4xl">🏆</div>
              <p className="text-white text-lg font-semibold">ยอดเยี่ยม! คุณได้รับส่วนลด 20% + จัดส่งฟรี</p>
              <p className="text-gray-400 text-sm">คุณอยู่ในระดับ VIP แล้ว ดำเนินการชำระเงินได้เลย</p>
            </div>
          ) : (
            <>
              <p className="text-gray-300 text-sm leading-relaxed">
                เพิ่มหนังสืออีก <span className="text-amber-400 font-bold text-base">฿{amountNeeded}</span> เพื่อปลดล็อก:
              </p>

              {/* Next tier highlight */}
              <div className="bg-gradient-to-r from-amber-400/10 to-slate-800/50 border border-amber-400/30 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Percent className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-400 font-bold text-lg">ส่วนลด {nextTier!.discountPercent}%</span>
                  <span className="text-gray-400">+</span>
                  <Truck className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-semibold">จัดส่งฟรี</span>
                </div>
                <p className="text-gray-400 text-xs">เมื่อยอดรวมถึง ฿{nextTier!.minSubtotal}</p>
              </div>

              {/* All tiers summary */}
              <div className="space-y-2">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">ระดับส่วนลดทั้งหมด</p>
                {[...VOLUME_DISCOUNT_TIERS].reverse().map(tier => {
                  const isUnlocked = currentSubtotal >= tier.minSubtotal;
                  return (
                    <div
                      key={tier.label}
                      className={`flex items-center justify-between text-sm rounded-lg px-3 py-2 ${
                        isUnlocked
                          ? "bg-green-500/10 border border-green-500/20 text-green-400"
                          : tier.minSubtotal === nextTier?.minSubtotal
                          ? "bg-amber-400/10 border border-amber-400/30 text-amber-400"
                          : "bg-slate-800/50 border border-slate-700 text-gray-500"
                      }`}
                    >
                      <span>ยอด ฿{tier.minSubtotal}+</span>
                      <span className="font-bold">ลด {tier.discountPercent}% + จัดส่งฟรี {isUnlocked ? "✓" : ""}</span>
                    </div>
                  );
                })}
                <div className={`flex items-center justify-between text-sm rounded-lg px-3 py-2 ${
                  currentSubtotal < 1000
                    ? "bg-slate-700/50 border border-slate-600 text-gray-300"
                    : "bg-slate-800/50 border border-slate-700 text-gray-500"
                }`}>
                  <span>ยอดต่ำกว่า ฿1,000</span>
                  <span>ค่าจัดส่ง ฿{STANDARD_SHIPPING_FEE}</span>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onContinueShopping}
              className="flex-1 bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold"
            >
              {isMaxTier ? "✓ ดำเนินการต่อ" : "📚 เลือกหนังสือเพิ่ม"}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-slate-600 text-gray-400 hover:text-white"
            >
              ปิด
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
