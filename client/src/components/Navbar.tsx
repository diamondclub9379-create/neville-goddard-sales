import { ShoppingCart, BookOpen, Menu, X, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl, COMMUNITY_PATH } from "@/const";

interface NavbarProps {
  cartCount?: number;
  onCartClick?: () => void;
}

export function Navbar({ cartCount = 0, onCartClick }: NavbarProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navLinks = [
    { href: "/", label: "หน้าแรก" },
    { href: "/#books", label: "หนังสือทั้งหมด" },
    { href: "/promotion", label: "🔥 โปรโมชั่น", highlight: true as const },
    { href: "/blog", label: "บทความ" },
    {
      href: COMMUNITY_PATH,
      label: "👥 ชุมชน",
      external: true as const,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    if (href.startsWith("/#")) return location === "/";
    return location.startsWith(href);
  };

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      // If already on home page, scroll to section
      if (location === "/") {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        window.location.href = href;
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-30 w-full transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/95 backdrop-blur-md shadow-lg shadow-black/30 border-b border-amber-400/10"
          : "bg-slate-950/80 backdrop-blur-sm border-b border-white/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Shop Name */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-400/20 group-hover:shadow-amber-400/40 transition-shadow">
              <BookOpen size={16} className="text-slate-900" />
            </div>
            <span className="font-bold text-white text-base leading-tight hidden sm:block">
              Neville Goddard{" "}
              <span className="text-amber-400">Books</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.href.startsWith("/#")) {
                return (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive(link.href)
                        ? "text-amber-400 bg-amber-400/10"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </button>
                );
              }
              if ("external" in link && link.external) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-emerald-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-600 hover:to-teal-500 ring-1 ring-emerald-400/30 hover:ring-emerald-400/60"
                  >
                    {link.label}
                  </a>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    "highlight" in link && link.highlight
                      ? isActive(link.href)
                        ? "text-white bg-gradient-to-r from-red-600 to-orange-500 shadow-md shadow-red-500/30"
                        : "text-red-300 hover:text-white hover:bg-gradient-to-r hover:from-red-600 hover:to-orange-500 ring-1 ring-red-400/30 hover:ring-red-400/60"
                      : isActive(link.href)
                        ? "text-amber-400 bg-amber-400/10"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Orders + Cart + Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            {/* Orders link for logged-in users */}
            {user && (
              <Link href="/orders">
                <button
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    location === "/orders"
                      ? "text-amber-400 bg-amber-400/10"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                  title="ประวัติการสั่งซื้อ"
                >
                  <Package size={15} />
                  <span>คำสั่งซื้อ</span>
                </button>
              </Link>
            )}
            {/* Cart Button */}
            {onCartClick && (
              <button
                onClick={onCartClick}
                className="relative flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2 rounded-lg text-sm shadow-md shadow-amber-400/20 hover:shadow-amber-400/40 transition-all"
              >
                <ShoppingCart size={16} />
                <span className="hidden sm:inline">ตะกร้า</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold leading-none">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-slate-950/98 backdrop-blur-md">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {/* Orders link in mobile menu */}
            {user ? (
              <Link
                href="/orders"
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  location === "/orders"
                    ? "text-amber-400 bg-amber-400/10"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Package size={15} />
                คำสั่งซื้อของฉัน
              </Link>
            ) : (
              <button
                onClick={() => { window.location.href = getLoginUrl(); }}
                className="px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 w-full text-left"
              >
                <Package size={15} />
                เข้าสู่ระบบเพื่อดูคำสั่งซื้อ
              </button>
            )}
            {navLinks.map((link) => {
              if (link.href.startsWith("/#")) {
                return (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive(link.href)
                        ? "text-amber-400 bg-amber-400/10"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </button>
                );
              }
              if ("external" in link && link.external) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 rounded-lg text-sm font-medium transition-all text-emerald-300 ring-1 ring-emerald-400/30"
                  >
                    {link.label}
                  </a>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    "highlight" in link && link.highlight
                      ? isActive(link.href)
                        ? "text-white bg-gradient-to-r from-red-600 to-orange-500"
                        : "text-red-300 ring-1 ring-red-400/30"
                      : isActive(link.href)
                        ? "text-amber-400 bg-amber-400/10"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
