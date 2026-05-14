"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-pearl dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 z-[100] pb-safe">
      <div className="flex items-center justify-around h-16">
        <BottomNavItem 
          icon="home" 
          label="Trang chủ" 
          href="/" 
          active={isActive("/")} 
        />
        <BottomNavItem 
          icon="menu_book" 
          label="Bài học" 
          href="/lessons" 
          active={isActive("/lessons")} 
        />
        <BottomNavItem 
          icon="school" 
          label="Khóa học" 
          href="/courses" 
          active={isActive("/courses")} 
        />
        <BottomNavItem 
          icon="trending_up" 
          label="Tiến độ" 
          href="/learning-progress" 
          active={isActive("/learning-progress")} 
        />
      </div>
    </div>
  );
}

function BottomNavItem({ icon, label, href, active, badge, iconClass }: any) {
  return (
    <Link 
      href={href} 
      className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${active ? 'text-primary font-bold' : 'text-stone-500 dark:text-stone-400'}`}
    >
      <div className="relative">
        <span className={`material-symbols-outlined text-[24px] ${iconClass || ''} ${active ? 'fill-1' : ''}`}>
          {icon}
        </span>
        {badge > 0 && (
          <span className="absolute -top-1 -right-2 bg-orange-600 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
            {badge}
          </span>
        )}
      </div>
      <span className="text-[10px] whitespace-nowrap">{label}</span>
    </Link>
  );
}
