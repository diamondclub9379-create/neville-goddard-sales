import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, Check, Clock, Loader2, Phone, ShoppingCart, Star, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";

// ─── Generic fallback content shared across all books ──────────────────────
const STATS = [
  { value: "50K+", label: "ผู้อ่านทั่วโลก" },
  { value: "4.9★", label: "คะแนนเฉลี่ย" },
  { value: "30+", label: "ปีแห่งปัญญา" },
  { value: "100%", label: "เปลี่ยนชีวิต" },
];

const GENERIC_BENEFITS = [
  {
    icon: "🧠",
    title: "ปลดล็อกพลังจินตนาการ",
    desc: "เรียนรู้เทคนิคการใช้จินตนาการเพื่อสร้างสรรค์ชีวิตตามที่ปรารถนา ตามคำสอนของ Neville Goddard",
  },
  {
    icon: "✨",
    title: "เข้าใจตัวตนที่แท้จริง",
    desc: "ค้นพบความจริงเกี่ยวกับธรรมชาติของจิตสำนึกและศักยภาพที่ซ่อนอยู่ในตัวคุณ",
  },
  {
    icon: "🌟",
    title: "เปลี่ยนความเป็นจริง",
    desc: "นำคำสอนอันทรงพลังไปประยุกต์ใช้จริง เพื่อปรับเปลี่ยนสถานการณ์ในชีวิตให้เป็นไปตามที่ต้องการ",
  },
];

const GENERIC_INCLUDES = [
  "หนังสือฉบับแปลไทยฉบับสมบูรณ์",
  "คู่มือการทำสมาธิและแบบฝึกหัด",
  "เข้าถึงเนื้อหาได้ตลอดชีวิต",
  "จัดส่งฟรีทั่วประเทศ",
  "รับประกันคืนเงิน 30 วัน",
];

const FALLBACK_TESTIMONIALS = [
  {
    name: "สาระ ม.",
    role: "ผู้ประกอบการ",
    text: "หนังสือเล่มนี้เปลี่ยนมุมมองของฉันเกี่ยวกับการ manifest ฉันเห็นผลลัพธ์ในธุรกิจภายในสัปดาห์ เป็นหนังสือที่ดีที่สุดที่เคยอ่าน",
  },
  {
    name: "เจมส์ เค.",
    role: "โค้ชชีวิต",
    text: "การสอนของ Neville ยั่งยืนตลอดกาล ฉันแนะนำหนังสือเล่มนี้ให้กับลูกค้าทั้งหมดของฉัน ความชัดเจนที่ได้รับนั้นน่าทึ่ง",
  },
  {
    name: "เอมม่า แอล.",
    role: "นักเรียน",
    text: "ตอนแรกสงสัย แต่แบบฝึกหัดในหนังสือเปลี่ยนแปลงชีวิตได้จริง ขอแนะนำอย่างยิ่งสำหรับทุกคน",
  },
];

// ─── 24-hour countdown hook, keyed per slug so each book has its own timer ──
function useCountdown(key: string) {
  const [timeLeft, setTimeLeft] = useState("23:59:59");

  useEffect(() => {
    if (!key) return;
    const STORAGE_KEY = `promo_deadline__${key}`;
    let deadline: number;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && parseInt(stored, 10) > Date.now()) {
      deadline = parseInt(stored, 10);
    } else {
      deadline = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY, deadline.toString());
    }

    const tick = () => {
      const diff = Math.max(0, deadline - Date.now());
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setTimeLeft(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [key]);

  return timeLeft;
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const { addToCart, openCart, cartItems } = useCart();
  const [added, setAdded] = useState(false);
  const timeLeft = useCountdown(slug ?? "");

  const productQuery = trpc.products.getBySlug.useQuery(
    { slug: slug ?? "" },
    { enabled: Boolean(slug) }
  );
  const product = productQuery.data;

  const reviewsQuery = trpc.products.reviewsByBookId.useQuery(
    { bookId: product?.id ?? 0 },
    { enabled: Boolean(product?.id) }
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (productQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="animate-spin text-blue-700" size={40} />
      </div>
    );
  }

  if (productQuery.error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
        <h1 className="text-2xl font-bold text-blue-900">ไม่พบสินค้า</h1>
        <Button onClick={() => navigate("/")} variant="outline">
          <ArrowLeft className="mr-2" size={20} /> กลับไปหน้าแรก
        </Button>
      </div>
    );
  }

  const salePrice = Number(product.discountPrice ?? product.price);
  const originalPrice = product.discountPrice ? Number(product.price) : null;
  const discountPct = originalPrice
    ? Math.max(0, Math.round((1 - salePrice / originalPrice) * 100))
    : 0;

  const description = product.descriptionTh || product.description || "";

  // Pick up to 3 real reviews; fall back to generic if fewer
  const realReviews = (reviewsQuery.data ?? []).slice(0, 3).map((r) => ({
    name: r.reviewerName,
    role: "ผู้อ่าน",
    text: r.content,
  }));
  const testimonials =
    realReviews.length >= 3 ? realReviews : FALLBACK_TESTIMONIALS;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      titleTh: product.titleTh,
      titleEn: product.titleEn ?? "",
      price: salePrice,
      image: product.imageUrl,
      description,
      benefits: GENERIC_BENEFITS.map((b) => `${b.icon} ${b.title}`),
      rating: 4.9,
      sold: 100,
    });
    setAdded(true);
    toast.success(`เพิ่ม "${product.titleTh}" ลงตะกร้าแล้ว!`, {
      description: "กดไอคอนตะกร้าเพื่อดูสินค้าและชำระเงิน",
      action: {
        label: "ดูตะกร้า",
        onClick: () => {
          navigate("/?checkout=1");
        },
      },
    });
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Promo Banner ─────────────────────────────────────────── */}
      {discountPct > 0 && (
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-900 py-2.5">
          <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold">
            <Zap size={16} className="text-slate-800" />
            <span>
              โปรโมชั่นจำกัดเวลา 24 ชม. ลด {discountPct}% เหลือ ฿{salePrice.toLocaleString()} จาก ฿{originalPrice?.toLocaleString()}
            </span>
            <div className="flex items-center gap-1.5 bg-white/30 px-3 py-0.5 rounded-full">
              <Clock size={14} />
              <span className="font-bold tabular-nums">{timeLeft}</span>
            </div>
          </div>
        </div>
      )}

      <Navbar
        cartCount={cartCount}
        onCartClick={() => {
          navigate("/?checkout=1");
        }}
      />

      {/* ── Sticky Section Nav ───────────────────────────────────── */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-blue-100 sticky top-16 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex gap-6">
            <a href="#about" className="text-blue-700 hover:text-blue-900 font-semibold text-sm transition-colors">
              เกี่ยวกับ
            </a>
            <a href="#testimonials" className="text-blue-700 hover:text-blue-900 font-semibold text-sm transition-colors">
              บทวิจารณ์
            </a>
            <a href="#pricing" className="text-blue-700 hover:text-blue-900 font-semibold text-sm transition-colors">
              ซื้อเลย
            </a>
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-2 rounded-lg text-sm transition-colors shadow-md"
          >
            ซื้อเลย - ฿{salePrice.toLocaleString()}
            {discountPct > 0 && ` (ลด ${discountPct}%)`}
          </button>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        {/* Decorative glows */}
        <div className="absolute top-20 -left-32 w-96 h-96 bg-amber-200/40 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-20 -right-32 w-96 h-96 bg-blue-300/40 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-24 grid md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="text-center md:text-left">
            {product.category && (
              <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full mb-5 border border-amber-300 tracking-widest uppercase">
                ✦ {product.category}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-900 leading-tight mb-4">
              {product.titleTh}
            </h1>
            {product.titleEn && (
              <p className="text-xl md:text-2xl text-amber-600 italic mb-6">{product.titleEn}</p>
            )}
            <p className="text-blue-800/80 text-lg mb-8 leading-relaxed max-w-lg">
              {description.slice(0, 280)}
              {description.length > 280 ? "..." : ""}
            </p>

            <p className="text-blue-600/70 text-sm mb-6">เชื่อถือโดยผู้แสวงหาความรู้นับพันคน</p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 justify-center md:justify-start">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-10 py-6 text-lg rounded-xl shadow-xl shadow-blue-200 transition-all w-full sm:w-auto"
              >
                <ShoppingCart className="mr-2" size={20} />
                {added
                  ? "✓ เพิ่มลงตะกร้าแล้ว!"
                  : `ซื้อเลย - ฿${salePrice.toLocaleString()}${discountPct > 0 ? ` (ลด ${discountPct}%)` : ""}`}
              </Button>
              <a
                href="#about"
                className="text-blue-700 hover:text-blue-900 font-semibold text-sm underline underline-offset-4 transition-colors"
              >
                เรียนรู้เพิ่มเติม
              </a>
            </div>

            <p className="text-sm text-blue-600/70">
              ✓ ส่งฟรี &nbsp;•&nbsp; ✓ รับประกัน 30 วัน &nbsp;•&nbsp; ✓ เข้าถึงตลอดชีวิต
            </p>

            {discountPct > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full text-sm text-amber-700">
                <Clock size={14} />
                <span>
                  โปรโมชั่นจำกัดเวลา: เหลือเวลา <span className="font-bold tabular-nums">{timeLeft}</span>
                </span>
              </div>
            )}
          </div>

          {/* Right: Book Cover */}
          <div className="flex justify-center items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-300/40 blur-3xl rounded-full scale-110 animate-pulse" />
              <div className="absolute inset-0 bg-sky-200/30 blur-2xl rounded-full scale-95" />
              <img
                src={product.imageUrl}
                alt={product.titleTh}
                className="relative w-64 md:w-80 lg:w-96 drop-shadow-2xl rounded-xl"
                style={{ filter: "drop-shadow(0 20px 40px rgba(59,130,246,0.3))" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-amber-400">{s.value}</div>
                <div className="text-blue-200 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Why This Book ────────────────────────────────────────── */}
      <section id="about" className="py-20 bg-white scroll-mt-32">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-amber-500 font-bold text-xs uppercase tracking-widest">พลังภายใน</span>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mt-3 mb-4">เหตุใดหนังสือเล่มนี้จึงมีความสำคัญ</h2>
            <p className="text-blue-700/70 max-w-2xl mx-auto leading-relaxed">{description}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {GENERIC_BENEFITS.map((b) => (
              <div
                key={b.title}
                className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-7 border border-blue-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{b.icon}</div>
                <h3 className="text-lg font-bold text-blue-900 mb-3">{b.title}</h3>
                <p className="text-blue-700/70 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <blockquote className="text-xl md:text-2xl italic text-blue-800/80 max-w-3xl mx-auto leading-relaxed">
              "หนังสือเล่มนี้ไม่ใช่เพียงการอ่าน — มันเป็นคำเชิญให้ตื่นตัวต่อพลังที่แท้จริงของคุณ คำสอนของ Neville Goddard มีศักยภาพเปลี่ยนแปลงทุกด้านของชีวิต"
            </blockquote>
            <p className="text-amber-500 font-semibold mt-4">— ผู้แสวงหาความรู้ทางจิตใจ</p>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 scroll-mt-32">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-amber-500 font-bold text-xs uppercase tracking-widest">เรื่องราวจริง</span>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mt-3 mb-3">การเปลี่ยนแปลงและบทวิจารณ์</h2>
            <p className="text-blue-700/70">
              {realReviews.length >= 3
                ? `บทวิจารณ์จากผู้อ่าน ${(reviewsQuery.data ?? []).length} คน`
                : "ค้นพบว่าผู้อ่านได้นำการสอนเหล่านี้ไปใช้อย่างไร"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={`${t.name}-${i}`}
                className="bg-white rounded-2xl p-7 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-blue-800/80 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="border-t border-blue-50 pt-4">
                  <div className="font-bold text-blue-900 text-sm">{t.name}</div>
                  <div className="text-blue-400 text-xs mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 bg-white scroll-mt-32">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <span className="text-amber-500 font-bold text-xs uppercase tracking-widest">การลงทุน</span>
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mt-3 mb-10">ราคาที่ง่ายและโปร่งใส</h2>

          <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-3xl p-10 border border-blue-200 shadow-2xl">
            <p className="text-blue-600 text-sm mb-3 font-medium">หนังสือสมบูรณ์ + วัสดุโบนัส</p>

            <div className="flex items-center justify-center gap-4 mb-2">
              <span className="text-6xl font-bold text-blue-900">฿{salePrice.toLocaleString()}</span>
              {originalPrice && (
                <div className="text-left">
                  <span className="line-through text-gray-400 text-xl block">฿{originalPrice.toLocaleString()}</span>
                  {discountPct > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                      ลด {discountPct}%
                    </span>
                  )}
                </div>
              )}
            </div>
            {originalPrice && (
              <p className="text-blue-600/70 text-sm mb-8">
                จากปกติ ฿{originalPrice.toLocaleString()} - โปรโมชั่นจำกัดเวลา
              </p>
            )}

            <ul className="text-left space-y-4 mb-8">
              {GENERIC_INCLUDES.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                  <span className="text-blue-800 text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={handleAddToCart}
              size="lg"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-6 text-lg rounded-xl shadow-lg shadow-blue-200 transition-all"
            >
              <ShoppingCart className="mr-2" size={20} />
              {added
                ? "✓ เพิ่มลงตะกร้าแล้ว!"
                : `ซื้อเลย - ฿${salePrice.toLocaleString()}${discountPct > 0 ? ` (ลด ${discountPct}%)` : ""}`}
            </Button>

            {discountPct > 0 && (
              <div className="mt-5 flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-4 py-2">
                <Clock size={14} />
                <span>
                  เหลือเวลา: <span className="font-bold tabular-nums">{timeLeft}</span>
                </span>
              </div>
            )}

            <p className="text-blue-500/60 text-xs mt-4">
              📞 LINE: @coachwanchai &nbsp;|&nbsp; 📱 โทร: 0994159587
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-400/10 blur-3xl rounded-full" />
        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
            พร้อมที่จะเปลี่ยนแปลงชีวิตของคุณหรือยัง?
          </h2>
          <p className="text-blue-200 mb-10 leading-relaxed text-lg">
            เข้าร่วมกับผู้อ่านนับพันคนที่ค้นพบพลังของจินตนาการและตัวตนอันศักดิ์สิทธิ์ การเดินทางของคุณเริ่มต้นที่นี่
          </p>
          <Button
            onClick={handleAddToCart}
            size="lg"
            className="bg-amber-400 hover:bg-amber-300 text-blue-900 font-bold px-12 py-6 text-lg rounded-xl shadow-2xl shadow-amber-900/30 transition-all"
          >
            <ShoppingCart className="mr-2" size={20} />
            อ้างสิทธิ์หนังสือของคุณวันนี้
          </Button>
          <div className="mt-6">
            <Link href="/">
              <button className="text-blue-300 hover:text-white text-sm flex items-center gap-1 mx-auto transition-colors">
                <ArrowLeft size={14} />
                กลับไปหน้าหลัก
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-blue-950 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-bold text-amber-400 mb-3">เกี่ยวกับหนังสือ</h4>
            <p className="text-blue-200 text-sm leading-relaxed">
              {product.titleTh}
              {product.titleEn ? ` (${product.titleEn})` : ""} โดย Neville Goddard
              ฉบับแปลไทยจากสำนักพิมพ์ไดมอนด์คลับ
            </p>
          </div>

          <div>
            <h4 className="font-bold text-amber-400 mb-3">ลิงก์ด่วน</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#about" className="text-blue-300 hover:text-white transition-colors">เกี่ยวกับ</a>
              </li>
              <li>
                <a href="#testimonials" className="text-blue-300 hover:text-white transition-colors">บทวิจารณ์</a>
              </li>
              <li>
                <a href="#pricing" className="text-blue-300 hover:text-white transition-colors">ซื้อเลย</a>
              </li>
              <li>
                <Link href="/">
                  <span className="text-blue-300 hover:text-white transition-colors cursor-pointer">กลับหน้าหลัก</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-amber-400 mb-3">ติดต่อ</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-amber-400" />
                LINE: @coachwanchai
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-amber-400" />
                โทร: 0994159587
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-10 pt-6 text-center text-blue-400 text-xs">
          © 2026 {product.titleTh} - สงวนลิขสิทธิ์ | การสอนของ Neville Goddard
        </div>
      </footer>
    </div>
  );
}
