import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { BarChart3, BookOpen, ClipboardList, Home, LogOut, Package, PanelLeft, Settings, ShoppingCart, Truck } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

const menuItems = [
  { icon: BarChart3, label: "ภาพรวม", path: "/admin" },
  { icon: ClipboardList, label: "สรุปยอดคำสั่งซื้อ", path: "/admin/order-summary" },
  { icon: ShoppingCart, label: "จัดการคำสั่งซื้อ", path: "/admin/orders" },
  { icon: Truck, label: "ติดตามการจัดส่ง", path: "/admin/shipping" },
  { icon: BarChart3, label: "วิเคราะห์ยอดขาย", path: "/admin/analytics" },
  { icon: Package, label: "ชุดโปรโมชั่น", path: "/admin/bundles" },
  { icon: Package, label: "จัดการสินค้า", path: "/admin/products" },
  { icon: BookOpen, label: "จัดการบทความ", path: "/admin/blog" },
];

const SIDEBAR_WIDTH_KEY = "admin-sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) return <DashboardLayoutSkeleton />;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-amber-400/10 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-center text-white">
              เข้าสู่ระบบ Admin
            </h1>
            <p className="text-sm text-gray-400 text-center max-w-sm">
              ต้องเข้าสู่ระบบก่อนเข้าถึงหน้า Admin Dashboard
            </p>
          </div>
          <Button
            onClick={() => { window.location.href = getLoginUrl(); }}
            size="lg"
            className="w-full bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold shadow-lg"
          >
            เข้าสู่ระบบ
          </Button>
          <Button variant="ghost" onClick={() => { window.location.href = "/"; }} className="text-gray-400 hover:text-white">
            <Home className="w-4 h-4 mr-2" />
            กลับหน้าหลัก
          </Button>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-6 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
            <Settings className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-semibold text-white">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-gray-400">คุณไม่มีสิทธิ์เข้าถึงหน้า Admin Dashboard</p>
          <Button onClick={() => { window.location.href = "/"; }} className="bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold">
            กลับหน้าหลัก
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <AdminLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </AdminLayoutContent>
    </SidebarProvider>
  );
}

function AdminLayoutContent({
  children,
  setSidebarWidth,
}: {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
}) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const activeMenuItem = menuItems.find(item => item.path === location);

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r border-slate-800 bg-slate-950" disableTransition={isResizing}>
          <SidebarHeader className="h-16 justify-center border-b border-slate-800">
            <div className="flex items-center gap-3 px-2 w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-slate-800 rounded-lg transition-colors focus:outline-none shrink-0"
              >
                <PanelLeft className="h-4 w-4 text-gray-400" />
              </button>
              {!isCollapsed && (
                <div className="flex items-center gap-2 min-w-0">
                  <BookOpen className="h-5 w-5 text-amber-400 shrink-0" />
                  <span className="font-bold text-white truncate text-sm">Admin Panel</span>
                </div>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 bg-slate-950">
            <SidebarMenu className="px-2 py-3 gap-1">
              {menuItems.map(item => {
                const isActive = location === item.path || (item.path !== "/admin" && location.startsWith(item.path));
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal text-gray-300 hover:text-white hover:bg-slate-800 ${isActive ? "bg-amber-400/10 text-amber-400 hover:bg-amber-400/15 hover:text-amber-400" : ""}`}
                    >
                      <item.icon className={`h-4 w-4 ${isActive ? "text-amber-400" : ""}`} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>

            {/* Back to store link */}
            <div className="px-2 mt-auto border-t border-slate-800 pt-2">
              <SidebarMenuButton
                onClick={() => setLocation("/")}
                tooltip="กลับหน้าร้าน"
                className="h-10 text-gray-500 hover:text-gray-300 hover:bg-slate-800"
              >
                <Home className="h-4 w-4" />
                <span>กลับหน้าร้าน</span>
              </SidebarMenuButton>
            </div>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-slate-800 bg-slate-950">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-slate-800 transition-colors w-full text-left focus:outline-none">
                  <Avatar className="h-9 w-9 border border-slate-700 shrink-0">
                    <AvatarFallback className="text-xs font-medium bg-amber-400/10 text-amber-400">
                      {user?.name?.charAt(0).toUpperCase() ?? "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none text-white">{user?.name || "-"}</p>
                    <p className="text-xs text-gray-500 truncate mt-1">Admin</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-700">
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-slate-800">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>ออกจากระบบ</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-amber-400/30 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => { if (!isCollapsed) setIsResizing(true); }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="bg-slate-900 min-h-screen">
        {isMobile && (
          <div className="flex border-b border-slate-800 h-14 items-center justify-between bg-slate-950 px-4 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-9 w-9 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800" />
              <span className="text-white font-medium">{activeMenuItem?.label ?? "Admin"}</span>
            </div>
          </div>
        )}
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </>
  );
}
