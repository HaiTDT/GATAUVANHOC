import { useState } from "react";
import type { Category } from "../../lib/api";

type SidebarProps = {
  categories: Category[];
  brand: string;
  categoryId: string;
  minPrice: string;
  maxPrice: string;
  topBrands?: string[];
  onChange: (next: {
    brand?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
  }) => void;
};

export function Sidebar({
  categories,
  brand,
  categoryId,
  minPrice,
  maxPrice,
  topBrands = [],
  onChange
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const displayBrands = topBrands.length > 0 ? topBrands : [];

  return (
    <div className="w-full md:w-64">
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex items-center justify-between w-full bg-emerald-50 p-4 rounded-xl mb-4 text-emerald-900 font-bold shadow-sm"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined">filter_list</span>
          <span>Bộ lọc & Tìm kiếm</span>
        </div>
        <span className="material-symbols-outlined transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>expand_more</span>
      </button>

      {/* Sidebar Mobile Drawer */}
      <div className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
        
        {/* Bottom Sheet Content */}
        <div className={`absolute bottom-0 left-0 w-full h-[85vh] bg-white dark:bg-stone-900 shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-y-0' : 'translate-y-full'} rounded-t-[32px] overflow-hidden`}>
          <div className="flex flex-col h-full">
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-3 pb-1" onClick={() => setIsOpen(false)}>
              <div className="w-12 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full"></div>
            </div>

            <div className="p-6 pt-2 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-50 font-headline">Bộ lọc sản phẩm</h2>
                <p className="text-xs text-stone-500 font-body">Tìm sản phẩm phù hợp nhất với bạn</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center bg-stone-100 dark:bg-stone-800 rounded-full text-stone-600">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* Filter Content */}
              <SidebarContent 
                categories={categories}
                brand={brand}
                categoryId={categoryId}
                minPrice={minPrice}
                maxPrice={maxPrice}
                displayBrands={displayBrands}
                onChange={onChange}
              />
            </div>
            
            <div className="p-6 border-t border-stone-100 dark:border-stone-800">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform"
              >
                Áp dụng bộ lọc
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar (Sticky) */}
      <aside className="hidden md:block sticky top-24 h-fit">
        <div className="bg-stone-50 dark:bg-stone-900 p-6 rounded-xl border border-stone-100 dark:border-stone-800 flex flex-col gap-8">
           <div>
             <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-50 font-headline">Bộ lọc</h2>
             <p className="text-xs text-stone-500 font-body">Tối ưu hóa lựa chọn</p>
           </div>
           <SidebarContent 
             categories={categories}
             brand={brand}
             categoryId={categoryId}
             minPrice={minPrice}
             maxPrice={maxPrice}
             displayBrands={displayBrands}
             onChange={onChange}
           />
        </div>
      </aside>
    </div>
  );
}

function SidebarContent({ categories, brand, categoryId, minPrice, maxPrice, displayBrands, onChange }: any) {
  return (
    <div className="space-y-6">
      {/* Lọc thương hiệu */}
      {displayBrands.length > 0 && (
        <div className="group">
          <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 mb-3">
            <span className="material-symbols-outlined text-lg">sell</span>
            <span className="text-sm font-headline">Thương hiệu</span>
          </div>
          <div className="pl-2 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {displayBrands.map((item: string) => (
              <label className="flex items-center gap-3 cursor-pointer text-sm text-stone-600 dark:text-stone-400 hover:text-emerald-800 transition-colors py-1" key={item}>
                <input
                  checked={brand === item}
                  className="rounded border-stone-300 text-primary focus:ring-primary w-4.5 h-4.5"
                  onChange={(event) => onChange({ brand: event.target.checked ? item : "" })}
                  type="checkbox"
                />
                <span className="line-clamp-1 font-medium">{item}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Lọc danh mục */}
      {categories.length > 0 && (
        <div className="group">
          <div className="flex items-center gap-3 text-stone-700 dark:text-stone-300 font-semibold p-3 mb-1">
            <span className="material-symbols-outlined text-lg">face_6</span>
            <span className="text-sm font-headline">Danh mục</span>
          </div>
          <div className="pl-2 space-y-2">
            <label className="flex items-center gap-3 cursor-pointer text-sm text-stone-600 dark:text-stone-400 hover:text-emerald-800 transition-colors py-1">
              <input
                checked={categoryId === ""}
                className="rounded-full border-stone-300 text-primary focus:ring-primary w-4.5 h-4.5"
                onChange={() => onChange({ categoryId: "" })}
                type="radio"
                name="category"
              />
              <span className="font-medium">Tất cả sản phẩm</span>
            </label>
            {categories.map((category: any) => (
              <label className="flex items-center gap-3 cursor-pointer text-sm text-stone-600 dark:text-stone-400 hover:text-emerald-800 transition-colors py-1" key={category.id}>
                <input
                  checked={categoryId === category.id}
                  className="rounded-full border-stone-300 text-primary focus:ring-primary w-4.5 h-4.5"
                  onChange={() => onChange({ categoryId: category.id })}
                  type="radio"
                  name="category"
                />
                <span className="line-clamp-1 font-medium">{category.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Khoảng giá */}
      <div className="group">
        <div className="flex items-center gap-3 text-stone-700 dark:text-stone-300 font-semibold p-3 mb-1">
          <span className="material-symbols-outlined text-lg">payments</span>
          <span className="text-sm font-headline">Khoảng giá (VNĐ)</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-3 px-2">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 font-bold uppercase pl-1">Từ</span>
            <input
              className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-2.5 text-sm text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
              min="0"
              onChange={(event) => onChange({ minPrice: event.target.value })}
              placeholder="0"
              type="number"
              value={minPrice}
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 font-bold uppercase pl-1">Đến</span>
            <input
              className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-2.5 text-sm text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
              min="0"
              onChange={(event) => onChange({ maxPrice: event.target.value })}
              placeholder="5tr+"
              type="number"
              value={maxPrice}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

