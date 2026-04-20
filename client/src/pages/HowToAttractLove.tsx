import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Star, ShoppingCart, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Navbar } from "@/components/Navbar";
import { toast } from "sonner";

const BOOK = {
  id: 18,
  titleTh: "วิธีดึงดูดความรัก",
  titleEn: "How to Attract Love",
  price: 450,
  originalPrice: 550,
  image: "/images/books/htal-cover-3d.webp",
  description: "สอนดึงดูดคนรักด้วยพลังจิตใต้สำนึกตามคำสอนของ Neville Goddard เทคนิค SATS, จินตนาการก่อนนอน",
  benefits: ["💕 หยุดรอ เริ่มดึงดูด", "🌍 หลักการที่คนทั่วโลกพิสูจน์", "⚡ ทำได้ทันที", "📖 ภาษาไทยอ่านเข้าใจง่าย"],
  rating: 4.9,
  sold: 87,
};

const PROMO_IMG = "/images/books/htal-promo.png";

const painPoints = [
  "เหนื่อยกับการรักคนที่ไม่รักตอบ",
  "อยากมีคนรัก แต่ไม่รู้จะเริ่มยังไง",
  "เคยลอง \"ปล่อยวาง\" แต่ก็ยังรู้สึกว่างเปล่า",
  "กลัวว่าจะไม่มีใครรักจริงๆ สักคน",
];

const benefits = [
  {
    icon: "💕",
    title: "หยุดรอ… เริ่มดึงดูด",
    desc: "คุณไม่จำเป็นต้อง \"รอ\" ให้ความรักเดินเข้ามา เมื่อคุณรู้วิธี \"สร้าง\" มันขึ้นมาจากภายใน ด้วยเทคนิคจินตนาการที่ทรงพลังที่สุด",
  },
  {
    icon: "🌍",
    title: "หลักการที่คนทั่วโลกพิสูจน์แล้ว",
    desc: "ไม่ใช่แค่ทฤษฎี — Neville Goddard สอนสิ่งที่คนนับล้านลงมือทำแล้วเห็นผลจริง ตั้งแต่ปี 1950 จนถึงวันนี้",
  },
  {
    icon: "⚡",
    title: "ทำได้ทันที คืนนี้เลย",
    desc: "ไม่ต้องเตรียมอะไร ไม่ต้องนั่งสมาธิเป็นชั่วโมง แค่ทำตามเทคนิคง่ายๆ ก่อนนอน 10 นาที ก็เริ่มเปลี่ยนความจริงได้",
  },
  {
    icon: "📖",
    title: "ภาษาไทยที่อ่านแล้วเข้าใจทันที",
    desc: "ไม่ใช่แค่แปล แต่เรียบเรียงใหม่ทั้งหมดให้คนไทยอ่านแล้ว \"เห็นภาพ\" ทำตามได้เลย โดย วันชัย ประชาเรืองวิทย์",
  },
];

const testimonials = [
  { text: "อ่านจบคืนแรก ลองทำตามเทคนิค SATS ผ่านไป 11 วัน แฟนเก่าทักมาเอง ทั้งที่ไม่คุยกัน 2 ปี!", stars: 5 },
  { text: "ไม่เคยเชื่อเรื่องพลังจิตมาก่อน แต่พอลองทำจริง 3 สัปดาห์ ผมเจอคนที่ใช่ในที่ที่ไม่คาดคิดเลย", stars: 5 },
  { text: "หนังสือเล่มเดียวที่เปลี่ยนวิธีคิดเรื่องความรักของฉันไปตลอดกาล อ่านง่ายมาก ทำตามได้เลย", stars: 5 },
];

const insideBook = [
  "เทคนิค SATS ที่ทำก่อนนอนได้เลย",
  "วิธีจินตนาการแบบ Neville Goddard",
  "แบบฝึกหัดพร้อมตัวอย่างจริง",
  "เข้าใจง่าย แม้ไม่เคยอ่านเรื่อง LOA",
];

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState("23:59:59");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const diff = Math.max(0, endOfDay.getTime() - now.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <span className="font-bold text-amber-400">{timeLeft}</span>;
}

export default function HowToAttractLove() {
  const [added, setAdded] = useState(false);
  const { addToCart, openCart, cartItems } = useCart();
  const [, navigate] = useLocation();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = () => {
    addToCart(BOOK);
    setAdded(true);
    toast.success(`เพิ่ม "${BOOK.titleTh}" ลงตะกร้าแล้ว!`, {
      description: "กดไอคอนตะกร้าเพื่อดูสินค้าและชำระเงิน",
      action: {
        label: "ดูตะกร้า",
        onClick: () => { navigate("/?checkout=1"); },
      },
    });
    setTimeout(() => setAdded(false), 2000);
  };

  const discountPct = Math.round((1 - BOOK.price / BOOK.originalPrice) * 100);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Navbar */}
      <Navbar cartCount={cartCount} onCartClick={() => { navigate("/?checkout=1"); }} />
      
      {/* Navigation Menu */}
      <div className="bg-black border-b border-amber-400/30 sticky top-16 z-30">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex gap-8">
            <a href="#about" className="text-amber-400 hover:text-amber-300 font-semibold text-sm transition-colors">เกี่ยวกับ</a>
            <a href="#testimonials" className="text-amber-400 hover:text-amber-300 font-semibold text-sm transition-colors">บทวิจารณ์</a>
            <a href="#pricing" className="text-amber-400 hover:text-amber-300 font-semibold text-sm transition-colors">ซื้อเลย</a>
          </div>
          <button onClick={handleAddToCart} className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-2 rounded-lg text-sm transition-colors">
            ซื้อเลย - ฿450 (ลด 18%)
          </button>
        </div>
      </div>
      
      {/* Back button */}
      <div className="pt-16">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <Link href="/">
            <button className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold transition-colors text-sm">
              <ArrowLeft size={16} />
              ← กลับไปหน้าหลัก
            </button>
          </Link>
        </div>
      </div>

      {/* Promo Bar */}
      <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 py-3 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-4 text-sm md:text-base">
          <span className="font-bold">⏰ โปรโมชั่นจำกัดเวลา 24 ชม. ลด 18% เหลือ ฿450 จาก ฿550</span>
          <div className="flex items-center gap-2">
            <Clock size={18} />
            <CountdownTimer />
          </div>
        </div>
      </div>

      {/* Particle overlay via CSS */}
      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-120px) translateX(20px); opacity: 0; }
        }
        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #f59e0b;
          animation: float-particle linear infinite;
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-black">
        {/* Radial glow bg */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(180,83,9,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(245,158,11,0.1),transparent_50%)]" />

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${8 + i * 8}%`,
              bottom: `${10 + (i % 4) * 15}%`,
              animationDuration: `${3 + (i % 4)}s`,
              animationDelay: `${i * 0.4}s`,
              width: i % 3 === 0 ? "4px" : "2px",
              height: i % 3 === 0 ? "4px" : "2px",
            }}
          />
        ))}

        <div className="relative z-10 container max-w-6xl mx-auto px-4 py-32 grid md:grid-cols-2 gap-12 items-center">
          {/* Book Cover */}
          <div className="flex justify-center order-2 md:order-1">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full scale-110" />
              <img
                src={BOOK.image}
                alt={BOOK.titleTh}
                className="relative w-64 md:w-80 drop-shadow-2xl"
                style={{ filter: "drop-shadow(0 0 40px rgba(245,158,11,0.4))" }}
              />
            </div>
          </div>

          {/* Text */}
          <div className="order-1 md:order-2 text-center md:text-left">
            <span className="inline-block text-amber-400 text-sm font-semibold tracking-widest uppercase mb-4">
              หนังสือที่จะเปลี่ยนชีวิตรักของคุณ
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
              <span className="text-white">ถ้าคุณเลือก</span>
              <br />
              <span className="text-amber-400">คนรักได้</span>
              <br />
              <span className="text-white text-3xl md:text-4xl">คุณจะเลือกใคร?</span>
            </h1>
            <p className="text-gray-300 text-lg mb-2 leading-relaxed">
              หนังสือเล่มนี้จะสอนให้คุณ{" "}
              <span className="text-amber-400 font-semibold">"ดึงดูด"</span>{" "}
              คนที่ใช่เข้ามาในชีวิต — ไม่ใช่ด้วยโชค แต่ด้วย{" "}
              <span className="text-amber-400 font-semibold">พลังแห่งจิตใต้สำนึก</span>
            </p>
            <p className="text-gray-500 text-sm mb-6">
              ตามคำสอนของ <span className="text-amber-400">Neville Goddard</span> ปรมาจารย์ด้านจินตนาการสร้างความจริง
            </p>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6 justify-center md:justify-start">
              <div>
                <span className="line-through text-gray-500 text-sm">ราคาปกติ {BOOK.originalPrice}.-</span>
                <span className="text-red-400 text-sm ml-2">ลด {discountPct}%</span>
              </div>
            </div>
            <div className="text-5xl font-bold text-amber-400 mb-6">{BOOK.price}.-</div>

            <p className="text-gray-400 text-sm mb-4">เขียนโดย วันชัย ประชาเรืองวิทย์</p>

            <Button
              onClick={handleAddToCart}
              className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-black font-bold px-10 py-6 text-lg rounded-xl shadow-xl shadow-amber-900/50 transition-all"
            >
              <ShoppingCart className="mr-2" size={20} />
              {added ? "✓ เพิ่มลงตะกร้าแล้ว!" : "สั่งซื้อเลย — รับหนังสือใน 2-3 วัน"}
            </Button>
            <p className="text-gray-500 text-xs mt-3">จัดส่งฟรีทั่วประเทศ | ชำระเงินปลอดภัย</p>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-16 bg-zinc-950">
        <div className="container max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-10">
            คุณเคยรู้สึกแบบนี้ไหม?
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {painPoints.map((p) => (
              <div key={p} className="flex items-start gap-3 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                <span className="text-2xl">😔</span>
                <span className="text-gray-300 text-sm leading-relaxed">{p}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-amber-400 font-semibold mt-8 text-lg">
            ถ้าคุณพยักหน้ากับข้อใดข้อหนึ่ง…<br />
            <span className="text-white font-normal text-base">หนังสือเล่มนี้เขียนมาเพื่อคุณ</span>
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-black">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              สิ่งที่คุณจะได้จากหนังสือเล่มนี้
            </h2>
            <p className="text-gray-400 mt-3">ไม่ใช่แค่ "อ่านแล้วรู้สึกดี" แต่คือ <span className="text-amber-400">คู่มือลงมือทำ</span> ที่จะเปลี่ยนเรื่องรักของคุณ</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-amber-400/40 transition-colors">
                <div className="text-3xl mb-3">{b.icon}</div>
                <h3 className="text-amber-400 font-bold text-lg mb-2">{b.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-zinc-950">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">คนที่ลองแล้ว… พูดแบบนี้</h2>
            <p className="text-gray-500 mt-2 text-sm">เรื่องจริงจากผู้อ่านที่ลงมือทำตามเทคนิคในหนังสือ</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                <div className="flex gap-1 mb-3">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's inside + Promo image */}
      <section className="py-20 bg-black">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                ความรักที่คุณต้องการ<br />
                <span className="text-amber-400">อยู่ห่างแค่ปลายนิ้ว</span>
              </h2>
              <p className="text-gray-400 mb-6 text-sm">คนส่วนใหญ่อ่านจบภายใน 1 คืน และเริ่มฝึกเทคนิคได้ ทันที</p>
              <ul className="space-y-3">
                {insideBook.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <img
                src={PROMO_IMG}
                alt="วิธีดึงดูดความรัก โปรโมชั่น"
                className="w-full max-w-sm rounded-2xl shadow-2xl"
                style={{ filter: "drop-shadow(0 0 30px rgba(245,158,11,0.3))" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(180,83,9,0.3),transparent_60%)]" />
        <div className="relative z-10 container max-w-2xl mx-auto px-4 text-center">
          {/* Price */}
          <div className="mb-6">
            <span className="line-through text-gray-500 text-lg">{BOOK.originalPrice}.-</span>
            <span className="text-red-400 text-sm ml-2">ลด {discountPct}%</span>
            <div className="text-6xl font-bold text-amber-400 mt-1">{BOOK.price}.-</div>
          </div>

          <Button
            onClick={handleAddToCart}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-6 text-xl rounded-xl shadow-2xl shadow-amber-900/50 mb-4"
          >
            <ShoppingCart className="mr-2" size={22} />
            {added ? "✓ เพิ่มลงตะกร้าแล้ว!" : "สั่งซื้อเลย — ส่งฟรี!"}
          </Button>

          <a
            href="https://line.me/R/ti/p/@coachwanchai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 text-sm underline block mb-6"
          >
            สอบถามผ่าน LINE @coachwanchai
          </a>

          <p className="text-gray-500 text-xs">
            จัดส่งฟรีทั่วประเทศ | ได้รับภายใน 2-3 วัน | หนังสือเล่มจริง พิมพ์คุณภาพสูง | ชำระเงินปลอดภัยผ่าน Stripe
          </p>

          <div className="mt-8">
            <Link href="/">
              <button className="text-gray-500 hover:text-amber-400 text-sm flex items-center gap-1 mx-auto transition-colors">
                <ArrowLeft size={14} />
                กลับไปหน้าหลัก
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
