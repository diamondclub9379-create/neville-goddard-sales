import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Package,
  Truck,
  XCircle,
  Save,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  ImageIcon,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType; next?: string }> = {
  pending: { label: "รอชำระเงิน", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Clock, next: "paid" },
  paid: { label: "ชำระแล้ว", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: CheckCircle, next: "processing" },
  processing: { label: "กำลังเตรียม", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: Package, next: "shipped" },
  shipped: { label: "จัดส่งแล้ว", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", icon: Truck, next: "delivered" },
  delivered: { label: "ส่งถึงแล้ว", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle },
  cancelled: { label: "ยกเลิก", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle },
};

const paymentLabels: Record<string, string> = {
  "bank-transfer": "โอนธนาคาร",
  promptpay: "PromptPay",
};

const statusSteps = ["pending", "paid", "processing", "shipped", "delivered"];

export default function AdminOrderDetail() {
  const params = useParams<{ id: string }>();
  const orderId = parseInt(params.id ?? "0");
  const [, setLocation] = useLocation();
  const { data: order, isLoading, refetch } = trpc.admin.getOrder.useQuery({ id: orderId });
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [notesInitialized, setNotesInitialized] = useState(false);

  if (order && !notesInitialized) {
    setNotes(order.notes ?? "");
    setTrackingNumber(order.trackingNumber ?? "");
    setNotesInitialized(true);
  }

  const updateStatus = trpc.admin.updateStatus.useMutation({
    onSuccess: () => {
      toast.success(`อัปเดตสถานะเป็น "${statusConfig[newStatus]?.label}" สำเร็จ`);
      refetch();
      setNewStatus("");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateNotes = trpc.admin.updateNotes.useMutation({
    onSuccess: () => {
      toast.success("บันทึกหมายเหตุสำเร็จ");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleUpdateStatus = () => {
    if (!newStatus) return;
    updateStatus.mutate({
      id: orderId,
      status: newStatus as any,
      trackingNumber: trackingNumber || undefined,
    });
  };

  const handleSaveNotes = () => {
    updateNotes.mutate({ id: orderId, notes });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">ไม่พบคำสั่งซื้อ</p>
        <Button onClick={() => setLocation("/orders")} className="mt-4 bg-amber-400 text-slate-900">
          กลับรายการ
        </Button>
      </div>
    );
  }

  const config = statusConfig[order.status];
  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/orders")}
          className="text-gray-400 hover:text-white hover:bg-slate-700 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          กลับ
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white font-mono">{order.orderNumber}</h1>
            {config && (
              <Badge className={`border ${config.color}`}>{config.label}</Badge>
            )}
          </div>
          <p className="text-gray-400 text-xs mt-1">
            {new Date(order.createdAt).toLocaleString("th-TH")}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      {order.status !== "cancelled" && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, i) => {
                const stepConfig = statusConfig[step];
                const Icon = stepConfig.icon;
                const isDone = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        isDone
                          ? isCurrent
                            ? "border-amber-400 bg-amber-400/20 text-amber-400"
                            : "border-green-500 bg-green-500/20 text-green-400"
                          : "border-slate-600 bg-slate-700 text-slate-500"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-xs text-center leading-tight hidden sm:block ${isDone ? isCurrent ? "text-amber-400" : "text-green-400" : "text-slate-500"}`}>
                        {stepConfig.label}
                      </span>
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${i < currentStepIndex ? "bg-green-500/50" : "bg-slate-700"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">รายการสินค้า</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items?.map(item => (
                <div key={item.id} className="flex gap-3 items-center p-3 bg-slate-700/50 rounded-lg">
                  <img src={item.bookImage} alt={item.bookTitleTh} className="w-10 h-14 object-cover rounded shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.bookTitleTh}</p>
                    <p className="text-gray-400 text-xs italic truncate">{item.bookTitleEn}</p>
                    <p className="text-gray-400 text-xs">฿{Number(item.unitPrice).toLocaleString()} × {item.quantity}</p>
                  </div>
                  <span className="text-amber-400 font-medium text-sm shrink-0">
                    ฿{Number(item.subtotal).toLocaleString()}
                  </span>
                </div>
              ))}

              <div className="border-t border-slate-700 pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">ราคาสินค้า</span>
                  <span className="text-white">฿{Number(order.subtotal).toLocaleString()}</span>
                </div>
                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">ส่วนลด</span>
                    <span className="text-green-400">-฿{Number(order.discountAmount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-1 border-t border-slate-700">
                  <span className="text-white">รวมทั้งสิ้น</span>
                  <span className="text-amber-400">฿{Number(order.totalAmount).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">หมายเหตุ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="เพิ่มหมายเหตุสำหรับคำสั่งซื้อนี้..."
                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-500 focus:border-amber-400 resize-none h-24"
              />
              <Button
                onClick={handleSaveNotes}
                disabled={updateNotes.isPending}
                size="sm"
                className="bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold"
              >
                <Save className="w-4 h-4 mr-2" />
                บันทึกหมายเหตุ
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">ข้อมูลลูกค้า</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 text-gray-400 shrink-0 mt-0.5">👤</div>
                <div>
                  <p className="text-white text-sm">{order.customerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm break-all">{order.customerEmail}</p>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm">{order.customerPhone}</p>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm leading-relaxed">{order.customerAddress}</p>
              </div>
              <div className="flex items-start gap-2">
                <CreditCard className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm">{paymentLabels[order.paymentMethod] ?? order.paymentMethod}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Slip */}
          {(order as any).slipUrl && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  หลักฐานการโอนเงิน
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Image preview */}
                {(order as any).slipUrl.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                  <a
                    href={(order as any).slipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group relative"
                  >
                    <img
                      src={(order as any).slipUrl}
                      alt="สลิปการโอนเงิน"
                      className="w-full max-h-64 object-contain rounded-lg border border-amber-400/20 bg-slate-900 group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black/60 rounded-lg px-3 py-2 flex items-center gap-2 text-white text-sm">
                        <ExternalLink className="w-4 h-4" /> ดูภาพเต็ม
                      </div>
                    </div>
                  </a>
                ) : (
                  <a
                    href={(order as any).slipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-amber-400"
                  >
                    <ImageIcon className="w-5 h-5 shrink-0" />
                    <span className="text-sm flex-1 truncate">ดูไฟล์สลิป (PDF)</span>
                    <ExternalLink className="w-4 h-4 shrink-0" />
                  </a>
                )}
                {(order as any).slipUploadedAt && (
                  <p className="text-gray-500 text-xs">
                    อัปโหลดเมื่อ: {new Date((order as any).slipUploadedAt).toLocaleString("th-TH")}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Update Status */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">อัปเดตสถานะ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="เลือกสถานะใหม่" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(statusConfig).map(([key, cfg]) => (
                    <SelectItem key={key} value={key} className="text-white focus:bg-slate-700">
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(newStatus === "shipped" || order.status === "shipped") && (
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">หมายเลขพัสดุ</label>
                  <Input
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    placeholder="เช่น EF123456789TH"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-500 focus:border-amber-400"
                  />
                </div>
              )}

              {order.trackingNumber && order.status !== "shipped" && (
                <div className="p-2 bg-slate-700/50 rounded text-xs">
                  <span className="text-gray-400">หมายเลขพัสดุ: </span>
                  <span className="text-amber-400 font-mono">{order.trackingNumber}</span>
                </div>
              )}

              <Button
                onClick={handleUpdateStatus}
                disabled={!newStatus || updateStatus.isPending}
                className="w-full bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold disabled:opacity-50"
              >
                {updateStatus.isPending ? "กำลังอัปเดต..." : "อัปเดตสถานะ"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
