import { useEffect, useState } from "react";
import { X, Users } from "lucide-react";
import { COMMUNITY_PATH } from "@/const";

const STORAGE_KEY = "community-banner-dismissed-at";
const COOLDOWN_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const SHOW_DELAY_MS = 8000; // Wait 8s after page load before appearing

/**
 * Sticky bottom banner inviting first-time visitors to join the Skool community.
 *
 * - Hides itself for 7 days after the user clicks the close (X) button.
 * - Delays appearance by 8 seconds so it doesn't intrude on initial scroll.
 * - Appears bottom-right on desktop, full-width bottom on mobile.
 * - Lives at the page level, not inside any modal/section.
 */
export function CommunityBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Skip if user dismissed within cooldown
    try {
      const dismissedAt = localStorage.getItem(STORAGE_KEY);
      if (dismissedAt) {
        const ts = parseInt(dismissedAt, 10);
        if (!Number.isNaN(ts) && Date.now() - ts < COOLDOWN_MS) {
          return;
        }
      }
    } catch {
      // localStorage unavailable (private mode, etc) — fall through and show
    }

    const t = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-40 animate-in slide-in-from-bottom-4 fade-in duration-500"
      role="dialog"
      aria-label="เข้าร่วมชุมชน Neville Goddard"
    >
      <div className="bg-gradient-to-br from-emerald-900/95 to-teal-900/95 border border-emerald-400/40 rounded-2xl shadow-2xl shadow-emerald-500/20 backdrop-blur-md p-4 pr-10 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 rounded-full text-emerald-200/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="ปิดแบนเนอร์"
        >
          <X size={16} />
        </button>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 bg-emerald-500/20 p-2 rounded-lg">
            <Users className="text-emerald-300" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-emerald-200 font-bold text-sm mb-1">
              ชุมชน Neville Goddard ฟรี
            </h3>
            <p className="text-emerald-100/80 text-xs mb-3 leading-relaxed">
              มาเรียนรู้ Manifest กับเพื่อนคนไทย แชร์ประสบการณ์ และรับเทคนิคพิเศษ
            </p>
            <a
              href={COMMUNITY_PATH}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDismiss}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all"
            >
              เข้าร่วมฟรี →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
