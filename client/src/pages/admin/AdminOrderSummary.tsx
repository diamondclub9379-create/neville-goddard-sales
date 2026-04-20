import { useState, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  FileImage,
  Search,
  Download,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  CheckCircle2,
  Loader2,
  Truck,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Package,
  StickyNote,
  ExternalLink,
  BookOpen,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type DateRange = "today" | "7days" | "30days" | "all";
type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";

type OrderItem = {
  id: number;
  bookTitleTh: string;
  bookTitleEn: string;
  bookImage?: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
};

type OrderWithItems = {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  status: string;
  subtotal: string;
  discountAmount: string;
  totalAmount: string;
  shippingFee?: string | null;
  discountTier?: string | null;
  slipUrl: string | null;
  trackingNumber: string | null;
  notes: string | null;
  createdAt: Date;
  items: OrderItem[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string; dotColor: string }> = {
  pending:    { label: "รอชำระ",      className: "bg-amber-500/15 text-amber-400 border-amber-500/30",    dotColor: "bg-amber-400" },
  paid:       { label: "ชำระแล้ว",    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",       dotColor: "bg-blue-400" },
  processing: { label: "กำลังเตรียม", className: "bg-purple-500/15 text-purple-400 border-purple-500/30", dotColor: "bg-purple-400" },
  shipped:    { label: "จัดส่งแล้ว",  className: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",       dotColor: "bg-cyan-400" },
  delivered:  { label: "ส่งถึงแล้ว",  className: "bg-green-500/15 text-green-400 border-green-500/30",    dotColor: "bg-green-400" },
  cancelled:  { label: "ยกเลิก",      className: "bg-red-500/15 text-red-400 border-red-500/30",          dotColor: "bg-red-400" },
};

const PAYMENT_LABELS: Record<string, string> = {
  "bank-transfer": "โอนธนาคาร",
  "promptpay":     "PromptPay",
};

function formatDate(d: Date | string) {
  const date = new Date(d);
  return date.toLocaleDateString("th-TH", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDateLong(d: Date | string) {
  const date = new Date(d);
  return date.toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatCurrency(amount: string | number) {
  return `฿${Number(amount).toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function getDateRange(range: DateRange): { dateFrom?: Date; dateTo?: Date } {
  if (range === "all") return {};
  const now = new Date();
  const from = new Date();
  if (range === "today") {
    from.setHours(0, 0, 0, 0);
  } else if (range === "7days") {
    from.setDate(now.getDate() - 7);
    from.setHours(0, 0, 0, 0);
  } else if (range === "30days") {
    from.setDate(now.getDate() - 30);
    from.setHours(0, 0, 0, 0);
  }
  return { dateFrom: from, dateTo: now };
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  loading?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-5 backdrop-blur-sm">
      <div className={`absolute -top-6 -right-6 h-20 w-20 rounded-full opacity-20 blur-2xl ${color}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">{label}</p>
          {loading ? (
            <div className="mt-2 h-7 w-24 animate-pulse rounded bg-slate-700" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          )}
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${color} bg-opacity-20`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

// ─── Slip Viewer Modal ────────────────────────────────────────────────────────

function SlipModal({ url, onClose }: { url: string; onClose: () => void }) {
  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(url);
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-slate-700 bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-amber-400">หลักฐานการโอนเงิน</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          {isImage ? (
            <img
              src={url}
              alt="สลิปการโอนเงิน"
              className="max-h-[60vh] w-full rounded-lg object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-slate-400">
              <FileImage className="h-16 w-16 opacity-40" />
              <p>ไฟล์ PDF — ไม่สามารถแสดงตัวอย่างได้</p>
            </div>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-amber-400 underline underline-offset-2 hover:text-amber-300"
          >
            เปิดในแท็บใหม่ →
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tracking Number Dialog ───────────────────────────────────────────────────

function TrackingDialog({
  orderNumber,
  currentTracking,
  onConfirm,
  onCancel,
  isLoading,
}: {
  orderNumber: string;
  currentTracking: string | null;
  onConfirm: (trackingNumber: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [tracking, setTracking] = useState(currentTracking ?? "");
  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-sm border-slate-700 bg-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Truck className="h-5 w-5 text-cyan-400" />
            กรอกเลขพัสดุ
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-slate-400">
            ออเดอร์ <span className="font-mono text-amber-400">{orderNumber}</span>
          </p>
          <Input
            placeholder="เช่น EF123456789TH"
            value={tracking}
            onChange={e => setTracking(e.target.value)}
            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 font-mono"
            autoFocus
            onKeyDown={e => {
              if (e.key === "Enter" && tracking.trim()) onConfirm(tracking.trim());
            }}
          />
          <p className="text-xs text-slate-500">กด Enter หรือคลิก "ยืนยัน" เพื่อบันทึก</p>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            ยกเลิก
          </Button>
          <Button
            size="sm"
            disabled={!tracking.trim() || isLoading}
            onClick={() => onConfirm(tracking.trim())}
            className="bg-cyan-500 text-slate-900 hover:bg-cyan-400 font-semibold"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            ยืนยัน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Inline Status Selector ───────────────────────────────────────────────────

function InlineStatusSelect({
  order,
  onStatusChange,
  isUpdating,
}: {
  order: OrderWithItems;
  onStatusChange: (orderId: number, status: OrderStatus, trackingNumber?: string) => void;
  isUpdating: boolean;
}) {
  const handleChange = (value: string) => {
    const newStatus = value as OrderStatus;
    if (newStatus === order.status) return;
    onStatusChange(order.id, newStatus);
  };

  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, className: "bg-slate-700 text-slate-300 border-slate-600", dotColor: "bg-slate-400" };

  return (
    <div className="flex flex-col gap-1">
      <Select value={order.status} onValueChange={handleChange} disabled={isUpdating}>
        <SelectTrigger
          className={`h-7 w-[130px] border text-xs font-medium px-2 gap-1.5 ${statusCfg.className} hover:opacity-90 focus:ring-1 focus:ring-amber-500/50 disabled:cursor-wait`}
        >
          {isUpdating ? (
            <Loader2 className="h-3 w-3 animate-spin flex-shrink-0" />
          ) : (
            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${statusCfg.dotColor}`} />
          )}
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700 min-w-[140px]">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <SelectItem key={key} value={key} className="text-xs text-white focus:bg-slate-700 focus:text-white">
              <span className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cfg.dotColor}`} />
                {cfg.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {order.trackingNumber && (
        <p className="text-xs text-slate-500 font-mono truncate max-w-[130px]" title={order.trackingNumber}>
          {order.trackingNumber}
        </p>
      )}
    </div>
  );
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
  isUpdating,
}: {
  order: OrderWithItems;
  onClose: () => void;
  onStatusChange: (orderId: number, status: OrderStatus) => void;
  isUpdating: boolean;
}) {
  const [slipOpen, setSlipOpen] = useState(false);
  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, className: "bg-slate-700 text-slate-300 border-slate-600", dotColor: "bg-slate-400" };
  const subtotal = Number(order.subtotal);
  const discount = Number(order.discountAmount);
  const total = Number(order.totalAmount);

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-2xl border-slate-700 bg-slate-950 p-0 overflow-hidden max-h-[90vh] flex flex-col">
          {/* ── Modal Header ── */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-mono text-lg font-bold text-amber-400">{order.orderNumber}</h2>
                <Badge variant="outline" className={`text-xs font-medium ${statusCfg.className}`}>
                  <span className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${statusCfg.dotColor}`} />
                  {statusCfg.label}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">{formatDateLong(order.createdAt)}</p>
            </div>
            {/* Status changer inside modal */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Select
                value={order.status}
                onValueChange={v => onStatusChange(order.id, v as OrderStatus)}
                disabled={isUpdating}
              >
                <SelectTrigger className="h-8 w-[140px] border border-slate-600 bg-slate-800 text-xs text-white gap-1.5 focus:ring-1 focus:ring-amber-500/50">
                  {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key} className="text-xs text-white focus:bg-slate-700">
                      <span className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />
                        {cfg.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Scrollable Body ── */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

            {/* Customer Info */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                <User className="h-3.5 w-3.5" />
                ข้อมูลลูกค้า
              </h3>
              <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2.5">
                  <User className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400/70" />
                  <div>
                    <p className="text-xs text-slate-500">ชื่อ-นามสกุล</p>
                    <p className="text-sm font-medium text-white">{order.customerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400/70" />
                  <div>
                    <p className="text-xs text-slate-500">เบอร์โทรศัพท์</p>
                    <p className="text-sm font-medium text-white">{order.customerPhone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400/70" />
                  <div>
                    <p className="text-xs text-slate-500">อีเมล</p>
                    <p className="text-sm font-medium text-white break-all">{order.customerEmail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400/70" />
                  <div>
                    <p className="text-xs text-slate-500">ที่อยู่จัดส่ง</p>
                    <p className="text-sm font-medium text-white leading-relaxed">{order.customerAddress}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Order Items */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                <BookOpen className="h-3.5 w-3.5" />
                รายการหนังสือ ({order.items.length} รายการ)
              </h3>
              <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/60 bg-slate-800/50">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">หนังสือ</th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">จำนวน</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">ราคา/ชิ้น</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">รวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => (
                      <tr key={item.id} className={`border-b border-slate-700/40 ${idx % 2 === 0 ? "" : "bg-slate-800/20"}`}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-white leading-tight">{item.bookTitleTh}</p>
                          <p className="text-xs text-slate-500 mt-0.5 italic">{item.bookTitleEn}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center rounded-md bg-slate-700 px-2 py-0.5 text-xs font-bold text-amber-400">
                            ×{item.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-300 whitespace-nowrap">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-white whitespace-nowrap">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Payment Summary */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                <CreditCard className="h-3.5 w-3.5" />
                สรุปการชำระเงิน
              </h3>
              <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">ยอดรวมสินค้า</span>
                  <span className="text-white">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-green-400">
                      <Tag className="h-3.5 w-3.5" />
                      ส่วนลด Volume Discount
                      {order.discountTier && (
                        <span className="ml-1 text-xs bg-amber-500/15 text-amber-400 border border-amber-500/25 px-1.5 py-0.5 rounded-full">
                          {order.discountTier}
                        </span>
                      )}
                    </span>
                    <span className="text-green-400">-{formatCurrency(discount)}</span>
                  </div>
                )}
                {order.shippingFee !== undefined && order.shippingFee !== null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Truck className="h-3.5 w-3.5" />
                      ค่าจัดส่ง
                    </span>
                    <span className={Number(order.shippingFee) === 0 ? "text-green-400 font-semibold" : "text-slate-300"}>
                      {Number(order.shippingFee) === 0 ? "ฟรี" : formatCurrency(order.shippingFee)}
                    </span>
                  </div>
                )}
                <Separator className="bg-slate-700/60" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">ยอดสุทธิ</span>
                  <span className="text-xl font-bold text-amber-400">{formatCurrency(total)}</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-1">
                  <span className="text-slate-400">วิธีชำระเงิน</span>
                  <span className="rounded-md bg-slate-700/60 px-2 py-0.5 text-xs font-medium text-slate-200">
                    {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                  </span>
                </div>
              </div>
            </section>

            {/* Shipping Info */}
            {(order.trackingNumber || order.status === "shipped" || order.status === "delivered") && (
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  <Package className="h-3.5 w-3.5" />
                  ข้อมูลการจัดส่ง
                </h3>
                <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4">
                  {order.trackingNumber ? (
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">เลขพัสดุ</p>
                        <p className="font-mono text-base font-bold text-cyan-400">{order.trackingNumber}</p>
                      </div>
                      <a
                        href={`https://track.thailandpost.co.th/?trackNumber=${order.trackingNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        ติดตามพัสดุ
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">ยังไม่ได้กรอกเลขพัสดุ</p>
                  )}
                </div>
              </section>
            )}

            {/* Slip Image */}
            {order.slipUrl && (
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  <FileImage className="h-3.5 w-3.5" />
                  หลักฐานการโอนเงิน
                </h3>
                <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                  {/\.(jpg|jpeg|png|webp)$/i.test(order.slipUrl) ? (
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                      <button
                        onClick={() => setSlipOpen(true)}
                        className="relative overflow-hidden rounded-lg border border-green-500/30 transition-all hover:border-green-400/50 hover:shadow-lg hover:shadow-green-500/10"
                      >
                        <img
                          src={order.slipUrl}
                          alt="สลิปการโอนเงิน"
                          className="h-24 w-20 object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                          <Eye className="h-6 w-6 text-white" />
                        </div>
                      </button>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-green-400">อัปโหลดสลิปแล้ว</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSlipOpen(true)}
                            className="h-7 gap-1.5 border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            ดูสลิป
                          </Button>
                          <a
                            href={order.slipUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-7 items-center gap-1.5 rounded-md border border-slate-600 bg-slate-800 px-2.5 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            เปิดในแท็บใหม่
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <FileImage className="h-8 w-8 text-green-400/60" />
                      <div>
                        <p className="text-sm font-medium text-green-400">อัปโหลดไฟล์แล้ว (PDF)</p>
                        <a
                          href={order.slipUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-400 underline hover:text-white"
                        >
                          เปิดดูไฟล์
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Notes */}
            {order.notes && (
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  <StickyNote className="h-3.5 w-3.5" />
                  หมายเหตุ
                </h3>
                <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4">
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{order.notes}</p>
                </div>
              </section>
            )}
          </div>

          {/* ── Modal Footer ── */}
          <div className="border-t border-slate-700/60 bg-slate-900/80 px-6 py-3 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              ปิด
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Slip full-size viewer */}
      {slipOpen && order.slipUrl && (
        <SlipModal url={order.slipUrl} onClose={() => setSlipOpen(false)} />
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminOrderSummary() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [page, setPage] = useState(1);
  const [slipUrl, setSlipUrl] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<OrderWithItems | null>(null);

  // Tracking dialog state
  const [trackingDialog, setTrackingDialog] = useState<{
    orderId: number;
    orderNumber: string;
    currentTracking: string | null;
  } | null>(null);

  // Track which order is being updated
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const LIMIT = 50;
  const dateParams = useMemo(() => getDateRange(dateRange), [dateRange]);
  const utils = trpc.useUtils();

  const kpiQuery = trpc.admin.orderSummaryKPIs.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  const listQuery = trpc.admin.orderSummaryList.useQuery(
    {
      search: search || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      dateFrom: dateParams.dateFrom,
      dateTo: dateParams.dateTo,
      page,
      limit: LIMIT,
    },
    { placeholderData: (prev: any) => prev }
  );

  const orders = (listQuery.data?.orders ?? []) as OrderWithItems[];
  const total = listQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  // Keep detailOrder in sync with fresh data after status updates
  const syncedDetailOrder = useMemo(() => {
    if (!detailOrder) return null;
    return orders.find(o => o.id === detailOrder.id) ?? detailOrder;
  }, [detailOrder, orders]);

  // ─── Status Update Mutation ───────────────────────────────────────────────

  const updateStatusMutation = trpc.admin.updateStatus.useMutation({
    onSuccess: (_, variables) => {
      const statusLabel = STATUS_CONFIG[variables.status]?.label ?? variables.status;
      toast.success(`อัปเดตสถานะเป็น "${statusLabel}" แล้ว`);
      utils.admin.orderSummaryList.invalidate();
      utils.admin.orderSummaryKPIs.invalidate();
      setUpdatingOrderId(null);
      setTrackingDialog(null);
    },
    onError: (err) => {
      toast.error(`เกิดข้อผิดพลาด: ${err.message}`);
      setUpdatingOrderId(null);
      setTrackingDialog(null);
    },
  });

  const handleStatusChange = useCallback(
    (orderId: number, status: OrderStatus, trackingNumber?: string) => {
      if (status === "shipped" && !trackingNumber) {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          setTrackingDialog({
            orderId,
            orderNumber: order.orderNumber,
            currentTracking: order.trackingNumber,
          });
        }
        return;
      }
      setUpdatingOrderId(orderId);
      updateStatusMutation.mutate({ id: orderId, status, trackingNumber });
    },
    [orders, updateStatusMutation]
  );

  const handleTrackingConfirm = useCallback(
    (trackingNumber: string) => {
      if (!trackingDialog) return;
      setUpdatingOrderId(trackingDialog.orderId);
      updateStatusMutation.mutate({
        id: trackingDialog.orderId,
        status: "shipped",
        trackingNumber,
      });
    },
    [trackingDialog, updateStatusMutation]
  );

  // ─── CSV Export ───────────────────────────────────────────────────────────

  const handleExportCSV = useCallback(() => {
    if (!orders.length) return;
    const headers = [
      "เลขออเดอร์", "วันที่-เวลา",
      "ชื่อลูกค้า", "เบอร์โทร", "อีเมล", "ที่อยู่",
      "รายการหนังสือ", "ยอดรวม", "ส่วนลด", "ยอดสุทธิ",
      "วิธีชำระ", "สถานะ", "เลขพัสดุ", "มีสลิป",
    ];
    const rows = orders.map(o => {
      const bookList = o.items.map(i => `${i.bookTitleTh} x${i.quantity}`).join(" | ");
      return [
        o.orderNumber,
        formatDate(o.createdAt),
        o.customerName,
        o.customerPhone,
        o.customerEmail,
        `"${o.customerAddress.replace(/"/g, '""')}"`,
        `"${bookList}"`,
        o.subtotal,
        o.discountAmount,
        o.totalAmount,
        PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod,
        STATUS_CONFIG[o.status]?.label ?? o.status,
        o.trackingNumber ?? "",
        o.slipUrl ? "มี" : "ไม่มี",
      ].join(",");
    });
    const bom = "\uFEFF";
    const csv = bom + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [orders]);

  // ─── Filter handlers ──────────────────────────────────────────────────────

  const handleSearchChange = (v: string) => { setSearch(v); setPage(1); };
  const handleStatusFilterChange = (v: string) => { setStatusFilter(v); setPage(1); };
  const handleDateRangeChange = (v: DateRange) => { setDateRange(v); setPage(1); };

  const kpi = kpiQuery.data;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        {/* ── Header ── */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">สรุปยอดคำสั่งซื้อ</h1>
            <p className="mt-0.5 text-sm text-slate-400">จัดการสถานะออเดอร์ได้โดยตรงจากตาราง · อัปเดตอัตโนมัติทุก 30 วินาที</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white"
            onClick={() => { kpiQuery.refetch(); listQuery.refetch(); }}
          >
            <RefreshCw className={`h-4 w-4 ${listQuery.isFetching ? "animate-spin" : ""}`} />
            รีเฟรช
          </Button>
        </div>

        {/* ── KPI Cards ── */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KPICard
            icon={TrendingUp}
            label="ยอดขายวันนี้"
            value={kpi ? formatCurrency(kpi.todayRevenue) : "—"}
            sub="เฉพาะออเดอร์ที่ไม่ถูกยกเลิก"
            color="bg-amber-500"
            loading={kpiQuery.isLoading}
          />
          <KPICard
            icon={ShoppingBag}
            label="ออเดอร์ทั้งหมด"
            value={kpi?.totalOrders ?? "—"}
            sub="ไม่รวมที่ถูกยกเลิก"
            color="bg-blue-500"
            loading={kpiQuery.isLoading}
          />
          <KPICard
            icon={Clock}
            label="รอดำเนินการ"
            value={kpi?.pendingOrders ?? "—"}
            sub="สถานะ 'รอชำระ'"
            color="bg-orange-500"
            loading={kpiQuery.isLoading}
          />
          <KPICard
            icon={FileImage}
            label="มีสลิป รอตรวจ"
            value={kpi?.ordersWithSlip ?? "—"}
            sub="อัปโหลดสลิปแล้ว ยังไม่ยืนยัน"
            color="bg-green-500"
            loading={kpiQuery.isLoading}
          />
        </div>

        {/* ── Filter Bar ── */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="ค้นหาชื่อ / เลขออเดอร์ / อีเมล / เบอร์โทร"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              className="pl-9 bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500/50"
            />
            {search && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-40 bg-slate-800/60 border-slate-700 text-white">
              <SelectValue placeholder="สถานะทั้งหมด" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-white">สถานะทั้งหมด</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key} className="text-white">{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={v => handleDateRangeChange(v as DateRange)}>
            <SelectTrigger className="w-36 bg-slate-800/60 border-slate-700 text-white">
              <Calendar className="mr-2 h-4 w-4 text-slate-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="today" className="text-white">วันนี้</SelectItem>
              <SelectItem value="7days" className="text-white">7 วันล่าสุด</SelectItem>
              <SelectItem value="30days" className="text-white">30 วันล่าสุด</SelectItem>
              <SelectItem value="all" className="text-white">ทั้งหมด</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleExportCSV}
            disabled={!orders.length}
            className="gap-2 bg-amber-500 text-slate-900 hover:bg-amber-400 font-semibold disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            ดาวน์โหลด CSV
          </Button>
        </div>

        {/* ── Result Count ── */}
        <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
          <span>
            {listQuery.isFetching ? (
              <span className="animate-pulse">กำลังโหลด...</span>
            ) : (
              <>พบ <span className="font-semibold text-white">{total.toLocaleString()}</span> รายการ</>
            )}
          </span>
          {total > 0 && <span>หน้า {page} / {totalPages}</span>}
        </div>

        {/* ── Inline update hint ── */}
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-amber-400" />
          <p className="text-xs text-amber-300/80">
            คลิก dropdown ในคอลัมน์ <strong>สถานะ</strong> เพื่ออัปเดตได้ทันที · คลิก <strong>ดูรายละเอียด</strong> เพื่อดูข้อมูลออเดอร์ครบถ้วน
          </p>
        </div>

        {/* ── Table ── */}
        <div className="overflow-hidden rounded-xl border border-white/8 bg-slate-900/60 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700/60 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">เลขออเดอร์</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">วันที่-เวลา</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs uppercase tracking-wider">ลูกค้า</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs uppercase tracking-wider">รายการหนังสือ</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs uppercase tracking-wider text-right whitespace-nowrap">ยอดสุทธิ</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">วิธีชำระ</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs uppercase tracking-wider">สถานะ</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs uppercase tracking-wider text-center">สลิป</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs uppercase tracking-wider text-center">รายละเอียด</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listQuery.isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} className="border-slate-700/40">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 animate-pulse rounded bg-slate-700/60" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-16 text-center text-slate-500">
                      <ShoppingBag className="mx-auto mb-3 h-10 w-10 opacity-30" />
                      <p className="text-sm">ไม่พบรายการคำสั่งซื้อ</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map(order => {
                    const isUpdating = updatingOrderId === order.id;
                    return (
                      <TableRow
                        key={order.id}
                        className={`border-slate-700/40 transition-colors ${isUpdating ? "bg-slate-800/60" : "hover:bg-slate-800/40"}`}
                      >
                        {/* Order Number */}
                        <TableCell className="font-mono text-xs text-amber-400 whitespace-nowrap">
                          {order.orderNumber}
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-xs text-slate-300 whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </TableCell>

                        {/* Customer */}
                        <TableCell className="min-w-[160px]">
                          <p className="font-medium text-white text-sm leading-tight">{order.customerName}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{order.customerPhone}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[180px]">{order.customerEmail}</p>
                        </TableCell>

                        {/* Books */}
                        <TableCell className="min-w-[200px] max-w-[260px]">
                          {order.items.length === 0 ? (
                            <span className="text-xs text-slate-500">—</span>
                          ) : (
                            <div className="space-y-1">
                              {order.items.slice(0, 2).map(item => (
                                <div key={item.id} className="flex items-start gap-1.5">
                                  <span className="mt-0.5 flex-shrink-0 rounded bg-slate-700 px-1.5 py-0.5 text-xs font-bold text-amber-400">
                                    ×{item.quantity}
                                  </span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-xs text-slate-300 line-clamp-1 cursor-default">
                                        {item.bookTitleTh}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-800 border-slate-700 text-white max-w-xs">
                                      <p className="font-medium">{item.bookTitleTh}</p>
                                      <p className="text-xs text-slate-400">{item.bookTitleEn}</p>
                                      <p className="text-xs text-amber-400 mt-1">฿{item.unitPrice} × {item.quantity} = ฿{item.subtotal}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <span className="text-xs text-slate-500">+{order.items.length - 2} รายการอื่น</span>
                              )}
                            </div>
                          )}
                        </TableCell>

                        {/* Total */}
                        <TableCell className="text-right whitespace-nowrap">
                          <p className="font-bold text-white text-sm">{formatCurrency(order.totalAmount)}</p>
                          {Number(order.discountAmount) > 0 && (
                            <p className="text-xs text-green-400">-{formatCurrency(order.discountAmount)}</p>
                          )}
                          {order.discountTier && (
                            <span className="inline-block mt-0.5 text-xs bg-amber-500/15 text-amber-400 border border-amber-500/25 px-1.5 py-0.5 rounded-full font-medium">
                              {order.discountTier}
                            </span>
                          )}
                        </TableCell>

                        {/* Payment Method */}
                        <TableCell className="whitespace-nowrap">
                          <span className="text-xs text-slate-300">
                            {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                          </span>
                        </TableCell>

                        {/* Status — Inline Editable */}
                        <TableCell>
                          <InlineStatusSelect
                            order={order}
                            onStatusChange={handleStatusChange}
                            isUpdating={isUpdating}
                          />
                        </TableCell>

                        {/* Slip */}
                        <TableCell className="text-center">
                          {order.slipUrl ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => setSlipUrl(order.slipUrl!)}
                                  className="inline-flex items-center justify-center rounded-lg bg-green-500/15 border border-green-500/30 p-2 text-green-400 hover:bg-green-500/25 transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-slate-800 border-slate-700 text-white">
                                คลิกดูสลิป
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-slate-600 text-xs">—</span>
                          )}
                        </TableCell>

                        {/* View Details */}
                        <TableCell className="text-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDetailOrder(order)}
                                className="h-8 w-8 p-0 border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-amber-500/15 hover:border-amber-500/40 hover:text-amber-400 transition-all"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-800 border-slate-700 text-white">
                              ดูรายละเอียดออเดอร์
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="gap-1 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              ก่อนหน้า
            </Button>
            <span className="text-sm text-slate-400">
              หน้า <span className="font-semibold text-white">{page}</span> / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="gap-1 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30"
            >
              ถัดไป
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* ── Slip Modal (standalone) ── */}
      {slipUrl && <SlipModal url={slipUrl} onClose={() => setSlipUrl(null)} />}

      {/* ── Order Detail Modal ── */}
      {syncedDetailOrder && (
        <OrderDetailModal
          order={syncedDetailOrder}
          onClose={() => setDetailOrder(null)}
          onStatusChange={handleStatusChange}
          isUpdating={updatingOrderId === syncedDetailOrder.id}
        />
      )}

      {/* ── Tracking Number Dialog ── */}
      {trackingDialog && (
        <TrackingDialog
          orderNumber={trackingDialog.orderNumber}
          currentTracking={trackingDialog.currentTracking}
          onConfirm={handleTrackingConfirm}
          onCancel={() => setTrackingDialog(null)}
          isLoading={updateStatusMutation.isPending}
        />
      )}
    </TooltipProvider>
  );
}
