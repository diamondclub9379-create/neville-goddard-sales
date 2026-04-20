import { trpc } from "@/lib/trpc";
import { useState, useCallback } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  Clock,
  Package,
  Truck,
  XCircle,
  RefreshCw,
  Loader2,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  BookOpen,
  FileImage,
  StickyNote,
  ExternalLink,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

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

const STATUS_CONFIG: Record<string, { label: string; color: string; dotColor: string; icon: React.ElementType }> = {
  pending:    { label: "รอชำระเงิน",  color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",  dotColor: "bg-yellow-400",  icon: Clock },
  paid:       { label: "ชำระแล้ว",    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",         dotColor: "bg-blue-400",    icon: CheckCircle },
  processing: { label: "กำลังเตรียม", color: "bg-purple-500/10 text-purple-400 border-purple-500/20",   dotColor: "bg-purple-400",  icon: Package },
  shipped:    { label: "จัดส่งแล้ว",  color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",   dotColor: "bg-indigo-400",  icon: Truck },
  delivered:  { label: "ส่งถึงแล้ว",  color: "bg-green-500/10 text-green-400 border-green-500/20",      dotColor: "bg-green-400",   icon: CheckCircle },
  cancelled:  { label: "ยกเลิก",      color: "bg-red-500/10 text-red-400 border-red-500/20",            dotColor: "bg-red-400",     icon: XCircle },
};

const PAYMENT_LABELS: Record<string, string> = {
  "bank-transfer": "โอนธนาคาร",
  promptpay: "PromptPay",
};

function formatCurrency(v: string | number) {
  return `฿${Number(v).toLocaleString("th-TH", { minimumFractionDigits: 0 })}`;
}

function formatDateLong(d: Date | string) {
  return new Date(d).toLocaleDateString("th-TH", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
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
            <img src={url} alt="สลิปการโอนเงิน" className="max-h-[60vh] w-full rounded-lg object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-slate-400">
              <FileImage className="h-16 w-16 opacity-40" />
              <p>ไฟล์ PDF — ไม่สามารถแสดงตัวอย่างได้</p>
            </div>
          )}
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="text-sm text-amber-400 underline underline-offset-2 hover:text-amber-300">
            เปิดในแท็บใหม่ →
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tracking Number Dialog ───────────────────────────────────────────────────

function TrackingDialog({
  orderNumber, currentTracking, onConfirm, onCancel, isLoading,
}: {
  orderNumber: string;
  currentTracking: string | null;
  onConfirm: (t: string) => void;
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
          <p className="text-sm text-slate-400">ออเดอร์ <span className="font-mono text-amber-400">{orderNumber}</span></p>
          <Input
            placeholder="เช่น EF123456789TH"
            value={tracking}
            onChange={e => setTracking(e.target.value)}
            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 font-mono"
            autoFocus
            onKeyDown={e => { if (e.key === "Enter" && tracking.trim()) onConfirm(tracking.trim()); }}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}
            className="border-slate-600 text-slate-300 hover:bg-slate-800">ยกเลิก</Button>
          <Button size="sm" disabled={!tracking.trim() || isLoading} onClick={() => onConfirm(tracking.trim())}
            className="bg-cyan-500 text-slate-900 hover:bg-cyan-400 font-semibold">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            ยืนยัน
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────

function OrderDetailModal({
  order, onClose, onStatusChange, isUpdating,
}: {
  order: OrderWithItems;
  onClose: () => void;
  onStatusChange: (orderId: number, status: OrderStatus) => void;
  isUpdating: boolean;
}) {
  const [slipOpen, setSlipOpen] = useState(false);
  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: "bg-slate-700 text-slate-300 border-slate-600", dotColor: "bg-slate-400", icon: Clock };
  const subtotal = Number(order.subtotal);
  const discount = Number(order.discountAmount);
  const total = Number(order.totalAmount);

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-2xl border-slate-700 bg-slate-950 p-0 overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-mono text-lg font-bold text-amber-400">{order.orderNumber}</h2>
                <Badge variant="outline" className={`text-xs font-medium ${statusCfg.color}`}>
                  <span className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${statusCfg.dotColor}`} />
                  {statusCfg.label}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">{formatDateLong(order.createdAt)}</p>
            </div>
            <Select value={order.status} onValueChange={v => onStatusChange(order.id, v as OrderStatus)} disabled={isUpdating}>
              <SelectTrigger className="h-8 w-[140px] border border-slate-600 bg-slate-800 text-xs text-white gap-1.5 focus:ring-1 focus:ring-amber-500/50">
                {isUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
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

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

            {/* Customer Info */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                <User className="h-3.5 w-3.5" /> ข้อมูลลูกค้า
              </h3>
              <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: User, label: "ชื่อ-นามสกุล", value: order.customerName },
                  { icon: Phone, label: "เบอร์โทรศัพท์", value: order.customerPhone },
                  { icon: Mail, label: "อีเมล", value: order.customerEmail },
                  { icon: MapPin, label: "ที่อยู่จัดส่ง", value: order.customerAddress },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400/70" />
                    <div>
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="text-sm font-medium text-white break-all">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Order Items */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                <BookOpen className="h-3.5 w-3.5" /> รายการหนังสือ ({order.items.length} รายการ)
              </h3>
              <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/60 bg-slate-800/50">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">หนังสือ</th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">จำนวน</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">ราคา/ชิ้น</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">รวม</th>
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
                        <td className="px-4 py-3 text-right text-sm text-slate-300 whitespace-nowrap">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-white whitespace-nowrap">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Payment Summary */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                <CreditCard className="h-3.5 w-3.5" /> สรุปการชำระเงิน
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
                  <Package className="h-3.5 w-3.5" /> ข้อมูลการจัดส่ง
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
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> ติดตามพัสดุ
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
                  <FileImage className="h-3.5 w-3.5" /> หลักฐานการโอนเงิน
                </h3>
                <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                  {/\.(jpg|jpeg|png|webp)$/i.test(order.slipUrl) ? (
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                      <button
                        onClick={() => setSlipOpen(true)}
                        className="relative overflow-hidden rounded-lg border border-green-500/30 transition-all hover:border-green-400/50"
                      >
                        <img src={order.slipUrl} alt="สลิป" className="h-24 w-20 object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                          <Eye className="h-6 w-6 text-white" />
                        </div>
                      </button>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-green-400">อัปโหลดสลิปแล้ว</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSlipOpen(true)}
                            className="h-7 gap-1.5 border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs">
                            <Eye className="h-3.5 w-3.5" /> ดูสลิป
                          </Button>
                          <a href={order.slipUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex h-7 items-center gap-1.5 rounded-md border border-slate-600 bg-slate-800 px-2.5 text-xs text-slate-300 hover:bg-slate-700 transition-colors">
                            <ExternalLink className="h-3.5 w-3.5" /> เปิดในแท็บใหม่
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <FileImage className="h-8 w-8 text-green-400/60" />
                      <div>
                        <p className="text-sm font-medium text-green-400">อัปโหลดไฟล์แล้ว (PDF)</p>
                        <a href={order.slipUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-slate-400 underline hover:text-white">เปิดดูไฟล์</a>
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
                  <StickyNote className="h-3.5 w-3.5" /> หมายเหตุ
                </h3>
                <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4">
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{order.notes}</p>
                </div>
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-700/60 bg-slate-900/80 px-6 py-3 flex justify-end">
            <Button variant="outline" size="sm" onClick={onClose}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
              ปิด
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {slipOpen && order.slipUrl && (
        <SlipModal url={order.slipUrl} onClose={() => setSlipOpen(false)} />
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminOrders() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Modal state
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [trackingDialog, setTrackingDialog] = useState<{
    orderId: number;
    orderNumber: string;
    currentTracking: string | null;
  } | null>(null);

  const utils = trpc.useUtils();

  const { data, isLoading, refetch } = trpc.admin.listOrders.useQuery({
    search: search || undefined,
    status: status !== "all" ? status : undefined,
    page,
    limit,
  });

  // Fetch full order detail (with items) when modal is open
  const detailQuery = trpc.admin.getOrder.useQuery(
    { id: detailOrderId! },
    { enabled: detailOrderId !== null }
  );

  const totalPages = Math.ceil((data?.total ?? 0) / limit);

  const handleSearch = (value: string) => { setSearch(value); setPage(1); };
  const handleStatusFilter = (value: string) => { setStatus(value); setPage(1); };

  // ─── Status update mutation ───────────────────────────────────────────────

  const updateStatusMutation = trpc.admin.updateStatus.useMutation({
    onSuccess: (_, variables) => {
      const label = STATUS_CONFIG[variables.status]?.label ?? variables.status;
      toast.success(`อัปเดตสถานะเป็น "${label}" แล้ว`);
      utils.admin.listOrders.invalidate();
      if (detailOrderId !== null) utils.admin.getOrder.invalidate({ id: detailOrderId });
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
    (orderId: number, newStatus: OrderStatus, trackingNumber?: string) => {
      if (newStatus === "shipped" && !trackingNumber) {
        const order = data?.orders.find(o => o.id === orderId);
        setTrackingDialog({
          orderId,
          orderNumber: order?.orderNumber ?? `#${orderId}`,
          currentTracking: (order as any)?.trackingNumber ?? null,
        });
        return;
      }
      setUpdatingOrderId(orderId);
      updateStatusMutation.mutate({ id: orderId, status: newStatus, trackingNumber });
    },
    [data?.orders, updateStatusMutation]
  );

  const handleTrackingConfirm = useCallback(
    (trackingNumber: string) => {
      if (!trackingDialog) return;
      setUpdatingOrderId(trackingDialog.orderId);
      updateStatusMutation.mutate({ id: trackingDialog.orderId, status: "shipped", trackingNumber });
    },
    [trackingDialog, updateStatusMutation]
  );

  // Build full order object for modal (merges list row + detail query)
  const detailOrder: OrderWithItems | null = detailQuery.data
    ? {
        ...(detailQuery.data as any),
        items: (detailQuery.data as any).items ?? [],
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">คำสั่งซื้อ</h1>
          <p className="text-gray-400 text-sm mt-1">{data?.total ?? 0} คำสั่งซื้อทั้งหมด</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()}
          className="text-gray-400 hover:text-white hover:bg-slate-700">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="ค้นหาเลขที่คำสั่งซื้อ, ชื่อ, อีเมล..."
                value={search}
                onChange={e => handleSearch(e.target.value)}
                className="pl-9 bg-slate-700 border-slate-600 text-white placeholder:text-gray-500 focus:border-amber-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500 shrink-0" />
              <Select value={status} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-44 bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white focus:bg-slate-700">ทุกสถานะ</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key} className="text-white focus:bg-slate-700">{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-700 rounded animate-pulse" />
              ))}
            </div>
          ) : !data?.orders.length ? (
            <div className="text-center py-16 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>ไม่พบคำสั่งซื้อ</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">เลขที่</th>
                      <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">ลูกค้า</th>
                      <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">การชำระเงิน</th>
                      <th className="text-right text-gray-400 text-xs font-medium px-4 py-3">ยอดรวม</th>
                      <th className="text-center text-gray-400 text-xs font-medium px-4 py-3">สถานะ</th>
                      <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">วันที่</th>
                      <th className="px-4 py-3 text-center text-gray-400 text-xs font-medium">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.map(order => {
                      const config = STATUS_CONFIG[order.status];
                      return (
                        <tr key={order.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-amber-400 font-mono text-sm">{order.orderNumber}</span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-white text-sm">{order.customerName}</p>
                            <p className="text-gray-400 text-xs">{order.customerEmail}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-300 text-sm">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-white font-medium">฿{Number(order.totalAmount).toLocaleString()}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {config && (
                              <Badge className={`text-xs border ${config.color}`}>{config.label}</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-400 text-xs">
                              {new Date(order.createdAt).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "2-digit" })}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDetailOrderId(order.id)}
                              className="text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 h-8 w-8 p-0 transition-colors"
                              title="ดูรายละเอียด"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-slate-700">
                {data.orders.map(order => {
                  const config = STATUS_CONFIG[order.status];
                  return (
                    <button
                      key={order.id}
                      onClick={() => setDetailOrderId(order.id)}
                      className="w-full p-4 text-left hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-amber-400 font-mono text-sm">{order.orderNumber}</span>
                        {config && <Badge className={`text-xs border ${config.color}`}>{config.label}</Badge>}
                      </div>
                      <p className="text-white text-sm">{order.customerName}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-400 text-xs">
                          {new Date(order.createdAt).toLocaleDateString("th-TH")}
                        </span>
                        <span className="text-amber-400 font-medium text-sm">฿{Number(order.totalAmount).toLocaleString()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            หน้า {page} จาก {totalPages} ({data?.total} รายการ)
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="text-gray-400 hover:text-white hover:bg-slate-700 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              className="text-gray-400 hover:text-white hover:bg-slate-700 disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {detailOrderId !== null && (
        detailQuery.isLoading ? (
          <Dialog open onOpenChange={() => setDetailOrderId(null)}>
            <DialogContent className="max-w-sm border-slate-700 bg-slate-900">
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
                <p className="text-sm text-slate-400">กำลังโหลดข้อมูลออเดอร์...</p>
              </div>
            </DialogContent>
          </Dialog>
        ) : detailOrder ? (
          <OrderDetailModal
            order={detailOrder}
            onClose={() => setDetailOrderId(null)}
            onStatusChange={handleStatusChange}
            isUpdating={updatingOrderId === detailOrder.id}
          />
        ) : null
      )}

      {/* Tracking Number Dialog */}
      {trackingDialog && (
        <TrackingDialog
          orderNumber={trackingDialog.orderNumber}
          currentTracking={trackingDialog.currentTracking}
          onConfirm={handleTrackingConfirm}
          onCancel={() => setTrackingDialog(null)}
          isLoading={updateStatusMutation.isPending}
        />
      )}
    </div>
  );
}
