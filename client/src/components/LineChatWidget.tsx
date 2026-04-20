import { useState, useEffect } from "react";
import { X, MessageCircle } from "lucide-react";

const LINE_OA_ID = "@coachwanchai";
const LINE_ADD_FRIEND_URL = "https://line.me/R/ti/p/@coachwanchai";

export default function LineChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Delay entrance so it doesn't pop in immediately on page load
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Popup card */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 z-[55] w-72 rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
          style={{
            background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)",
            border: "1px solid rgba(251,191,36,0.25)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: "#06C755" }}
          >
            <div className="flex items-center gap-2">
              {/* LINE logo SVG */}
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 fill-white flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              <span className="text-white font-bold text-sm">LINE Official</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="ปิด"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-4 space-y-3">
            <p className="text-gray-200 text-sm leading-relaxed">
              สอบถามรายละเอียดหนังสือ การสั่งซื้อ หรือต้องการคำแนะนำ ทักหาเราได้เลย!
            </p>

            {/* LINE ID badge */}
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: "rgba(6,199,85,0.12)", border: "1px solid rgba(6,199,85,0.3)" }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 flex-shrink-0"
                style={{ fill: "#06C755" }}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              <span className="text-sm font-mono font-semibold" style={{ color: "#06C755" }}>
                {LINE_OA_ID}
              </span>
            </div>

            {/* Hours */}
            <p className="text-gray-400 text-xs">
              ⏰ ตอบกลับ จ–ศ 9:00–18:00 น. | ส–อา 10:00–16:00 น.
            </p>

            {/* CTA button */}
            <a
              href={LINE_ADD_FRIEND_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-xl py-3 font-bold text-white text-sm transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "#06C755", boxShadow: "0 4px 15px rgba(6,199,85,0.4)" }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 fill-white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              เพิ่มเพื่อนใน LINE
            </a>
          </div>
        </div>
      )}

      {/* Floating button */}
      <div
        className={`fixed bottom-6 right-4 z-[55] transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="สอบถามทาง LINE"
          className="group relative flex items-center gap-0 overflow-hidden rounded-full shadow-lg transition-all duration-300 hover:gap-2 hover:pr-4 focus:outline-none"
          style={{
            background: isOpen
              ? "linear-gradient(135deg, #05a847, #06C755)"
              : "linear-gradient(135deg, #06C755, #05a847)",
            boxShadow: "0 4px 20px rgba(6,199,85,0.5)",
            height: "56px",
            paddingLeft: "14px",
            paddingRight: isOpen ? "16px" : "14px",
            minWidth: "56px",
          }}
        >
          {/* Pulse ring */}
          {!isOpen && (
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{ background: "#06C755" }}
            />
          )}

          {/* LINE icon */}
          <svg
            viewBox="0 0 24 24"
            className="w-7 h-7 fill-white flex-shrink-0 relative z-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
          </svg>

          {/* Expandable label */}
          <span
            className="relative z-10 text-white font-semibold text-sm whitespace-nowrap max-w-0 overflow-hidden transition-all duration-300 group-hover:max-w-[120px]"
          >
            สอบถาม LINE
          </span>
        </button>

        {/* Tooltip label (shows when closed and not hovered) */}
        {!isOpen && (
          <div
            className="absolute bottom-full right-0 mb-2 px-2 py-1 rounded-lg text-xs font-medium text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
            style={{ background: "rgba(0,0,0,0.75)" }}
          >
            สอบถามทาง LINE
          </div>
        )}
      </div>
    </>
  );
}
