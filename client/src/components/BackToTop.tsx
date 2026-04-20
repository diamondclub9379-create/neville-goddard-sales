import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const SHOW_THRESHOLD = 300; // px scrolled before button appears

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SHOW_THRESHOLD);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="กลับขึ้นด้านบน"
      className={`fixed bottom-6 left-4 z-[55] w-12 h-12 rounded-full flex items-center justify-center
        transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
        hover:scale-110 active:scale-95
        ${visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}`}
      style={{
        background: "linear-gradient(135deg, #f59e0b, #d97706)",
        boxShadow: visible
          ? "0 4px 20px rgba(245,158,11,0.45), 0 2px 8px rgba(0,0,0,0.3)"
          : "none",
      }}
    >
      <ArrowUp size={20} className="text-slate-900" strokeWidth={2.5} />
    </button>
  );
}
