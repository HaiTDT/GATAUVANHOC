"use client";

import type { Category } from "../../lib/api";

type SidebarProps = {
  categories: Category[];
  brand: string;
  categoryId: string;
  minPrice: string;
  maxPrice: string;
  onChange: (next: {
    brand?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
  }) => void;
};

const brands = ["La Roche-Posay", "Vichy", "Atelier Organic"];

export function Sidebar({
  categories,
  brand,
  categoryId,
  minPrice,
  maxPrice,
  onChange
}: SidebarProps) {
  return (
    <aside className="w-full md:w-64 flex flex-col gap-6 sticky top-24 h-fit">
      <div className="bg-stone-50 dark:bg-stone-900 p-6 rounded-xl flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-50 font-headline mb-1">
            Bộ lọc tìm kiếm
          </h2>
          <p className="text-xs text-stone-500 font-body">Tối ưu hóa lựa chọn của bạn</p>
        </div>
        <div className="space-y-4">
          <div className="group">
            <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 transition-all duration-150 translate-x-1">
              <span className="material-symbols-outlined text-lg">sell</span>
              <span className="text-sm font-headline">Thương hiệu</span>
            </div>
            <div className="mt-3 pl-4 space-y-2">
              {brands.map((item) => (
                <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-600 hover:text-emerald-800" key={item}>
                  <input
                    checked={brand === item}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                    onChange={(event) => onChange({ brand: event.target.checked ? item : "" })}
                    type="checkbox"
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
          <div className="group">
            <div className="flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:text-emerald-800 p-3 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg">
              <span className="material-symbols-outlined text-lg">face_6</span>
              <span className="text-sm font-headline">Danh mục</span>
            </div>
            <select
              className="mt-3 w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-stone-700 focus:ring-primary"
              onChange={(event) => onChange({ categoryId: event.target.value })}
              value={categoryId}
            >
              <option value="">Tất cả</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="group">
            <div className="flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:text-emerald-800 p-3 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg">
              <span className="material-symbols-outlined text-lg">payments</span>
              <span className="text-sm font-headline">Khoảng giá</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input
                className="w-full rounded-lg border border-outline-variant bg-white px-2 py-2 text-sm focus:ring-primary"
                min="0"
                onChange={(event) => onChange({ minPrice: event.target.value })}
                placeholder="Từ"
                type="number"
                value={minPrice}
              />
              <input
                className="w-full rounded-lg border border-outline-variant bg-white px-2 py-2 text-sm focus:ring-primary"
                min="0"
                onChange={(event) => onChange({ maxPrice: event.target.value })}
                placeholder="Đến"
                type="number"
                value={maxPrice}
              />
            </div>
          </div>
          <div className="group">
            <div className="flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:text-emerald-800 p-3 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg">
              <span className="material-symbols-outlined text-lg">star</span>
              <span className="text-sm font-headline">Đánh giá</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
