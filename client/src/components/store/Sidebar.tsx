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

      <aside className={`${isOpen ? 'block' : 'hidden'} md:block flex flex-col gap-6 md:sticky md:top-24 h-fit animate-in fade-in slide-in-from-top-2 duration-300 z-30`}>
        <div className="bg-white dark:bg-stone-900 p-6 rounded-xl flex flex-col gap-6 border border-stone-200 dark:border-stone-800 shadow-xl md:shadow-none md:bg-stone-50">
          <div>
            <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-50 font-headline mb-1">
              Bộ lọc
            </h2>
            <p className="text-xs text-stone-500 font-body">Tối ưu hóa lựa chọn</p>
          </div>
          <div className="space-y-4">

            {/* Lọc thương hiệu */}
            {displayBrands.length > 0 && (
              <div className="group">
                <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                  <span className="material-symbols-outlined text-lg">sell</span>
                  <span className="text-sm font-headline">Thương hiệu</span>
                </div>
                <div className="mt-3 pl-2 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {displayBrands.map((item) => (
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-600 dark:text-stone-400 hover:text-emerald-800" key={item}>
                      <input
                        checked={brand === item}
                        className="rounded text-primary focus:ring-primary w-4 h-4"
                        onChange={(event) => onChange({ brand: event.target.checked ? item : "" })}
                        type="checkbox"
                      />
                      <span className="line-clamp-1">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Lọc danh mục */}
            {categories.length > 0 && (
              <div className="group">
                <div className="flex items-center gap-3 text-stone-600 dark:text-stone-400 font-semibold p-3">
                  <span className="material-symbols-outlined text-lg">face_6</span>
                  <span className="text-sm font-headline">Danh mục</span>
                </div>
                <div className="mt-2 pl-2 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-600 dark:text-stone-400 hover:text-emerald-800">
                    <input
                      checked={categoryId === ""}
                      className="rounded text-primary focus:ring-primary w-4 h-4"
                      onChange={() => onChange({ categoryId: "" })}
                      type="radio"
                      name="category"
                    />
                    Tất cả
                  </label>
                  {categories.map((category) => (
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-600 dark:text-stone-400 hover:text-emerald-800" key={category.id}>
                      <input
                        checked={categoryId === category.id}
                        className="rounded text-primary focus:ring-primary w-4 h-4"
                        onChange={() => onChange({ categoryId: category.id })}
                        type="radio"
                        name="category"
                      />
                      <span className="line-clamp-1">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Khoảng giá */}
            <div className="group">
              <div className="flex items-center gap-3 text-stone-600 dark:text-stone-400 font-semibold p-3">
                <span className="material-symbols-outlined text-lg">payments</span>
                <span className="text-sm font-headline">Khoảng giá</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  className="w-full rounded-lg border border-stone-200 bg-white px-2 py-2 text-xs md:text-sm focus:ring-1 focus:ring-primary outline-none"
                  min="0"
                  onChange={(event) => onChange({ minPrice: event.target.value })}
                  placeholder="Từ"
                  type="number"
                  value={minPrice}
                />
                <input
                  className="w-full rounded-lg border border-stone-200 bg-white px-2 py-2 text-xs md:text-sm focus:ring-1 focus:ring-primary outline-none"
                  min="0"
                  onChange={(event) => onChange({ maxPrice: event.target.value })}
                  placeholder="Đến"
                  type="number"
                  value={maxPrice}
                />
              </div>
            </div>

          </div>
        </div>
      </aside>
    </div>
  );
}

