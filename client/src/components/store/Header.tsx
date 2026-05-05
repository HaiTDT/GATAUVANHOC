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
        <div className={`lg:hidden fixed inset-0 top-[115px] md:top-[130px] z-40 bg-stone-50 dark:bg-stone-900 transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl border-t border-stone-100 dark:border-stone-800`}>
          <div className="flex flex-col p-6 gap-6">
            <Link 
              onClick={() => setIsMenuOpen(false)}
              className={`text-lg font-headline ${isHome ? 'text-primary font-bold' : 'text-stone-600 dark:text-stone-300'}`}
              href="/"
            >
              Trang chủ
            </Link>
            {CATEGORY_GROUPS.map((group) => (
              <Link
                key={group.key}
                onClick={() => setIsMenuOpen(false)}
                className={`text-lg font-headline ${activeGroup === group.key ? 'text-primary font-bold' : 'text-stone-600 dark:text-stone-300'}`}
                href={`/products?group=${group.key}`}
              >
                {group.label}
              </Link>
            ))}
            <Link
              onClick={() => setIsMenuOpen(false)}
              className={`text-lg font-headline font-bold ${pathname === '/flash-sale' ? 'text-orange-600' : 'text-orange-500'}`}
              href="/flash-sale"
            >
              Khuyến mãi Flash Sale
            </Link>
            <hr className="border-stone-100 dark:border-stone-800" />
            <div className="flex flex-col gap-4 text-sm text-stone-500">
              <p>Hotline: 1900 1234</p>
              <p>Hệ thống 150 cửa hàng toàn quốc</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}


