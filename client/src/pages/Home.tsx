import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { TierNudgePopup } from "@/components/TierNudgePopup";
import BundleUpsellModal, { BUNDLE_BOOK_ID } from "@/components/BundleUpsellModal";
import ReviewShareButtons from "@/components/ReviewShareButtons";
import { Navbar } from "@/components/Navbar";
import { Star, X, Trash2, Plus, Minus, ShoppingCart, Upload, CheckCircle2, AlertCircle, TrendingUp, Truck, Percent, Copy, Check, MessageSquare, BookOpen, Sparkles, Award } from "lucide-react";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { calcVolumeDiscount, VOLUME_DISCOUNT_TIERS, STANDARD_SHIPPING_FEE, COMMUNITY_PATH } from "@shared/const";
import { useCart } from "@/contexts/CartContext";

interface Book {
  id: number;
  titleTh: string;
  titleEn: string;
  price: number;
  image: string;
  description: string;
  benefits: string[];
  rating: number;
  sold: number;
  isNew?: boolean;
  badge?: "bestseller" | "recommended" | "new" | "hot";
  detailPage?: string;
}

interface CartItem {
  book: Book;
  quantity: number;
}

const testimonials = [
  {
    text: "หนังสือของ Neville Goddard เปลี่ยนชีวิตฉันไปเลย หลังจากอ่านแล้ว ฉันเข้าใจว่าจินตนาการของฉันคือพระเจ้า และทุกสิ่งที่ฉันจินตนาการได้ สามารถเป็นจริงได้ ขอบคุณที่นำหนังสือดีๆ มาให้ผู้คนไทย",
    author: "สมชาย ศรีสุข",
    rating: 5,
  },
  {
    text: "ฉันซื้อหลายเล่มแล้ว คำสอนของ Neville นั้นลึกซึ้งและใช้ได้จริง ฉันเห็นการเปลี่ยนแปลงในชีวิตของฉันอย่างชัดเจน ฉบับแปลไทยนี้อ่านเข้าใจง่ายมาก",
    author: "นัฐพร วงศ์สิทธิ",
    rating: 5,
  },
  {
    text: "ขอบคุณที่นำเสนอหนังสือที่มีคุณค่าสูง ฉันได้ใช้หลักการของ Neville ในการสร้างสรรค์ชีวิตของฉัน และผลลัพธ์ที่ได้มากกว่าที่ฉันคาดหวัง",
    author: "ปรีชา ชัยวัฒน์",
    rating: 5,
  },
];

const quotes = [
  {
    text: "จินตนาการของคุณคือพระเจ้า และทุกสิ่งที่คุณจินตนาการได้ สามารถเป็นจริงได้",
    author: "Neville Goddard",
  },
  {
    text: "ความรู้สึกคือความลับ ความรู้สึกที่แท้จริงของคุณคือสิ่งที่สร้างสรรค์โลกของคุณ",
    author: "Neville Goddard",
  },
  {
    text: "สิ่งที่คุณเชื่อว่าเป็นจริงแล้ว จะกลายเป็นจริงสำหรับคุณ",
    author: "Neville Goddard",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}
        />
      ))}
    </div>
  );
}

function BookModal({ book, isOpen, onClose, onAddToCart }: { book: Book | null; isOpen: boolean; onClose: () => void; onAddToCart: (book: Book) => void }) {
  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-400/30 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-amber-400/20 bg-slate-800/95">
          <h2 className="text-2xl font-bold text-amber-400">{book.titleTh}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image and Price */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex justify-center">
              <img
                src={book.image}
                alt={book.titleTh}
                className="w-full max-w-xs rounded-lg shadow-xl"
              />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-amber-400 text-lg italic mb-2">{book.titleEn}</p>
                <p className="text-gray-300 mb-4">{book.description}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <StarRating rating={book.rating} />
                <span className="text-amber-400 font-bold">{book.rating}/5</span>
                <span className="text-gray-400">({book.sold} ขายได้)</span>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-r from-amber-400/10 to-slate-800/50 border border-amber-400/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">ราคา</p>
                <p className="text-4xl font-bold text-amber-400">฿{book.price}</p>
              </div>

              {/* CTA Button */}
              <Button 
                onClick={() => {
                  onAddToCart(book);
                  onClose();
                }}
                className="w-full bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold py-6 text-lg shadow-lg"
              >
                🛒 เพิ่มลงตะกร้า
              </Button>
            </div>
          </div>

          {/* Benefits */}
          <div className="border-t border-amber-400/20 pt-6">
            <h3 className="text-xl font-bold text-amber-400 mb-4">📚 ประโยชน์ที่จะได้รับ</h3>
            <div className="space-y-3">
              {book.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-800/50 p-3 rounded-lg border border-amber-400/10">
                  <span className="text-amber-400 flex-shrink-0">✓</span>
                  <p className="text-gray-300">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Full Description */}
          <div className="border-t border-amber-400/20 pt-6">
            <h3 className="text-xl font-bold text-amber-400 mb-4">📖 เกี่ยวกับหนังสือ</h3>
            <p className="text-gray-300 leading-relaxed">
              {book.description}
            </p>
            <p className="text-gray-400 text-sm mt-4">
              ⭐ คะแนนร้าน 4.9/5 จาก 13.8k รีวิว | ขายได้กว่า 2,000+ ชิ้น
            </p>
          </div>

          {/* Why Buy */}
          <div className="border-t border-amber-400/20 pt-6">
            <h3 className="text-xl font-bold text-amber-400 mb-4">💡 ทำไมต้องซื้อหนังสือเล่มนี้</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-400">→</span>
                <span>ฉบับแปลไทยที่อ่านเข้าใจง่าย</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">→</span>
                <span>คำสอนจากปรมาจารย์แห่งกฎแรงดึงดูด</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">→</span>
                <span>ได้ผลจริงและเปลี่ยนชีวิตได้</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">→</span>
                <span>ราคาถูกและคุ้มค่า</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-amber-400/20 bg-slate-800/95 p-6">
          <Button 
            onClick={() => {
              onAddToCart(book);
              onClose();
            }}
            className="w-full bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold py-6 text-lg shadow-lg"
          >
            🛒 เพิ่มลงตะกร้า
          </Button>
        </div>
      </div>
    </div>
  );
}

/// Bank account info constants
const BANK_INFO = {
  bankName: "ธนาคารกรุงไทย (KTB)",
  accountNumber: "017-042-7188",
  accountName: "บริษัท ไดมอนด์คลับ จำกัด",
};

function CheckoutModal({ isOpen, onClose, cartItems, onConfirmOrder }: { 
  isOpen: boolean; 
  onClose: () => void; 
  cartItems: CartItem[];
  onConfirmOrder: (formData: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "bank-transfer",
  });
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createOrderMutation = trpc.orders.create.useMutation();
  const createCheckoutSession = trpc.stripe.createCheckoutSession.useMutation();

  const subtotal = cartItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const cartQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const volumeCalc = calcVolumeDiscount(subtotal, cartQuantity);
  const { tier, discountPercent, discountAmount, shippingFee, total } = volumeCalc;

  const handleFileSelect = useCallback((file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast.error("รองรับเฉพาะ JPG, PNG, WEBP, PDF เท่านั้น");
      return;
    }
    if (file.size > 16 * 1024 * 1024) {
      toast.error("ไฟล์ต้องมีขนาดไม่เกิน 16 MB");
      return;
    }
    setSlipFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setSlipPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setSlipPreview(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(BANK_INFO.accountNumber);
      setCopiedAccount(true);
      toast.success("คัดลอกเลขบัญชีแล้ว!");
      setTimeout(() => setCopiedAccount(false), 2000);
    } catch {
      toast.error("ไม่สามารถคัดลอกได้");
    }
  };

  const handleCopyAmount = async (amount: number) => {
    try {
      await navigator.clipboard.writeText(amount.toString());
      setCopiedAmount(true);
      toast.success("คัดลอกยอดเงินแล้ว!");
      setTimeout(() => setCopiedAmount(false), 2000);
    } catch {
      toast.error("ไม่สามารถคัดลอกได้");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.address) return;

    const isCreditCard = formData.paymentMethod === "credit-card";

    if (!isCreditCard && !slipFile) {
      toast.error("กรุณาอัปโหลดหลักฐานการโอนเงินก่อนยืนยัน");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createOrderMutation.mutateAsync({
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        paymentMethod: formData.paymentMethod as any,
        items: cartItems.map(item => ({
          bookId: item.book.id,
          bookTitleTh: item.book.titleTh,
          bookTitleEn: item.book.titleEn,
          bookImage: item.book.image,
          unitPrice: item.book.price,
          quantity: item.quantity,
        })),
        discountAmount,
      });

      if (isCreditCard) {
        const sessionResult = await createCheckoutSession.mutateAsync({
          orderId: result.orderId,
          orderNumber: result.orderNumber,
          items: cartItems.map(item => ({
            bookTitleTh: item.book.titleTh,
            bookImage: item.book.image,
            unitPrice: item.book.price,
            quantity: item.quantity,
          })),
          totalAmount: total,
          customerEmail: formData.email,
          customerName: formData.name,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
        });
        if (sessionResult?.url) {
          window.open(sessionResult.url, "_blank");
        }
        onConfirmOrder({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          total,
        });
      } else {
        onConfirmOrder({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          total,
        });
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-400/30 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-amber-400/20 bg-slate-800/95">
          <h2 className="text-2xl font-bold text-amber-400">💳 ชำระเงิน</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-slate-800/50 border border-amber-400/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-amber-400 font-bold">📦 สรุปการสั่งซื้อ</h3>
                {tier && (
                  <span className="bg-amber-400/20 text-amber-400 text-xs font-bold px-2 py-1 rounded-full border border-amber-400/40">
                    {tier}
                  </span>
                )}
              </div>
              <div className="space-y-2 mb-3">
                {cartItems.map((item) => (
                  <div key={item.book.id} className="flex justify-between text-gray-300 text-sm">
                    <span className="flex-1 mr-2">{item.book.titleTh} x{item.quantity}</span>
                    <span>฿{item.book.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 border-t border-amber-400/20 pt-3">
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>ราคารวม:</span>
                  <span>฿{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-400 text-sm">
                    <span>ส่วนลด Volume {discountPercent}%:</span>
                    <span className="font-bold">-฿{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">ค่าจัดส่ง:</span>
                  <span className={shippingFee === 0 ? "text-green-400 font-bold" : "text-gray-300"}>
                    {shippingFee === 0 ? "ฟรี 🚚" : `฿${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-amber-400/20">
                  <span className="text-amber-400 font-bold text-lg">ยอดที่ต้องชำระ:</span>
                  <span className="text-amber-400 font-bold text-2xl">฿{total}</span>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-amber-400 font-bold">👤 ข้อมูลส่วนตัว</h3>
              <div>
                <label className="block text-gray-300 text-sm mb-2">ชื่อ-นามสกุล *</label>
                <input type="text" required value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-700 border border-amber-400/20 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                  placeholder="เช่น สมชาย ศรีสุข" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">อีเมล *</label>
                <input type="email" required value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-700 border border-amber-400/20 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                  placeholder="example@email.com" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">เบอร์โทรศัพท์ *</label>
                <input type="tel" required value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-700 border border-amber-400/20 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                  placeholder="0812345678" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">ที่อยู่จัดส่ง *</label>
                <textarea required value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-slate-700 border border-amber-400/20 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 h-24 resize-none"
                  placeholder="เลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์" />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <h3 className="text-amber-400 font-bold">💳 วิธีการชำระเงิน</h3>
              <div className="space-y-2">
                <div
                  onClick={() => setFormData(f => ({ ...f, paymentMethod: "bank-transfer" }))}
                  className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-all ${
                    formData.paymentMethod === "bank-transfer"
                      ? "border-amber-400 bg-amber-400/10"
                      : "border-slate-600 hover:border-amber-400/50"
                  }`}>
                  <input type="radio" name="payment" value="bank-transfer"
                    checked={formData.paymentMethod === "bank-transfer"}
                    onChange={() => setFormData(f => ({ ...f, paymentMethod: "bank-transfer" }))}
                    className="w-4 h-4 accent-amber-400" />
                  <span className="text-gray-300">🏦 โอนเงินผ่านธนาคารกรุงไทย (KTB)</span>
                </div>
                <div
                  onClick={() => setFormData(f => ({ ...f, paymentMethod: "credit-card" }))}
                  className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-all ${
                    formData.paymentMethod === "credit-card"
                      ? "border-amber-400 bg-amber-400/10"
                      : "border-slate-600 hover:border-amber-400/50"
                  }`}>
                  <input type="radio" name="payment" value="credit-card"
                    checked={formData.paymentMethod === "credit-card"}
                    onChange={() => setFormData(f => ({ ...f, paymentMethod: "credit-card" }))}
                    className="w-4 h-4 accent-amber-400" />
                  <span className="text-gray-300">💳 บัตรเครดิต / เดบิต (Stripe)</span>
                </div>
              </div>
            </div>

            {/* Payment Info — Bank Transfer */}
            {formData.paymentMethod === "bank-transfer" && (
              <div className="bg-gradient-to-br from-green-950/40 to-slate-800/60 border border-green-500/30 rounded-lg p-5 space-y-3">
                <h3 className="text-green-400 font-bold flex items-center gap-2">🏦 ข้อมูลบัญชีธนาคาร</h3>
                <div className="bg-slate-900/60 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ธนาคาร:</span>
                    <span className="text-white font-semibold">{BANK_INFO.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">เลขบัญชี:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold text-base tracking-wider">{BANK_INFO.accountNumber}</span>
                      <button
                        type="button"
                        onClick={handleCopyAccount}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 hover:text-amber-300 transition-all text-xs border border-amber-400/30"
                        title="คัดลอกเลขบัญชี"
                      >
                        {copiedAccount ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                        {copiedAccount ? "คัดลอกแล้ว" : "คัดลอก"}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ชื่อบัญชี:</span>
                    <span className="text-white font-semibold">{BANK_INFO.accountName}</span>
                  </div>
                  <div className="border-t border-amber-400/20 pt-2 flex justify-between items-center">
                    <span className="text-gray-400">ยอดโอน:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold text-xl">฿{total.toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyAmount(total)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 hover:text-amber-300 transition-all text-xs border border-amber-400/30"
                        title="คัดลอกยอดเงิน"
                      >
                        {copiedAmount ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                        {copiedAmount ? "คัดลอกแล้ว" : "คัดลอก"}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-xs">* กรุณาโอนเงินให้ตรงกับยอดที่แสดง และอัปโหลดสลิปด้านล่าง</p>
              </div>
            )}

            {/* Credit Card Info */}
            {formData.paymentMethod === "credit-card" && (
              <div className="bg-gradient-to-br from-blue-950/40 to-slate-800/60 border border-blue-500/30 rounded-lg p-5 space-y-3">
                <h3 className="text-blue-400 font-bold flex items-center gap-2">💳 ชำระผ่าน Stripe</h3>
                <p className="text-gray-300 text-sm">เมื่อกดยืนยัน ระบบจะพาคุณไปยังหน้าชำระเงิน Stripe ใน tab ใหม่ รองรับบัตรเครดิต / เดบิตทุกสถาบัน</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>🔒 ปลอดภัย เข้ารหัส SSL</span>
                  <span>•</span>
                  <span>Visa / Mastercard / JCB</span>
                </div>
              </div>
            )}

            {/* Slip Upload */}
            {formData.paymentMethod === "bank-transfer" && (
              <div className="space-y-3">
                <h3 className="text-amber-400 font-bold flex items-center gap-2">
                  <Upload size={18} /> อัปโหลดหลักฐานการโอนเงิน (สลิป) *
                </h3>

                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-amber-400 bg-amber-400/10"
                      : "border-amber-400/30 hover:border-amber-400/60 bg-slate-800/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={24} className="text-amber-400" />
                    <p className="text-gray-300 font-semibold">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือก</p>
                    <p className="text-gray-500 text-sm">รองรับ JPG, PNG, WEBP, PDF (สูงสุด 16 MB)</p>
                  </div>
                </div>

                {/* Preview */}
                {slipPreview && (
                  <div className="relative rounded-lg overflow-hidden border border-amber-400/30">
                    <img src={slipPreview} alt="Preview" className="w-full max-h-64 object-cover" />
                    <button
                      type="button"
                      onClick={() => { setSlipFile(null); setSlipPreview(null); }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {slipFile && !slipPreview && (
                  <div className="flex items-center justify-between bg-slate-800/50 border border-amber-400/20 rounded-lg p-4">
                    <span className="text-gray-300 text-sm">{slipFile.name}</span>
                    <button
                      type="button"
                      onClick={() => { setSlipFile(null); setSlipPreview(null); }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name || !formData.email || !formData.phone || !formData.address}
              className="w-full bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold py-6 text-lg disabled:opacity-50"
            >
              {isSubmitting ? "กำลังประมวลผล..." : "✓ ยืนยันการสั่งซื้อ"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderConfirmationModal({ isOpen, onClose, orderData, orderNumber }: { 
  isOpen: boolean; 
  onClose: () => void; 
  orderData: any;
  orderNumber: string;
}) {
  if (!isOpen || !orderData) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-400/30 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center p-8 border-b border-amber-400/20">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-amber-400 mb-2">สั่งซื้อสำเร็จ!</h2>
          <p className="text-gray-300">ขอบคุณที่สั่งซื้อหนังสือ Neville Goddard ของเรา</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Order Number */}
          <div className="bg-slate-800/50 border border-amber-400/20 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">เลขที่ใบสั่งซื้อ</p>
            <p className="text-amber-400 font-bold text-2xl">{orderNumber}</p>
          </div>

          {/* Order Details */}
          <div className="bg-slate-800/50 border border-amber-400/20 rounded-lg p-4">
            <h3 className="text-amber-400 font-bold mb-3">📋 รายละเอียดการสั่งซื้อ</h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <p><span className="text-gray-400">ชื่อ:</span> {orderData.name}</p>
              <p><span className="text-gray-400">อีเมล:</span> {orderData.email}</p>
              <p><span className="text-gray-400">เบอร์โทร:</span> {orderData.phone}</p>
              <p><span className="text-gray-400">ที่อยู่:</span> {orderData.address}</p>
              <p><span className="text-gray-400">วิธีชำระเงิน:</span> 🏦 โอนเงินผ่านธนาคารกรุงไทย (KTB)</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gradient-to-r from-amber-400/10 to-slate-800/50 border border-amber-400/30 rounded-lg p-4">
            <p className="text-gray-300 text-sm mb-2">รวมทั้งสิ้น:</p>
            <p className="text-amber-400 text-3xl font-bold">฿{orderData.total}</p>
          </div>

          {/* Next Steps */}
          <div className="bg-slate-800/50 border border-amber-400/20 rounded-lg p-4">
            <h3 className="text-amber-400 font-bold mb-3">📧 ขั้นตอนถัดไป</h3>
            <ol className="space-y-2 text-gray-300 text-sm">
              <li>1. เราจะส่งอีเมลยืนยันการสั่งซื้อไปยัง {orderData.email}</li>
              <>
                <li>2. กรุณาโอนเงินตามข้อมูลบัญชีที่แสดงในอีเมล</li>
                <li>3. หลังชำระเงินแล้ว เราจะจัดส่งหนังสือภายใน 1-3 วันทำการ</li>
                <li>4. ติดตามสถานะการจัดส่งผ่านอีเมล</li>
              </>
            </ol>
          </div>

          {/* Contact Info */}
          <div className="bg-slate-800/50 border border-amber-400/20 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm mb-2">หากมีคำถาม ติดต่อเรา</p>
            <p className="text-amber-400 font-bold">📞 LINE: @coachwanchai | Tel: 0994159587</p>
          </div>

          {/* Skool Community CTA */}
          <a
            href={COMMUNITY_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-400/40 rounded-lg p-5 hover:from-emerald-600/30 hover:to-teal-600/30 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">👥</div>
              <div className="flex-1">
                <h3 className="text-emerald-300 font-bold text-lg mb-1">
                  เข้าร่วมชุมชน Neville Goddard Thailand
                </h3>
                <p className="text-gray-300 text-sm mb-2">
                  ระหว่างรอหนังสือ มาเจอกับเพื่อนที่ฝึกการ Manifest เหมือนกัน เรียนรู้ แชร์ประสบการณ์ และรับเทคนิคพิเศษฟรี
                </p>
                <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold text-sm">
                  เข้าร่วมฟรี →
                </span>
              </div>
            </div>
          </a>

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold py-6 text-lg"
          >
            ✓ ปิด
          </Button>
        </div>
      </div>
    </div>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "หนังสือส่งเป็น PDF หรือหนังสือจริง?",
      a: "ส่งเป็นหนังสือจริงทุกเล่มครับ เป็นหนังสือเล่มจริงที่สามารถจับต้องได้ อ่านได้สะดวกสบาย และเก็บสะสมไว้ในชั้นบนได้เลย",
    },
    {
      q: "ใช้เวลาส่งกี่วัน?",
      a: "ส่งภายใน 1-3 วันทำการ หลังจากยืนยันการชำระเงินแล้ว สำหรับต่างจังหวัดอาจใช้เวลา 3-5 วันทำการครับ",
    },
    {
      q: "ชำระเงินผ่านช่องทางไหนได้บ้าง?",
      a: "รับชำระผ่านโอนผ่านธนาคาร (KTB, SCB, KBANK, BBL), PromptPay และ TrueMoney Wallet สะดวกและรวดเร็ว หลังโอนให้แคปชัวร์สลิปและที่อยู่จัดส่งทันทีครับ",
    },
    {
      q: "หนังสือเหมาะกับใคร?",
      a: "เหมาะสำหรับทุกคนที่สนใจเรื่อง Law of Attraction, Manifestation, กฎแรงดึงดูด หรือต้องการเปลี่ยนแปลงชีวิต ไม่ว่าจะเรื่องความสัมพันธ์ การเงิน หรือความสำเร็จในอาชีพ หนังสือเหล่านี้จะช่วยให้คุณเข้าใจหลักการสร้างสรรค์ชีวิตอย่างลึกซึ้งครับ",
    },
    {
      q: "ถ้าไม่พอใจสามารถคืนได้ไหม?",
      a: "เนื่องจากเป็นสินค้าทางกายภาพ จึงไม่รับคืนสินค้าหลังจากจัดส่งแล้วครับ อย่างไรก็ตาม หากสินค้าชำรุดหรือเสียหายระหว่างการจัดส่ง ยินดีชดเชยทันทีครับ",
    },
    {
      q: "สั่งซื้อหลายเล่มมีส่วนลดไหม?",
      a: "มีส่วนลดพิเศษสำหรับการซื้อหลายเล่มครับ! ซื้อ 2 เล่ม ลด 5%, 3 เล่ม ลด 10%, 4 เล่มขึ้นไป ลด 15% ส่วนลดจะคำนวณอัตโนมัติในตะกร้าสินค้าครับ",
    },
  ];

  return (
    <section className="py-20 px-4" style={{background: "#0f172a", borderTop: "1px solid rgba(251,191,36,0.15)"}}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">คำถามที่พบบ่อย</span>
          <h2 className="text-4xl font-bold text-white mb-3">FAQ <span className="text-amber-400">คำถาม-คำตอบ</span></h2>
          <div className="mx-auto w-24 h-0.5" style={{background: "linear-gradient(90deg, transparent, #fbbf24, transparent)"}} />
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border overflow-hidden transition-all duration-200"
              style={{borderColor: openIndex === i ? "rgba(251,191,36,0.4)" : "rgba(251,191,36,0.1)", background: openIndex === i ? "rgba(251,191,36,0.07)" : "rgba(255,255,255,0.03)"}}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="text-white font-semibold pr-4">{faq.q}</span>
                <span
                  className="text-amber-400 flex-shrink-0 text-xl transition-transform duration-200"
                  style={{transform: openIndex === i ? "rotate(45deg)" : "rotate(0deg)"}}
                >
                  +
                </span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5">
                  <p className="text-gray-300 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderConfirmationOpen, setIsOrderConfirmationOpen] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [upsellShownThisSession, setUpsellShownThisSession] = useState(false);

  const {
    cartItems,
    isCartOpen,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    openCart,
    closeCart,
    isBundleUpsellOpen,
    bundleUpsellBook,
    setIsBundleUpsellOpen,
  } = useCart();
  const setIsCartOpen = (open: boolean) => open ? openCart() : closeCart();

  // Fetch products from database
  const { data: productsData, isLoading: isLoadingProducts } = trpc.products.list.useQuery();
  const products = (productsData || []) as any[];

  const [location, navigate] = useLocation();

  // Open checkout automatically when redirected here with ?checkout=1
  // (e.g. cart button clicked from a product detail page)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "1" && cartItems.length > 0) {
      setIsCheckoutOpen(true);
      params.delete("checkout");
      const newSearch = params.toString();
      window.history.replaceState(
        {},
        "",
        window.location.pathname + (newSearch ? `?${newSearch}` : "")
      );
    }
  }, [location, cartItems.length]);

  const openModal = (book: Book) => {
    if (book.detailPage) {
      navigate(book.detailPage);
      return;
    }
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  const handleCheckout = () => {
    closeCart();
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = (formData: any) => {
    const total = formData.total ?? (() => {
      const subtotal = cartItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
      const qty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      return calcVolumeDiscount(subtotal, qty).total;
    })();
    setOrderData({ ...formData, total });
    setIsCheckoutOpen(false);
    setIsOrderConfirmationOpen(true);
    clearCart();
  };

  const handleCloseOrderConfirmation = () => {
    setIsOrderConfirmationOpen(false);
    setOrderData(null);
  };

  // Convert products from DB to Book interface
  // Map slugs to dedicated sales pages
  const DETAIL_PAGES: Record<string, string> = {
    'how-to-attract-love': '/books/how-to-attract-love',
    'i-know-my-father': '/books/i-know-my-father',
  };

  const booksFromDB: Book[] = products.map(p => ({
    id: p.id,
    titleTh: p.titleTh,
    titleEn: p.titleEn || '',
    price: parseFloat(String(p.price)),
    image: p.imageUrl || '',
    description: p.descriptionTh || p.description || '',
    benefits: [],
    rating: 4.9,
    sold: 0,
    isNew: false,
    detailPage: p.slug ? `/books/${p.slug}` : undefined,
  }));

  // Empty state
  if (!isLoadingProducts && booksFromDB.length === 0) {
    return (
      <div className="min-h-screen" style={{background: "linear-gradient(135deg, #020617 0%, #0a0f1e 25%, #0d1117 50%, #0a0a1a 75%, #020617 100%)"}}>
        <Navbar
          cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          onCartClick={() => setIsCheckoutOpen(true)}
        />
        
        <section className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">📚</div>
            <h1 className="text-4xl font-bold text-white mb-4">ยังไม่มีสินค้า</h1>
            <p className="text-gray-400 mb-8 text-lg">กำลังเพิ่มหนังสือดีๆ ให้คุณ...</p>
            <Button
              onClick={() => window.location.href = '/admin/products'}
              className="bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold py-6 px-8 text-lg"
            >
              ➕ เพิ่มสินค้า
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: "linear-gradient(135deg, #020617 0%, #0a0f1e 25%, #0d1117 50%, #0a0a1a 75%, #020617 100%)"}}>
      {/* Navbar */}
      <Navbar
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0" style={{background: "radial-gradient(ellipse 80% 60% at 70% 50%, rgba(180,130,0,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 20% 30%, rgba(30,60,120,0.15) 0%, transparent 60%), linear-gradient(135deg, #020617 0%, #0a0f1e 50%, #020617 100%)"}} />
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px"}} />
        <div className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{background: "radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 70%)"}} />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl" style={{background: "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)"}} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-24 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text & CTA */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-amber-400/40 bg-amber-400/5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 text-sm font-semibold tracking-widest uppercase">ปรมาจารย์แห่งการสร้างความจริง</span>
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6" style={{textShadow: "0 0 60px rgba(251,191,36,0.15)"}}>
              <span className="text-white">หนังสือ</span>
              <br />
              <span className="text-transparent bg-clip-text" style={{backgroundImage: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #fcd34d 70%, #fbbf24 100%)"}}>Neville</span>
              <br />
              <span className="text-transparent bg-clip-text" style={{backgroundImage: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #fcd34d 70%, #fbbf24 100%)"}}>Goddard</span>
              <br />
              <span className="text-white text-4xl lg:text-5xl">ฉบับแปลไทย</span>
            </h1>

            <p className="text-lg lg:text-xl text-gray-300 mb-3 leading-relaxed font-light">
              เปลี่ยนจินตนาการให้เป็นความจริง ด้วยคำสอนจากปรมาจารย์แห่งกฎแรงดึงดูด
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="text-amber-400">⭐</span>
                <span className="text-white text-sm font-semibold">4.9/5</span>
                <span className="text-gray-400 text-sm">จาก 13.8k รีวิว</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="text-amber-400">📚</span>
                <span className="text-white text-sm font-semibold">ผู้อ่านกว่า 500,000 คน</span>
                <span className="text-gray-400 text-sm">ทั่วโลก</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="cta-glow relative overflow-hidden text-slate-900 font-bold px-8 py-6 text-lg rounded-xl shadow-lg transition-all hover:scale-105 hover:brightness-110 btn-cta"
                style={{background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%)", boxShadow: "0 0 30px rgba(251,191,36,0.35), 0 4px 20px rgba(0,0,0,0.4)"}}
                onClick={() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" })}
              >
                <BookOpen size={20} className="mr-2" />
                ดูหนังสือทั้งหมด
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-amber-400/60 text-amber-400 hover:bg-amber-400/10 px-8 py-6 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all hover:border-amber-400 hover:scale-105 btn-cta"
                onClick={() => document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" })}
              >
                <ShoppingCart size={20} className="mr-2" />
                สั่งซื้อเลย
              </Button>
            </div>
          </div>

          {/* Right: Portrait Image */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl opacity-30 blur-2xl" style={{background: "linear-gradient(135deg, rgba(251,191,36,0.5) 0%, rgba(180,100,0,0.3) 100%)"}} />
              <div className="relative rounded-2xl overflow-hidden border border-amber-400/30 shadow-2xl" style={{boxShadow: "0 0 60px rgba(251,191,36,0.15), 0 25px 50px rgba(0,0,0,0.6)"}}>
                <div className="absolute inset-0 z-10" style={{background: "linear-gradient(to bottom, transparent 50%, rgba(2,6,23,0.8) 100%), linear-gradient(to right, transparent 70%, rgba(2,6,23,0.3) 100%)"}} />
                <img
                  src="/images/books/neville-portrait.png"
                  alt="Neville Goddard"
                  className="w-72 lg:w-80 xl:w-96 object-cover"
                  style={{filter: "contrast(1.1) brightness(0.95) sepia(0.15)"}}
                />
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4 text-center">
                  <p className="text-amber-400 font-semibold text-sm tracking-wider">NEVILLE GODDARD</p>
                  <p className="text-gray-400 text-xs">1905 – 1972</p>
                </div>
              </div>
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-amber-400/60 rounded-tl-lg" />
              <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-amber-400/60 rounded-tr-lg" />
              <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-amber-400/60 rounded-bl-lg" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-amber-400/60 rounded-br-lg" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-gray-400 text-xs tracking-widest uppercase">เลื่อนลง</span>
          <div className="w-px h-8 bg-gradient-to-b from-amber-400/60 to-transparent" />
        </div>
      </section>

      {/* Featured Section - Dynamic Products */}
      <section id="featured" className="py-20 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gradient-amber mb-3">เล่มใหม่ล่าสุด</h2>
          <p className="text-gray-400">หนังสือเล่มแนะนำสำหรับผู้ที่เริ่มต้นเรียนรู้คำสอนของ Neville Goddard</p>
          <div className="mt-4 mx-auto w-24 h-0.5" style={{background: "linear-gradient(90deg, transparent, #fbbf24, transparent)"}} />
        </div>

        {isLoadingProducts ? (
          <div className="text-center py-12">
            <p className="text-gray-400">กำลังโหลด...</p>
          </div>
        ) : booksFromDB.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-6">ยังไม่มีสินค้า</p>
            <Button
              onClick={() => window.location.href = '/admin/products'}
              className="bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold"
            >
              ➕ เพิ่มสินค้า
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {booksFromDB.slice(0, 3).map(book => (
              <div key={book.id} className="flex flex-col">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-amber-400/20 rounded-lg blur-2xl"></div>
                    <img
                      src={book.image}
                      alt={book.titleTh}
                      className="relative w-full max-w-xs rounded-lg shadow-2xl hover:scale-105 transition-transform"
                    />
                  </div>
                </div>
                <div>
                  {book.isNew && (
                    <div className="inline-block bg-amber-400 text-slate-900 px-4 py-2 rounded-full text-sm font-bold mb-4">
                      ✨ NEW - เล่มใหม่ล่าสุด
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-white mb-2">{book.titleTh}</h3>
                  <p className="text-amber-400 text-lg mb-3 italic">{book.titleEn}</p>
                  <p className="text-gray-300 mb-4 leading-relaxed text-sm">{book.description}</p>
                  
                  <div className="mb-4 space-y-2">
                    {book.benefits.slice(0, 2).map((benefit, i) => (
                      <p key={i} className="text-gray-300 flex items-start gap-2 text-sm">
                        <span className="text-amber-400 mt-0.5">→</span>
                        <span>{benefit}</span>
                      </p>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl font-bold text-amber-400">฿{book.price}</span>
                    <div>
                      <StarRating rating={book.rating} />
                      <p className="text-gray-400 text-xs">{book.rating}/5</p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => openModal(book)}
                    className="w-full cta-glow font-bold py-4 text-base shadow-lg hover:scale-[1.02] hover:brightness-110 transition-all"
                    style={{background: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "#0f172a"}}
                  >
                    <ShoppingCart size={18} className="mr-2" />
                    ดูรายละเอียด
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* All Books Section */}
      <section id="collection" className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gradient-amber mb-3">รายการหนังสือทั้งหมด</h2>
          <p className="text-gray-400">หนังสือ Neville Goddard ฉบับแปลไทยครบทุกเล่ม</p>
          <div className="mt-4 mx-auto w-24 h-0.5" style={{background: "linear-gradient(90deg, transparent, #fbbf24, transparent)"}} />
        </div>

        {isLoadingProducts ? (
          <div className="text-center py-12">
            <p className="text-gray-400">กำลังโหลด...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {booksFromDB.map(book => (
              <div
                key={book.id}
                className="group relative flex flex-col rounded-xl border border-amber-400/10 bg-white/5 backdrop-blur-sm hover:border-amber-400/40 hover:bg-white/10 transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => openModal(book)}
              >
                {/* Badge */}
                {book.badge && (
                  <div className="absolute top-3 left-3 z-10">
                    {book.badge === 'bestseller' && <span className="bg-amber-400 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">🏆 ขายดี</span>}
                    {book.badge === 'new' && <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">✨ ใหม่</span>}
                    {book.badge === 'recommended' && <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">⭐ แนะนำ</span>}
                    {book.badge === 'hot' && <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">🔥 ฮิต</span>}
                  </div>
                )}

                {/* Book Cover */}
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-amber-400/5 group-hover:bg-amber-400/10 transition-colors" />
                  <img
                    src={book.image}
                    alt={book.titleTh}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Book Info */}
                <div className="flex flex-col flex-1 p-4">
                  <h3 className="text-white font-bold text-sm mb-1 line-clamp-2 leading-snug">{book.titleTh}</h3>
                  {book.titleEn && <p className="text-amber-400/70 text-xs italic mb-3 line-clamp-1">{book.titleEn}</p>}

                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-amber-400 font-bold text-lg">฿{book.price}</span>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-gray-400 text-xs">{book.rating}</span>
                    </div>
                  </div>

                  <Button
                    onClick={(e) => { e.stopPropagation(); openModal(book); }}
                    className="mt-3 w-full font-semibold py-2 text-sm hover:scale-[1.02] transition-transform"
                    style={{background: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "#0f172a"}}
                  >
                    <ShoppingCart size={14} className="mr-1" />
                    ดูรายละเอียด
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Neville Goddard Biography Section */}
      <section className="py-20 px-4" style={{background: "linear-gradient(180deg, #0f172a 0%, #1a1a2e 50%, #0f172a 100%)", borderTop: "1px solid rgba(251,191,36,0.15)", borderBottom: "1px solid rgba(251,191,36,0.15)"}}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">ปรมาจารย์แห่งกฎแรงดึงดูด</span>
            <h2 className="text-4xl font-bold text-white mb-3">ประวัติ <span className="text-amber-400">เนวิลล์ ก็อดดาร์ด</span></h2>
            <div className="mx-auto w-24 h-0.5" style={{background: "linear-gradient(90deg, transparent, #fbbf24, transparent)"}} />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Image + Key Facts */}
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden border border-amber-400/20 shadow-2xl">
                <img
                  src="/images/people/neville-goddard.jpg"
                  alt="Neville Goddard"
                  className="w-full object-cover"
                  style={{maxHeight: "380px", objectPosition: "top"}}
                  loading="lazy"
                />
                <div className="absolute inset-0" style={{background: "linear-gradient(to top, rgba(15,23,42,0.8) 0%, transparent 60%)"}} />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-amber-400 font-bold text-lg">Neville Lancelot Goddard</p>
                  <p className="text-gray-300 text-sm">19 กุมภาพันธ์ 1905 – 1 ตุลาคม 1972</p>
                </div>
              </div>

              {/* Key Facts */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "🌍", label: "เกิดที่", value: "บาร์เบโดส, แคริบเบียน" },
                  { icon: "📚", label: "ผลงาน", value: "หนังสือกว่า 10 เล่ม" },
                  { icon: "🎤", label: "อาชีพ", value: "นักปรัชญา, วิทยากร" },
                  { icon: "✨", label: "แนวคิดหลัก", value: "กฎแห่งการสมมติ" },
                ].map((fact, i) => (
                  <div key={i} className="rounded-xl p-4 border border-amber-400/10" style={{background: "rgba(251,191,36,0.05)"}}>
                    <span className="text-2xl">{fact.icon}</span>
                    <p className="text-gray-400 text-xs mt-1">{fact.label}</p>
                    <p className="text-white text-sm font-semibold">{fact.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Biography Text */}
            <div className="space-y-5 text-gray-300 leading-relaxed">
              <p>
                <span className="text-amber-400 font-bold">เนวิลล์ ก็อดดาร์ด</span> เกิดเมื่อวันที่ 19 กุมภาพันธ์ ค.ศ. 1905 ที่เกาะบาร์เบโดส ประเทศในแถบแคริบเบียน เขาเดินทางมายังสหรัฐอเมริกาในวัยหนุ่มเพื่อศึกษาศิลปะการเต้นรำ ก่อนจะค้นพบเส้นทางชีวิตที่แท้จริงในฐานะนักปรัชญาและวิทยากรด้านจิตวิทยาลึก
              </p>
              <p>
                ผลงานของเนวิลล์ได้รับแรงบันดาลใจจากคำสอนของ <span className="text-amber-400">อับดุลลาห์</span> นักปรัชญาชาวเอธิโอเปียผู้เป็นอาจารย์ของเขา ซึ่งสอนให้เขาเข้าใจว่า <em className="text-amber-300">"จินตนาการคือพระเจ้า"</em> และทุกสิ่งในชีวิตสามารถสร้างสรรค์ได้ผ่านพลังแห่งจิตใจ
              </p>
              <p>
                ตลอดชีวิตของเขา เนวิลล์ได้บรรยายและเขียนหนังสือมากกว่า 10 เล่ม โดยแนวคิดหลักของเขาคือ <span className="text-amber-400 font-semibold">กฎแห่งการสมมติ (Law of Assumption)</span> ซึ่งกล่าวว่า สิ่งที่คุณสมมติว่าเป็นจริงแล้ว จะกลายเป็นจริงในโลกภายนอก
              </p>

              {/* Core Teachings */}
              <div className="rounded-xl p-5 border border-amber-400/20" style={{background: "rgba(251,191,36,0.05)"}}>
                <h3 className="text-amber-400 font-bold mb-3">💡 แนวคิดหลักของเนวิลล์</h3>
                <ul className="space-y-2">
                  {[
                    "กฎแห่งการสมมติ — สมมติว่าเป็นจริงแล้ว มันจะเป็นจริง",
                    "SATS (State Akin to Sleep) — เทคนิคการปลุกจิตใต้สำนึกก่อนนอน",
                    "Revision — แก้ไขความทรงจำเพื่อเปลี่ยนอนาคต",
                    "Living in the End — ใช้ชีวิตราวกับว่าความปรารถนาสำเร็จแล้ว",
                    "ความรู้สึกคือความลับ — ความรู้สึกที่แท้จริงสร้างสรรค์ความเป็นจริง",
                  ].map((teaching, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-400 mt-0.5 flex-shrink-0">→</span>
                      <span>{teaching}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-gray-400 text-sm italic border-l-2 border-amber-400/40 pl-4">
                เนวิลล์เสียชีวิตเมื่อวันที่ 1 ตุลาคม ค.ศ. 1972 แต่คำสอนของเขายังคงมีชีวิตอยู่และส่งผลต่อผู้คนทั่วโลกมาจนถึงทุกวันนี้
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Skool Community Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/40 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto relative">
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-emerald-400/30 rounded-2xl p-8 md:p-12 backdrop-blur-sm shadow-2xl shadow-emerald-500/10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-4">
                <span className="text-2xl">👥</span>
                <span className="text-emerald-300 text-sm font-semibold">ชุมชนฟรี</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                เข้าร่วม <span className="text-emerald-400">Neville Goddard Thailand</span>
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                ชุมชนสำหรับคนไทยที่สนใจคำสอนของเนวิลล์ ก็อดดาร์ด<br className="hidden md:block" />
                เรียนรู้ แชร์ประสบการณ์ และฝึก Manifest ไปด้วยกัน
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-800/40 border border-emerald-400/20 rounded-xl p-5 text-center">
                <div className="text-3xl mb-2">📚</div>
                <h3 className="text-emerald-300 font-bold mb-1">บทเรียนฟรี</h3>
                <p className="text-gray-400 text-sm">เนื้อหาเจาะลึกเทคนิค SATS, Revision และ Living in the End</p>
              </div>
              <div className="bg-slate-800/40 border border-emerald-400/20 rounded-xl p-5 text-center">
                <div className="text-3xl mb-2">💬</div>
                <h3 className="text-emerald-300 font-bold mb-1">พูดคุยกับเพื่อน</h3>
                <p className="text-gray-400 text-sm">แชร์ประสบการณ์ Manifest กับคนที่เข้าใจ ไม่มีคำถามที่งี่เง่า</p>
              </div>
              <div className="bg-slate-800/40 border border-emerald-400/20 rounded-xl p-5 text-center">
                <div className="text-3xl mb-2">🎁</div>
                <h3 className="text-emerald-300 font-bold mb-1">โบนัสพิเศษ</h3>
                <p className="text-gray-400 text-sm">เทคนิคและสรุปจากหนังสือที่หาไม่ได้ที่อื่น</p>
              </div>
            </div>

            <div className="text-center">
              <a
                href={COMMUNITY_PATH}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all text-lg"
              >
                🚀 เข้าร่วมชุมชนฟรี
              </a>
              <p className="text-gray-500 text-xs mt-3">ฟรี 100% • ไม่ต้องใช้บัตรเครดิต • ออกได้ตลอด</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Modals */}
      <BookModal book={selectedBook} isOpen={isModalOpen} onClose={closeModal} onAddToCart={addToCart} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} cartItems={cartItems} onConfirmOrder={handleConfirmOrder} />
      {orderData && (
        <OrderConfirmationModal
          isOpen={isOrderConfirmationOpen}
          onClose={handleCloseOrderConfirmation}
          orderData={orderData}
          orderNumber={`ORD-${Date.now()}`}
        />
      )}
      {bundleUpsellBook && (
        <BundleUpsellModal
          isOpen={isBundleUpsellOpen}
          singleBookTitle={bundleUpsellBook.titleTh}
          singleBookPrice={bundleUpsellBook.price}
          singleBookId={bundleUpsellBook.id}
          onAddNewBook={(bookId) => {
            const newBook = booksFromDB.find(b => b.id === bookId);
            if (newBook) addToCart(newBook);
            setIsBundleUpsellOpen(false);
          }}
          onDecline={() => setIsBundleUpsellOpen(false)}
          onUpgrade={() => setIsBundleUpsellOpen(false)}
        />
      )}
    </div>
  );
}
