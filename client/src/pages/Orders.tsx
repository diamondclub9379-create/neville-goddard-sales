import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Loader2, Package, ShoppingBag, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: "รอชำระเงิน",   color: "text-yellow-400",  bg: "bg-yellow-400/10 border-yellow-400/30" },
  paid:       { label: "ชำระแล้ว",     color: "text-blue-400",    bg: "bg-blue-400/10 border-blue-400/30" },
  processing: { label: "กำลังเตรียม",  color: "text-purple-400",  bg: "bg-purple-400/10 border-purple-400/30" },
  shipped:    { label: "จัดส่งแล้ว",   color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/30" },
  delivered:  { label: "ส่งถึงแล้ว",  color: "text-green-400",   bg: "bg-green-400/10 border-green-400/30" },
  cancelled:  { label: "ยกเลิก",       color: "text-red-400",     bg: "bg-red-400/10 border-red-400/30" },
};

const PAYMENT_LABELS: Record<string, string> = {
  "bank-transfer": "🏦 โอนเงินผ่านธนาคาร",
  "promptpay":     "📱 PromptPay",
};

function OrderCard({ order }: { order: any }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_LABELS[order.status] ?? { label: order.status, color: "text-gray-400", bg: "bg-gray-400/10 border-gray-400/30" };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-amber-400/20 rounded-xl overflow-hidden">
      {/* Order Header */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-amber-400 font-bold text-base">{order.orderNumber}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${status.bg} ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            {new Date(order.createdAt).toLocaleDateString("th-TH", {
              year: "numeric", month: "long", day: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">
            {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-gray-400 text-xs">รวมทั้งสิ้น</p>
            <p className="text-amber-400 font-bold text-xl">
              ฿{parseFloat(order.totalAmount).toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-amber-400 transition-colors p-1"
            aria-label={expanded ? "ซ่อนรายละเอียด" : "ดูรายละเอียด"}
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Tracking number if available */}
      {order.trackingNumber && (
        <div className="px-5 pb-3">
          <span className="text-xs text-gray-400">เลขพัสดุ: </span>
          <span className="text-amber-300 text-xs font-mono font-bold">{order.trackingNumber}</span>
        </div>
      )}

      {/* Expanded: order items */}
      {expanded && (
        <div className="border-t border-amber-400/10 px-5 py-4 space-y-3">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">รายการหนังสือ</p>
          {order.items?.map((item: any, i: number) => (
            <div key={i} className="flex items-start gap-3 bg-slate-900/40 rounded-lg p-3">
              {item.bookImage && (
                <img
                  src={item.bookImage}
                  alt={item.bookTitleTh}
                  className="w-12 h-16 object-cover rounded-md flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium leading-snug">{item.bookTitleTh}</p>
                <p className="text-gray-500 text-xs">{item.bookTitleEn}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-400 text-xs">x{item.quantity}</span>
                  <span className="text-amber-400 text-sm font-bold">
                    ฿{parseFloat(item.unitPrice).toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="text-amber-300 text-sm font-bold flex-shrink-0">
                ฿{parseFloat(item.subtotal).toLocaleString()}
              </p>
            </div>
          ))}

          {/* Price breakdown */}
          <div className="bg-slate-900/40 rounded-lg p-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>ราคารวม</span>
              <span>฿{parseFloat(order.subtotal).toLocaleString()}</span>
            </div>
            {parseFloat(order.discountAmount) > 0 && (
              <div className="flex justify-between text-green-400">
                <span>ส่วนลด {order.discountTier ? `(${order.discountTier})` : ""}</span>
                <span>-฿{parseFloat(order.discountAmount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-400">
              <span>ค่าจัดส่ง</span>
              <span>{parseFloat(order.shippingFee) === 0 ? "ฟรี" : `฿${parseFloat(order.shippingFee).toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between text-amber-400 font-bold border-t border-amber-400/20 pt-1.5">
              <span>รวมทั้งสิ้น</span>
              <span>฿{parseFloat(order.totalAmount).toLocaleString()}</span>
            </div>
          </div>

          {/* Shipping address */}
          <div className="text-xs text-gray-500">
            <span className="text-gray-400">ที่อยู่จัดส่ง: </span>
            {order.customerAddress}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const { data: orders, isLoading, error } = trpc.orders.getMyOrders.useQuery(undefined, {
    enabled: !!user,
  });

  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #020617 0%, #0a0f1e 25%, #0d1117 50%, #0a0a1a 75%, #020617 100%)" }}>
        <Loader2 size={32} className="animate-spin text-amber-400" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #020617 0%, #0a0f1e 25%, #0d1117 50%, #0a0a1a 75%, #020617 100%)" }}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🔐</div>
          <h1 className="text-2xl font-bold text-amber-400 mb-3">กรุณาเข้าสู่ระบบ</h1>
          <p className="text-gray-400 mb-6 leading-relaxed">
            เข้าสู่ระบบด้วยบัญชี Google เพื่อดูประวัติการสั่งซื้อของคุณ<br />
            <span className="text-gray-500 text-sm">อีเมลที่ใช้สั่งซื้อต้องตรงกับบัญชีที่ login</span>
          </p>
          <Button
            onClick={() => { window.location.href = getLoginUrl(); }}
            className="bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold px-8 py-3 text-base"
          >
            เข้าสู่ระบบ
          </Button>
          <div className="mt-4">
            <Link href="/" className="text-gray-500 hover:text-amber-400 text-sm transition-colors">
              ← กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #020617 0%, #0a0f1e 25%, #0d1117 50%, #0a0a1a 75%, #020617 100%)" }}>
      {/* Header */}
      <div className="border-b border-amber-400/10 bg-slate-900/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <button className="text-gray-400 hover:text-amber-400 transition-colors p-1">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <Package size={20} className="text-amber-400" />
            <h1 className="text-white font-bold text-lg">ประวัติการสั่งซื้อ</h1>
          </div>
          <div className="ml-auto text-right">
            <p className="text-gray-400 text-xs">เข้าสู่ระบบในฐานะ</p>
            <p className="text-amber-400 text-sm font-medium truncate max-w-[160px]">{user.email ?? user.name}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <Loader2 size={32} className="animate-spin text-amber-400" />
            <p className="text-gray-400">กำลังโหลดประวัติการสั่งซื้อ...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400">เกิดข้อผิดพลาด: {error.message}</p>
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={64} className="text-gray-700 mx-auto mb-4" />
            <h2 className="text-gray-400 text-xl font-medium mb-2">ยังไม่มีประวัติการสั่งซื้อ</h2>
            <p className="text-gray-600 text-sm mb-6">
              หากคุณเคยสั่งซื้อด้วยอีเมลอื่น กรุณาตรวจสอบว่า login ด้วยอีเมลเดียวกัน
            </p>
            <Link href="/">
              <Button className="bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold">
                เลือกซื้อหนังสือ
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm mb-2">
              พบ {orders.length} รายการสั่งซื้อ
            </p>
            {orders.map((order: any) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
