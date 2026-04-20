import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Truck,
  Search,
  Package,
  CheckCircle,
  Eye,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const shippingStatuses = ["paid", "processing", "shipped", "delivered"];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  paid: { label: "ชำระแล้ว รอเตรียม", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: CheckCircle },
  processing: { label: "กำลังเตรียม", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: Package },
  shipped: { label: "จัดส่งแล้ว", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", icon: Truck },
  delivered: { label: "ส่งถึงแล้ว", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle },
};

export default function AdminShipping() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("shipped");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [trackingInput, setTrackingInput] = useState("");

  const { data, isLoading, refetch } = trpc.admin.listOrders.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: search || undefined,
    page: 1,
    limit: 50,
  });

  const { data: selectedOrder } = trpc.admin.getOrder.useQuery(
    { id: selectedOrderId! },
    { enabled: selectedOrderId !== null }
  );

  const updateStatus = trpc.admin.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("อัปเดตสถานะสำเร็จ");
      refetch();
      setSelectedOrderId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleUpdateTracking = (orderId: number, newStatus: string) => {
    updateStatus.mutate({
      id: orderId,
      status: newStatus as any,
      trackingNumber: trackingInput || undefined,
    });
  };

  const openThaiPost = (trackingNumber: string) => {
    window.open(`https://track.thailandpost.co.th/?trackNumber=${trackingNumber}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">ติดตามการจัดส่ง</h1>
          <p className="text-gray-400 text-sm mt-1">จัดการสถานะการจัดส่งพัสดุ</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          className="text-gray-400 hover:text-white hover:bg-slate-700"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {shippingStatuses.map(status => {
          const cfg = statusConfig[status];
          const Icon = cfg.icon;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`p-4 rounded-lg border transition-all text-left ${
                statusFilter === status
                  ? `${cfg.color} ring-1 ring-current`
                  : "bg-slate-800 border-slate-700 hover:border-slate-600"
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${statusFilter === status ? "" : "text-gray-400"}`} />
              <p className={`text-sm font-medium ${statusFilter === status ? "" : "text-gray-300"}`}>{cfg.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="ค้นหาเลขที่คำสั่งซื้อ, ชื่อ..."
                value={search}
                onChange={e => { setSearch(e.target.value); }}
                className="pl-9 bg-slate-700 border-slate-600 text-white placeholder:text-gray-500 focus:border-amber-400"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all" className="text-white focus:bg-slate-700">ทุกสถานะ</SelectItem>
                {shippingStatuses.map(s => (
                  <SelectItem key={s} value={s} className="text-white focus:bg-slate-700">
                    {statusConfig[s]?.label ?? s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">
            รายการ ({data?.total ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-700 rounded animate-pulse" />
              ))}
            </div>
          ) : !data?.orders.length ? (
            <div className="text-center py-12 text-gray-500">
              <Truck className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>ไม่พบรายการ</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {data.orders.map(order => {
                const cfg = statusConfig[order.status];
                return (
                  <div key={order.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-amber-400 font-mono text-sm">{order.orderNumber}</span>
                          {cfg && <Badge className={`text-xs border ${cfg.color}`}>{cfg.label}</Badge>}
                        </div>
                        <p className="text-white text-sm">{order.customerName}</p>
                        <p className="text-gray-400 text-xs">{order.customerPhone}</p>
                        <p className="text-gray-500 text-xs mt-1 line-clamp-1">{order.customerAddress}</p>
                        {order.trackingNumber && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-gray-400 text-xs">พัสดุ:</span>
                            <span className="text-amber-400 font-mono text-xs">{order.trackingNumber}</span>
                            <button
                              onClick={() => openThaiPost(order.trackingNumber!)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setLocation(`/orders/${order.id}`)}
                          className="text-gray-400 hover:text-white hover:bg-slate-600 h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {order.status === "paid" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus.mutate({ id: order.id, status: "processing" })}
                            className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 text-xs h-8"
                          >
                            <Package className="w-3 h-3 mr-1" />
                            เตรียม
                          </Button>
                        )}
                        {order.status === "processing" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setTrackingInput(order.trackingNumber ?? "");
                            }}
                            className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 text-xs h-8"
                          >
                            <Truck className="w-3 h-3 mr-1" />
                            จัดส่ง
                          </Button>
                        )}
                        {order.status === "shipped" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus.mutate({ id: order.id, status: "delivered" })}
                            className="bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30 text-xs h-8"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            ส่งถึง
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracking Number Dialog */}
      <Dialog open={selectedOrderId !== null} onOpenChange={open => { if (!open) setSelectedOrderId(null); }}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">ยืนยันการจัดส่ง</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <p className="text-amber-400 font-mono text-sm">{selectedOrder.orderNumber}</p>
                <p className="text-white text-sm mt-1">{selectedOrder.customerName}</p>
                <p className="text-gray-400 text-xs">{selectedOrder.customerAddress}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">หมายเลขพัสดุ (ไปรษณีย์ไทย)</label>
                <Input
                  value={trackingInput}
                  onChange={e => setTrackingInput(e.target.value)}
                  placeholder="เช่น EF123456789TH"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-500 focus:border-amber-400 font-mono"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedOrderId(null)}
                  className="flex-1 text-gray-400 hover:text-white hover:bg-slate-700"
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={() => handleUpdateTracking(selectedOrderId!, "shipped")}
                  disabled={updateStatus.isPending}
                  className="flex-1 bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  ยืนยันจัดส่ง
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
