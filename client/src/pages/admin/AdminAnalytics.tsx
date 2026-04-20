import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Package,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PRESET_RANGES = [
  { label: "7 วัน", days: 7 },
  { label: "30 วัน", days: 30 },
  { label: "90 วัน", days: 90 },
  { label: "ทั้งหมด", days: 0 },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#EAB308",
  paid: "#3B82F6",
  processing: "#A855F7",
  shipped: "#6366F1",
  delivered: "#22C55E",
  cancelled: "#EF4444",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "รอชำระ",
  paid: "ชำระแล้ว",
  processing: "เตรียม",
  shipped: "จัดส่ง",
  delivered: "ส่งถึง",
  cancelled: "ยกเลิก",
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("th-TH", { minimumFractionDigits: 0 }).format(v);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

export default function AdminAnalytics() {
  const [selectedDays, setSelectedDays] = useState(30);

  const dateRange = useMemo(() => {
    if (selectedDays === 0) return {};
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - selectedDays);
    return { dateFrom };
  }, [selectedDays]);

  const { data: analytics, isLoading } = trpc.admin.analytics.useQuery(dateRange);

  const pieData = analytics?.statusBreakdown
    ? Object.entries(analytics.statusBreakdown)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({ name: STATUS_LABELS[k] ?? k, value: v, color: STATUS_COLORS[k] ?? "#888" }))
    : [];

  const barData = analytics?.dailyRevenue?.map(d => ({
    date: formatDate(d.date),
    revenue: d.revenue,
    orders: d.orderCount,
  })) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">วิเคราะห์ยอดขาย</h1>
          <p className="text-gray-400 text-sm mt-1">รายงานยอดขายและสถิติ</p>
        </div>
        <div className="flex gap-2">
          {PRESET_RANGES.map(range => (
            <Button
              key={range.days}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDays(range.days)}
              className={`text-sm ${
                selectedDays === range.days
                  ? "bg-amber-400/10 text-amber-400 hover:bg-amber-400/20"
                  : "text-gray-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm">รายได้รวม</p>
              <div className="w-9 h-9 bg-amber-400/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 bg-slate-700 rounded animate-pulse" />
            ) : (
              <>
                <p className="text-2xl font-bold text-white">฿{formatCurrency(analytics?.totalRevenue ?? 0)}</p>
                <p className="text-gray-500 text-xs mt-1">ไม่รวมคำสั่งซื้อที่ยกเลิก</p>
              </>
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
            {isLoading ? (
              <div className="h-8 bg-slate-700 rounded animate-pulse" />
            ) : (
              <>
                <p className="text-2xl font-bold text-white">{analytics?.totalOrders ?? 0}</p>
                <p className="text-gray-500 text-xs mt-1">ไม่รวมคำสั่งซื้อที่ยกเลิก</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm">ยอดเฉลี่ยต่อออเดอร์</p>
              <div className="w-9 h-9 bg-green-500/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-green-400" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 bg-slate-700 rounded animate-pulse" />
            ) : (
              <>
                <p className="text-2xl font-bold text-white">
                  ฿{formatCurrency(
                    analytics?.totalOrders
                      ? Math.round(analytics.totalRevenue / analytics.totalOrders)
                      : 0
                  )}
                </p>
                <p className="text-gray-500 text-xs mt-1">Average Order Value</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            รายได้รายวัน (30 วันล่าสุด)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 bg-slate-700 rounded animate-pulse" />
          ) : barData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">ยังไม่มีข้อมูล</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `฿${formatCurrency(v)}`}
                  width={80}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #334155", borderRadius: "8px" }}
                  labelStyle={{ color: "#F1F5F9" }}
                  formatter={(value: number, name: string) => [
                    name === "revenue" ? `฿${formatCurrency(value)}` : value,
                    name === "revenue" ? "รายได้" : "ออเดอร์",
                  ]}
                />
                <Bar dataKey="revenue" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Pie Chart */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">สัดส่วนสถานะคำสั่งซื้อ</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-56 bg-slate-700 rounded animate-pulse" />
            ) : pieData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-gray-500">
                <p className="text-sm">ยังไม่มีข้อมูล</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #334155", borderRadius: "8px" }}
                    formatter={(value: number, name: string) => [value, name]}
                  />
                  <Legend
                    formatter={(value) => <span style={{ color: "#94A3B8", fontSize: "12px" }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Books */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              หนังสือขายดี Top 5
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-700 rounded animate-pulse" />
                ))}
              </div>
            ) : !analytics?.topBooks?.length ? (
              <div className="h-48 flex items-center justify-center text-gray-500">
                <p className="text-sm">ยังไม่มีข้อมูล</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.topBooks.map((book, i) => {
                  const maxQty = analytics.topBooks[0]?.totalQty ?? 1;
                  const pct = (book.totalQty / maxQty) * 100;
                  return (
                    <div key={book.bookId} className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-sm w-4 shrink-0">{i + 1}</span>
                        <img src={book.bookImage} alt={book.bookTitleTh} className="w-7 h-9 object-cover rounded shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs truncate">{book.bookTitleTh}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-amber-400 text-xs font-medium">{book.totalQty} เล่ม</p>
                          <p className="text-gray-500 text-xs">฿{formatCurrency(book.totalRevenue)}</p>
                        </div>
                      </div>
                      <div className="ml-7 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400/70 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
