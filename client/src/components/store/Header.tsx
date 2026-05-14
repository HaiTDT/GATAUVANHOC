"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../AuthProvider";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isHome = pathname === "/";

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/lessons?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-brand/90 backdrop-blur-md shadow-sm border-b border-brand-dark/10">
      <div className="flex flex-col w-full max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4 md:gap-8 mb-3 md:mb-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 lg:hidden text-brand-dark hover:bg-white/30 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
            </button>
            <Link href="/" className="text-xl md:text-2xl font-bold tracking-tight text-brand-dark font-headline">
              Ga Tàu Văn Học
            </Link>
          </div>

          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-xl relative">
            <input
              className="w-full bg-white/50 border-none rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-brand-dark focus:bg-white transition-all"
              placeholder="Tìm kiếm bài học..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="material-symbols-outlined absolute right-3 top-2 text-brand-dark hover:scale-110 transition-transform">search</button>
          </form>

          <div className="flex items-center gap-2 md:gap-6">
             <span className="hidden xl:block text-brand-dark font-medium text-sm">Hỗ trợ: 1900 1234</span>
            <div className="flex items-center gap-1 md:gap-4">
              {user && (
                <button 
                  onClick={() => router.push("/my-courses")} 
                  className="p-2 text-brand-dark hover:bg-white/30 transition-all rounded-full relative"
                  title="Khóa học của tôi"
                >
                  <span className="material-symbols-outlined text-[20px] md:text-[24px]">school</span>
                </button>
              )}
              {user && (
                <button 
                  onClick={() => router.push("/learning-progress")} 
                  className="p-2 text-brand-dark hover:bg-white/30 transition-all rounded-full relative"
                  title="Tiến độ học tập"
                >
                  <span className="material-symbols-outlined text-[20px] md:text-[24px]">trending_up</span>
                </button>
              )}
              {user?.role === "ADMIN" && (
                <Link
                  className="hidden sm:flex items-center gap-1 text-[10px] md:text-xs font-bold text-white bg-primary px-2 md:px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
                  href="/admin"
                >
                  <span className="material-symbols-outlined text-[14px] md:text-[16px]">admin_panel_settings</span>
                  <span className="hidden md:inline">Giáo viên</span>
                </Link>
              )}
              {user ? (
                <button
                  className="p-2 text-brand-dark hover:bg-white/30 transition-all rounded-full"
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
                  className="p-2 text-brand-dark hover:bg-white/30 transition-all rounded-full"
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
        <form onSubmit={handleSearch} className="md:hidden relative mb-2">
          <input
            className="w-full bg-stone-100 dark:bg-stone-800 border-none rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-primary"
            placeholder="Tìm kiếm bài học..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="material-symbols-outlined absolute right-3 top-2 text-primary text-[20px] hover:scale-110 transition-transform">search</button>
        </form>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center justify-center gap-8">
          <Link
            className={`py-1 text-sm font-headline transition-colors ${isHome ? "text-brand-dark border-b-2 border-brand-dark font-semibold" : "text-brand-dark/60 hover:text-brand-dark"}`}
            href="/"
          >
            Trang chủ
          </Link>
          <Link
            className={`py-1 text-sm font-headline transition-colors ${pathname === "/lessons" ? "text-brand-dark border-b-2 border-brand-dark font-semibold" : "text-brand-dark/60 hover:text-brand-dark"}`}
            href="/lessons"
          >
            Bài học
          </Link>
          <Link
            className={`py-1 text-sm font-headline transition-colors ${pathname === "/courses" ? "text-brand-dark border-b-2 border-brand-dark font-semibold" : "text-brand-dark/60 hover:text-brand-dark"}`}
            href="/courses"
          >
            Khóa học
          </Link>
          {user && (
            <Link
              className={`py-1 text-sm font-headline transition-colors ${pathname === "/my-courses" ? "text-brand-dark border-b-2 border-brand-dark font-semibold" : "text-brand-dark/60 hover:text-brand-dark"}`}
              href="/my-courses"
            >
              Khóa học của tôi
            </Link>
          )}
          <Link
            className={`py-1 text-sm font-headline transition-colors ${pathname === "/blogs" ? "text-brand-dark border-b-2 border-brand-dark font-semibold" : "text-brand-dark/60 hover:text-brand-dark"}`}
            href="/blogs"
          >
            Blog Kiến Thức
          </Link>
        </nav>

        {/* Mobile Menu Overlay */}
        <div className={`lg:hidden fixed inset-0 z-[100] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
          
          <div className={`absolute left-0 top-0 h-full w-[85%] max-w-[320px] bg-white dark:bg-stone-900 shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto`}>
            <div className="bg-primary p-6 flex items-center gap-4 text-white">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                <span className="material-symbols-outlined text-3xl">school</span>
              </div>
              <div className="flex flex-col">
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold">Ga Tàu Văn Học</Link>
              </div>
            </div>

            <div className="flex flex-col py-2">
              <MobileMenuItem 
                icon="home" 
                label="Trang chủ" 
                href="/" 
                active={isHome}
                onClick={() => setIsMenuOpen(false)} 
              />
              <MobileMenuItem 
                icon="menu_book" 
                label="Bài học" 
                href="/lessons" 
                onClick={() => setIsMenuOpen(false)} 
              />
              <MobileMenuItem 
                icon="school" 
                label="Khóa học" 
                href="/courses" 
                onClick={() => setIsMenuOpen(false)} 
              />
              {user && (
                <MobileMenuItem 
                  icon="auto_stories" 
                  label="Khóa học của tôi" 
                  href="/my-courses" 
                  onClick={() => setIsMenuOpen(false)} 
                  active={pathname === "/my-courses"}
                />
              )}
              <MobileMenuItem 
                icon="article" 
                label="Blog Kiến Thức" 
                href="/blogs" 
                onClick={() => setIsMenuOpen(false)} 
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileMenuItem({ icon, label, href, onClick, active }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center gap-4 px-6 py-3.5 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors ${active ? 'bg-pearl text-primary' : 'text-stone-700 dark:text-stone-300'}`}
    >
      <span className="material-symbols-outlined text-[22px] opacity-70">{icon}</span>
      <span className="flex-1 text-sm font-medium">{label}</span>
    </Link>
  );
}


