"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Protected } from "../../components/Protected";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/admin' && pathname === '/admin') return true;
    if (path !== '/admin' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <Protected adminOnly>
      <div className="bg-stone-50 font-body text-stone-900 antialiased flex min-h-screen">
        <aside className="h-screen w-64 fixed left-0 top-0 bg-primary shadow-xl flex flex-col py-6 z-50 font-headline tracking-wide leading-relaxed text-sm">
          <div className="px-6 mb-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl">train</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-none">Ga Tàu Văn Học</h1>
              <p className="text-white/70 text-[10px] uppercase tracking-widest mt-1">Trạm điều hành</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 overflow-y-auto no-scrollbar">
            <Link 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mx-2 my-1 transition-all duration-200 ${isActive('/admin') ? 'bg-white/20 text-white font-semibold' : 'text-white/80 hover:text-white hover:bg-white/10'}`} 
              href="/admin"
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span>Tổng quan</span>
            </Link>
            <Link 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mx-2 my-1 transition-all duration-200 ${isActive('/admin/lessons') ? 'bg-white/20 text-white font-semibold' : 'text-white/80 hover:text-white hover:bg-white/10'}`} 
              href="/admin/lessons"
            >
              <span className="material-symbols-outlined">menu_book</span>
              <span>Quản lý Bài học</span>
            </Link>
            <Link 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mx-2 my-1 transition-all duration-200 ${isActive('/admin/categories') ? 'bg-white/20 text-white font-semibold' : 'text-white/80 hover:text-white hover:bg-white/10'}`} 
              href="/admin/categories"
            >
              <span className="material-symbols-outlined">category</span>
              <span>Quản lý Danh mục</span>
            </Link>
            <Link 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mx-2 my-1 transition-all duration-200 ${isActive('/admin/courses') ? 'bg-white/20 text-white font-semibold' : 'text-white/80 hover:text-white hover:bg-white/10'}`} 
              href="/admin/courses"
            >
              <span className="material-symbols-outlined">school</span>
              <span>Quản lý Khóa học</span>
            </Link>
            <Link 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mx-2 my-1 transition-all duration-200 ${isActive('/admin/enrollments') ? 'bg-white/20 text-white font-semibold' : 'text-white/80 hover:text-white hover:bg-white/10'}`} 
              href="/admin/enrollments"
            >
              <span className="material-symbols-outlined">verified_user</span>
              <span>Phê duyệt Học viên</span>
            </Link>
            <Link 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mx-2 my-1 transition-all duration-200 ${isActive('/admin/submissions') ? 'bg-white/20 text-white font-semibold' : 'text-white/80 hover:text-white hover:bg-white/10'}`} 
              href="/admin/submissions"
            >
              <span className="material-symbols-outlined">grading</span>
              <span>Chấm điểm Bài tập</span>
            </Link>
            <Link 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mx-2 my-1 transition-all duration-200 ${isActive('/admin/blogs') ? 'bg-white/20 text-white font-semibold' : 'text-white/80 hover:text-white hover:bg-white/10'}`} 
              href="/admin/blogs"
            >
              <span className="material-symbols-outlined">article</span>
              <span>Quản lý Blog</span>
            </Link>
            <Link 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mx-2 my-1 transition-all duration-200 ${isActive('/admin/banners') ? 'bg-white/20 text-white font-semibold' : 'text-white/80 hover:text-white hover:bg-white/10'}`} 
              href="/admin/banners"
            >
              <span className="material-symbols-outlined">image</span>
              <span>Quản lý Banner</span>
            </Link>

            <div className="mx-2 my-3 h-px bg-white/20" />
            <Link
              className="flex items-center gap-3 px-4 py-3 rounded-lg mx-2 my-1 transition-all duration-200 text-white/80 hover:text-white hover:bg-white/10"
              href="/"
            >
              <span className="material-symbols-outlined">storefront</span>
              <span>Về trang chủ</span>
            </Link>
          </nav>
          <div className="mt-auto px-6 pt-6 border-t border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-white/30 bg-pearl flex items-center justify-center text-primary font-bold text-xs">
                 GV
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-xs font-semibold truncate">Giáo viên</p>
                <p className="text-white/60 text-[10px] truncate">giaovien@gatauvn.com</p>
              </div>
            </div>
          </div>
        </aside>
        
        <div className="ml-64 flex-1 flex flex-col min-h-screen">
          <header className="sticky top-0 w-full z-40 bg-white/90 backdrop-blur-md flex items-center justify-between px-8 h-16 shadow-sm font-body font-medium text-sm leading-6 border-b border-stone-200">
            <div className="flex items-center flex-1 max-w-xl">
              <div className="relative w-full group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-primary transition-colors">search</span>
                <input className="w-full bg-stone-100 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none text-stone-900" placeholder="Tìm kiếm học sinh, bài tập..." type="text"/>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button className="relative p-2 text-stone-600 hover:bg-stone-100 rounded-full transition-all">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>
              <div className="h-8 w-px bg-stone-200"></div>
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="text-right hidden lg:block">
                  <p className="text-xs font-bold text-stone-900">Giáo viên</p>
                  <p className="text-[10px] text-stone-500">Quản trị viên</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-pearl flex items-center justify-center text-primary font-bold ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                   GV
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </Protected>
  );
}
