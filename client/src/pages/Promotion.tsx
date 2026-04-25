import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useCart, type Book } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import {
  VOLUME_DISCOUNT_TIERS,
  STANDARD_SHIPPING_FEE,
  calcVolumeDiscount,
} from "@shared/const";
import {
  BookOpen,
  Check,
  Plus,
  ShoppingCart,
  Sparkles,
  Truck,
  Percent,
  Flame,
  Gift,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

interface PromoBook {
  id: number;
  titleTh: string;
  titleEn: string;
  price: number;
  image: string;
  description: string;
  detailPage?: string;
}

const FAQ = [
  {
    q: "ส่วนลดคำนวณยังไง?",
    a: "ลดจากราคารวมในตะกร้า เช่น ซื้อ 2 เล่มราคารวม ฿1,000 → ลด 30% เหลือ ฿700 (+ค่าส่ง 50) ซื้อ 3 เล่มราคารวม ฿1,500 → ลด 35% เหลือ ฿975 (ส่งฟรี)",
  },
  {
    q: "เลือกหนังสือเล่มไหนก็ได้ไหม?",
    a: "ได้ครับ ทุกเล่มในร้านเข้าโปรโมชั่นนี้หมด ผสมเล่มไหนก็ได้ — ขอแค่จำนวน 2 เล่มขึ้นไป",
  },
  {
    q: "เล่มซ้ำนับด้วยไหม?",
    a: "นับครับ เช่น ซื้อหนังสือเล่มเดียวกัน 3 เล่ม ก็เข้าโปรลด 35% + ส่งฟรีเหมือนกัน",
  },
  {
    q: "ส่งฟรีคิดยังไง?",
    a: "ส่งฟรีเฉพาะ 3 เล่มขึ้นไปเท่านั้น ส่ง EMS ทั่วประเทศ ไม่ต้องจ่ายค่าส่งเพิ่ม",
  },
  {
    q: "โปรนี้หมดอายุเมื่อไร?",
    a: "โปรหมุนทุก 24 ชั่วโมง — รีเซ็ตอัตโนมัติ ทันใจให้คุณตัดสินใจไม่พลาด!",
  },
];

export default function Promotion() {
  const { addToCart, openCart, cartItems } = useCart();
  const [, navigate] = useLocation();

  const { data: productsData, isLoading } = trpc.products.list.useQuery();
  const products = (productsData || []) as any[];

  // Map products from DB
  const allBooks: PromoBook[] = useMemo(
    () =>
      products.map((p) => ({
        id: p.id,
        titleTh: p.titleTh,
        titleEn: p.titleEn || "",
        price: parseFloat(String(p.price)),
        image: p.imageUrl || "",
        description: p.descriptionTh || p.description || "",
        detailPage: p.slug ? `/books/${p.slug}` : undefined,
      })),
    [products],
  );

  // Local selection state — bookId → quantity
  const [selection, setSelection] = useState<Record<number, number>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const totalSelectedQty = Object.values(selection).reduce((a, b) => a + b, 0);
  const selectedSubtotal = useMemo(() => {
    return allBooks.reduce((sum, b) => sum + b.price * (selection[b.id] || 0), 0);
  }, [allBooks, selection]);

  const calc = calcVolumeDiscount(selectedSubtotal, totalSelectedQty);

  const adjustQty = (bookId: number, delta: number) => {
    setSelection((prev) => {
      const cur = prev[bookId] || 0;
      const next = Math.max(0, cur + delta);
      const updated = { ...prev };
      if (next === 0) delete updated[bookId];
      else updated[bookId] = next;
      return updated;
    });
  };

  const handleAddSelectedToCart = () => {
    if (totalSelectedQty === 0) {
      toast.error("กรุณาเลือกหนังสือก่อนครับ");
      return;
    }

    // Add each selected book to cart with the chosen quantity
    Object.entries(selection).forEach(([idStr, qty]) => {
      const id = Number(idStr);
      const book = allBooks.find((b) => b.id === id);
      if (!book) return;
      // Convert PromoBook → Book shape expected by cart
      const cartBook: Book = {
        id: book.id,
        titleTh: book.titleTh,
        titleEn: book.titleEn,
        price: book.price,
        image: book.image,
        description: book.description,
        benefits: [],
        rating: 4.9,
        sold: 0,
        detailPage: book.detailPage,
      };
      // addToCart adds 1 each call → loop qty times
      for (let i = 0; i < qty; i++) {
        addToCart(cartBook);
      }
    });

    toast.success(`เพิ่ม ${totalSelectedQty} เล่มลงตะกร้าแล้ว!`, {
      description: calc.tier ? `ส่วนลด ${calc.discountPercent}% — ฿${calc.total.toLocaleString()}` : undefined,
    });
    // Navigate to home + open checkout
    navigate("/?checkout=1");
  };

  // Cart total quantity for navbar badge
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #020617 0%, #0a0f1e 25%, #0d1117 50%, #0a0a1a 75%, #020617 100%)",
      }}
    >
      <Navbar cartCount={cartCount} onCartClick={openCart} />

      {/* HERO */}
      <section className="relative px-4 sm:px-6 lg:px-12 pt-12 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-red-500/5 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5">
            <Flame size={14} />
            <span>โปรโมชั่นพิเศษ — มาแรงสุด!</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            ซื้อ 2 เล่ม{" "}
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              ลด 30%
            </span>
            <br className="hidden sm:block" />{" "}
            ซื้อ 3 เล่มขึ้นไป{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              ลด 35% + ส่งฟรี!
            </span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            เปลี่ยนชีวิตด้วยหนังสือ Neville Goddard ฉบับแปลไทย —
            ผสมเล่มไหนก็ได้ ลดยิ่งซื้อมากยิ่งคุ้ม
          </p>

          {/* 3-Tier showcase cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {/* Tier 1 */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 backdrop-blur-sm">
              <div className="text-3xl mb-2">📖</div>
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                1 เล่ม
              </div>
              <div className="text-white text-lg font-bold mb-1">ราคาเต็ม</div>
              <div className="text-gray-500 text-xs">
                + ค่าส่ง ฿{STANDARD_SHIPPING_FEE}
              </div>
            </div>

            {/* Tier 2 */}
            <div className="bg-amber-400/10 border-2 border-amber-400/40 rounded-xl p-5 backdrop-blur-sm relative shadow-lg shadow-amber-500/10">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                แนะนำ
              </div>
              <div className="text-3xl mb-2">📚</div>
              <div className="text-amber-400 text-xs uppercase tracking-wider mb-1 font-bold">
                2 เล่ม
              </div>
              <div className="text-white text-lg font-bold mb-1">ลด 30%</div>
              <div className="text-gray-400 text-xs">
                + ค่าส่ง ฿{STANDARD_SHIPPING_FEE}
              </div>
            </div>

            {/* Tier 3 */}
            <div className="bg-gradient-to-br from-yellow-400/15 to-orange-500/15 border-2 border-yellow-400/50 rounded-xl p-5 backdrop-blur-sm relative shadow-lg shadow-yellow-500/20">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                คุ้มสุด
              </div>
              <div className="text-3xl mb-2">🎁</div>
              <div className="text-yellow-300 text-xs uppercase tracking-wider mb-1 font-bold">
                3 เล่มขึ้นไป
              </div>
              <div className="text-white text-lg font-bold mb-1">ลด 35%</div>
              <div className="text-green-400 text-xs font-bold flex items-center justify-center gap-1">
                <Truck size={12} />
                ส่งฟรี!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOOK PICKER */}
      <section className="px-4 sm:px-6 lg:px-12 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-amber-400" size={22} />
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              เลือกหนังสือของคุณ
            </h2>
          </div>

          {isLoading ? (
            <div className="text-center py-16 text-gray-400">
              กำลังโหลดหนังสือ...
            </div>
          ) : allBooks.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              ยังไม่มีหนังสือในระบบ
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allBooks.map((book) => {
                const qty = selection[book.id] || 0;
                const isSelected = qty > 0;
                return (
                  <div
                    key={book.id}
                    className={`relative rounded-xl border transition-all overflow-hidden ${
                      isSelected
                        ? "border-amber-400/60 bg-amber-400/5 shadow-lg shadow-amber-500/10"
                        : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600"
                    }`}
                  >
                    {/* Cover */}
                    <Link href={book.detailPage || "#"}>
                      <div className="aspect-[3/4] bg-slate-900 overflow-hidden">
                        {book.image ? (
                          <img
                            src={book.image}
                            alt={book.titleTh}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <BookOpen size={32} />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="p-3 space-y-2">
                      <h3 className="text-white text-sm font-semibold line-clamp-2 min-h-[2.5rem]">
                        {book.titleTh}
                      </h3>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-amber-400 font-bold text-base">
                          ฿{book.price.toLocaleString()}
                        </span>
                      </div>

                      {/* Add / qty controls */}
                      {qty === 0 ? (
                        <button
                          onClick={() => adjustQty(book.id, 1)}
                          className="w-full flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-amber-400 hover:text-slate-900 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                        >
                          <Plus size={14} />
                          เพิ่มเข้าโปร
                        </button>
                      ) : (
                        <div className="flex items-center justify-between bg-amber-400/10 border border-amber-400/30 rounded-lg overflow-hidden">
                          <button
                            onClick={() => adjustQty(book.id, -1)}
                            className="px-3 py-1.5 text-amber-400 hover:bg-amber-400/20 transition-colors font-bold text-lg"
                          >
                            −
                          </button>
                          <span className="text-amber-400 font-bold text-sm">
                            {qty} เล่ม
                          </span>
                          <button
                            onClick={() => adjustQty(book.id, 1)}
                            className="px-3 py-1.5 text-amber-400 hover:bg-amber-400/20 transition-colors font-bold text-lg"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Checkmark badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shadow-lg">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 lg:px-12 py-10 pb-32">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8">
            คำถามที่พบบ่อย
          </h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/60 transition-colors"
                  >
                    <span className="text-white font-semibold text-sm sm:text-base">
                      {item.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="text-amber-400 flex-shrink-0 ml-3" size={18} />
                    ) : (
                      <ChevronDown className="text-gray-400 flex-shrink-0 ml-3" size={18} />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-gray-300 text-sm leading-relaxed border-t border-slate-700/50 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STICKY BOTTOM BAR — only shows when something selected */}
      {totalSelectedQty > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-amber-400/30 shadow-2xl shadow-amber-400/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            {/* Summary */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-white">
                <ShoppingCart className="text-amber-400" size={18} />
                <span className="font-bold">{totalSelectedQty} เล่ม</span>
              </div>
              {calc.tier && (
                <div className="flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/40 text-amber-400 px-2.5 py-1 rounded-full text-xs font-bold">
                  <Percent size={11} />
                  ลด {calc.discountPercent}%
                  {calc.freeShipping && (
                    <>
                      <span className="text-amber-400/50">•</span>
                      <Truck size={11} />
                      ส่งฟรี
                    </>
                  )}
                </div>
              )}
              <div className="text-sm">
                {calc.discountAmount > 0 && (
                  <span className="text-gray-500 line-through mr-2">
                    ฿{selectedSubtotal.toLocaleString()}
                  </span>
                )}
                <span className="text-amber-400 font-bold text-lg">
                  ฿{calc.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* CTA */}
            <Button
              onClick={handleAddSelectedToCart}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-900 font-bold px-5 sm:px-8 py-2.5 shadow-lg shadow-amber-500/20"
            >
              <Gift size={16} className="mr-1.5" />
              <span className="hidden sm:inline">เพิ่มลงตะกร้า + ชำระเงิน</span>
              <span className="sm:hidden">เพิ่ม + ชำระเงิน</span>
            </Button>
          </div>

          {/* Tier nudge */}
          {!calc.tier && totalSelectedQty === 1 && (
            <div className="bg-amber-400/10 border-t border-amber-400/20 text-amber-300 text-xs text-center py-1.5 px-4">
              เพิ่มอีก 1 เล่ม → ลด 30% ทันที!
            </div>
          )}
          {calc.tier === "Combo 30%" && (
            <div className="bg-yellow-400/10 border-t border-yellow-400/20 text-yellow-300 text-xs text-center py-1.5 px-4">
              เพิ่มอีก 1 เล่ม → ลด 35% + ส่งฟรี!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
