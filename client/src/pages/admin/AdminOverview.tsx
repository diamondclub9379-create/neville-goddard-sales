import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import {
  BarChart3,
  Package,
  ShoppingCart,
  TrendingUp,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "รอชำระเงิน", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Clock },
  paid: { label: "ชำระแล้ว", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: CheckCircle },
  processing: { label: "กำลังเตรียม", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: Package },
  shipped: { label: "จัดส่งแล้ว", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", icon: Truck },
  delivered: { label: "ส่งถึงแล้ว", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle },
  cancelled: { label: "ยกเลิก", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle },
};

export default function AdminOverview() {
  const [, setLocation] = useLocation();
  const [dateRange] = useState<{ dateFrom?: Date; dateTo?: Date }>({});

  const { data: analytics, isLoading: analyticsLoading } = trpc.admin.analytics.useQuery(dateRange);
  const { data: recentOrdersData, isLoading: ordersLoading } = trpc.admin.listOrders.useQuery({
    page: 1,
    limit: 5,
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(amount);

  const statusBreakdown = analytics?.statusBreakdown;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">ภาพรวม</h1>
        <p className="text-gray-400 text-sm mt-1">ข้อมูลสรุปยอดขายและคำสั่งซื้อ</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm">รายได้รวม</p>
              <div className="w-9 h-9 bg-amber-400/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            {analyticsLoading ? (
              <div className="h-8 bg-slate-700 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-white">{formatCurrency(analytics?.totalRevenue ?? 0)}</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm">คำสั่งซื้อทั้งหมด</p>
              <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            {analyticsLoading ? (
              <div className="h-8 bg-slate-700 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-white">{analytics?.totalOrders ?? 0}</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm">รอดำเนินการ</p>
              <div className="w-9 h-9 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            {analyticsLoading ? (
              <div className="h-8 bg-slate-700 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-white">
                {(statusBreakdown?.pending ?? 0) + (statusBreakdown?.paid ?? 0) + (statusBreakdown?.processing ?? 0)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm">จัดส่งแล้ว</p>
              <div className="w-9 h-9 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
            {analyticsLoading ? (
              <div className="h-8 bg-slate-700 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-white">
                {(statusBreakdown?.shipped ?? 0) + (statusBreakdown?.delivered ?? 0)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      {!analyticsLoading && statusBreakdown && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">สถานะคำสั่งซื้อ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(statusBreakdown).map(([status, count]) => {
                const config = statusConfig[status];
                if (!config) return null;
                const Icon = config.icon;
                return (
                  <button
                    key={status}
                    onClick={() => setLocation(`/orders?status=${status}`)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border ${config.color} hover:opacity-80 transition-opacity`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xl font-bold">{count}</span>
                    <span className="text-xs text-center leading-tight">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-white text-base">คำสั่งซื้อล่าสุด</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/orders")}
              className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 text-xs"
            >
              ดูทั้งหมด →
            </Button>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-700 rounded animate-pulse" />
                ))}
              </div>
            ) : recentOrdersData?.orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">ยังไม่มีคำสั่งซื้อ</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentOrdersData?.orders.map(order => {
                  const config = statusConfig[order.status];
                  return (
                    <button
                      key={order.id}
                      onClick={() => setLocation(`/orders/${order.id}`)}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{order.orderNumber}</p>
                        <p className="text-gray-400 text-xs truncate">{order.customerName}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-amber-400 text-sm font-medium">฿{Number(order.totalAmount).toLocaleString()}</span>
                        {config && (
                          <Badge className={`text-xs border ${config.color}`}>{config.label}</Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Books */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-white text-base">หนังสือขายดี</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/analytics")}
              className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 text-xs"
            >
              ดูรายงาน →
            </Button>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-700 rounded animate-pulse" />
                ))}
              </div>
            ) : !analytics?.topBooks?.length ? (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">ยังไม่มีข้อมูล</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.topBooks.map((book, i) => (
                  <div key={book.bookId} className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm w-5 shrink-0">{i + 1}</span>
                    <img
                      src={book.bookImage}
                      alt={book.bookTitleTh}
                      className="w-8 h-10 object-cover rounded shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{book.bookTitleTh}</p>
                      <p className="text-gray-400 text-xs">{book.totalQty} เล่ม</p>
                    </div>
                    <span className="text-amber-400 text-sm font-medium shrink-0">
                      ฿{book.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
