"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../AuthProvider";
import { useCart } from "../CartProvider";
import { CATEGORY_GROUPS } from "../../lib/constants";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const activeGroup = searchParams.get("group");
  const isHome = pathname === "/" && !activeGroup;

  return (
    <header className="fixed top-0 w-full z-50 bg-white dark:bg-stone-900 backdrop-blur-md shadow-sm border-b border-stone-200 dark:border-stone-800">
      <div className="flex flex-col w-full max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4 md:gap-8 mb-3 md:mb-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 lg:hidden text-emerald-900 dark:text-emerald-50 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
            </button>
            <Link href="/" className="text-xl md:text-2xl font-bold tracking-tight text-emerald-900 dark:text-emerald-50 font-headline">
              HASAKI
            </Link>
          </div>

          <div className="hidden md:block flex-1 max-w-xl relative">
            <input
              className="w-full bg-surface-variant dark:bg-stone-800 border-none rounded-sm px-4 py-2 text-sm focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all"
              placeholder="Tìm kiếm sản phẩm chăm sóc da..." type="text" />
            <span className="material-symbols-outlined absolute right-3 top-2 text-primary">search</span>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <span className="hidden xl:block text-emerald-900 dark:text-emerald-400 font-medium text-sm">Hotline: 1900 1234</span>
            <div className="flex items-center gap-1 md:gap-4">
              {user && (
                <button 
                  onClick={() => router.push("/orders")} 
                  className="p-2 text-emerald-900 dark:text-emerald-50 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all rounded-full relative"
                  title="Lịch sử đơn hàng"
                >
                  <span className="material-symbols-outlined text-[20px] md:text-[24px]">receipt_long</span>
                </button>
              )}
              <button 
                onClick={() => router.push("/cart")} 
                className="p-2 text-emerald-900 dark:text-emerald-50 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all rounded-full relative"
              >
                <span className="material-symbols-outlined text-[20px] md:text-[24px]">shopping_cart</span>
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 bg-secondary text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>
              {user?.role === "ADMIN" && (
                <Link
                  className="hidden sm:flex items-center gap-1 text-[10px] md:text-xs font-bold text-white bg-primary px-2 md:px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
                  href="/admin"
                >
                  <span className="material-symbols-outlined text-[14px] md:text-[16px]">admin_panel_settings</span>
                  <span className="hidden md:inline">Quản trị Admin</span>
                </Link>
              )}
              {user ? (
                <button
                  className="p-2 text-emerald-900 dark:text-emerald-50 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all rounded-full"
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px] md:text-[24px]">logout</span>
                </button>
              ) : (
                <button
                  className="p-2 text-emerald-900 dark:text-emerald-50 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all rounded-full"
                  onClick={() => router.push("/login")}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px] md:text-[24px]">person</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search Mobile */}
        <div className="md:hidden relative mb-2">
          <input
            className="w-full bg-stone-100 dark:bg-stone-800 border-none rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-primary"
            placeholder="Tìm kiếm..." type="text" />
          <span className="material-symbols-outlined absolute right-3 top-2 text-primary text-[20px]">search</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center justify-center gap-8">
          <Link
            className={`py-1 text-sm font-headline transition-colors ${isHome ? "text-emerald-700 border-b-2 border-orange-500 font-semibold" : "text-stone-600 dark:text-stone-400 hover:text-emerald-800"}`}
            href="/"
          >
            Trang chủ
          </Link>
          {CATEGORY_GROUPS.map((group) => (
            <Link
              key={group.key}
              className={`py-1 text-sm font-headline transition-colors ${activeGroup === group.key ? "text-emerald-700 border-b-2 border-orange-500 font-semibold" : "text-stone-600 dark:text-stone-400 hover:text-emerald-800"}`}
              href={`/products?group=${group.key}`}
            >
              {group.label}
            </Link>
          ))}
          <Link
            className={`py-1 text-sm font-headline flex items-center gap-1 font-bold transition-colors ${pathname === "/flash-sale" ? "text-orange-700 border-b-2 border-orange-500" : "text-orange-600 hover:text-orange-800"}`}
            href="/flash-sale"
          >
            Khuyến mãi <span className="material-symbols-outlined text-[16px]">bolt</span>
          </Link>
        </nav>

        {/* Mobile Menu Overlay */}
        <div className={`lg:hidden fixed inset-0 z-[100] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
          
          {/* Menu Content */}
          <div className={`absolute left-0 top-0 h-full w-[85%] max-w-[320px] bg-white dark:bg-stone-900 shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto`}>
            {/* Menu Header (Login Section) */}
            <div className="bg-[#326e51] p-6 flex items-center gap-4 text-white">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                <span className="material-symbols-outlined text-3xl">person</span>
              </div>
              <div className="flex flex-col">
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold">Đăng nhập / Đăng ký</Link>
              </div>
            </div>

            {/* Menu List */}
            <div className="flex flex-col py-2">
              <MobileMenuItem 
                icon="home" 
                label="Trang chủ" 
                href="/" 
                active={isHome}
                onClick={() => setIsMenuOpen(false)} 
              />
              <MobileMenuItem 
                icon="grid_view" 
                label="Danh mục sản phẩm" 
                href="/products" 
                onClick={() => setIsMenuOpen(false)} 
              />
              <MobileMenuItem 
                icon="shopping_cart" 
                label="Giỏ hàng" 
                href="/cart" 
                badge={totalItems}
                onClick={() => setIsMenuOpen(false)} 
              />
              <MobileMenuItem 
                icon="sell" 
                label="Hasaki Deals" 
                href="/flash-sale" 
                onClick={() => setIsMenuOpen(false)} 
              />
              <MobileMenuItem 
                icon="percent" 
                label="Hot Deals" 
                href="/flash-sale" 
                onClick={() => setIsMenuOpen(false)} 
              />
              <MobileMenuItem 
                icon="verified" 
                label="Thương hiệu" 
                href="/products" 
                onClick={() => setIsMenuOpen(false)} 
              />
              <MobileMenuItem 
                icon="spa" 
                label="Clinic & Spa" 
                href="#" 
                onClick={() => setIsMenuOpen(false)} 
              />
              <MobileMenuItem 
                icon="new_releases" 
                label="Hàng mới về" 
                href="/products" 
                onClick={() => setIsMenuOpen(false)} 
              />
              <MobileMenuItem 
                icon="rocket_launch" 
                label="Sản phẩm bán chạy" 
                href="/products" 
                onClick={() => setIsMenuOpen(false)} 
              />
              <MobileMenuItem 
                icon="card_giftcard" 
                label="Tri ân khách hàng" 
                href="#" 
                onClick={() => setIsMenuOpen(false)} 
              />
            </div>

            {/* Menu Footer Section */}
            <div className="border-t border-stone-100 dark:border-stone-800 mt-2 py-4">
               <MobileMenuItem 
                 icon="download" 
                 label="Tải App Hasaki.vn" 
                 href="#" 
                 onClick={() => setIsMenuOpen(false)} 
               />
               <MobileMenuItem 
                 icon="call" 
                 label="Hotline: 1800 6324" 
                 href="tel:18006324" 
                 onClick={() => setIsMenuOpen(false)} 
                 customLabelColor="text-emerald-700 font-bold"
               />
            </div>

            <div className="bg-stone-50 dark:bg-stone-950 p-6 text-[11px] text-stone-500">
               <p className="text-emerald-800 font-bold mb-1">Xem tất cả cửa hàng</p>
               <p>Bản quyền © 2016 Hasaki.vn</p>
               <p>Công Ty cổ phần HASAKI VIETNAM</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileMenuItem({ icon, label, href, onClick, active, badge, customLabelColor }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center gap-4 px-6 py-3.5 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors ${active ? 'bg-emerald-50 text-emerald-800' : 'text-stone-700 dark:text-stone-300'}`}
    >
      <span className="material-symbols-outlined text-[22px] opacity-70">{icon}</span>
      <span className={`flex-1 text-sm ${customLabelColor || 'font-medium'}`}>{label}</span>
      {badge > 0 && (
        <span className="bg-orange-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
          {badge}
        </span>
      )}
    </Link>
  );
}


