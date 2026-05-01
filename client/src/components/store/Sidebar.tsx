"use client";

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
  // Nếu không có topBrands từ group, fallback sang tất cả brand từ categories (không có data)
  const displayBrands = topBrands.length > 0 ? topBrands : [];

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

          {/* Lọc thương hiệu: top 4 brands của nhóm */}
          {displayBrands.length > 0 && (
            <div className="group">
              <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 transition-all duration-150">
                <span className="material-symbols-outlined text-lg">sell</span>
                <span className="text-sm font-headline">Thương hiệu nổi bật</span>
              </div>
              <div className="mt-3 pl-4 space-y-2">
                {displayBrands.map((item) => (
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
          )}

          {/* Lọc danh mục: chỉ hiển thị danh mục con của nhóm đang chọn */}
          {categories.length > 0 && (
            <div className="group">
              <div className="flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:text-emerald-800 p-3 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg">
                <span className="material-symbols-outlined text-lg">face_6</span>
                <span className="text-sm font-headline">Danh mục</span>
              </div>
              <div className="mt-3 pl-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-600 hover:text-emerald-800">
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
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-600 hover:text-emerald-800" key={category.id}>
                    <input
                      checked={categoryId === category.id}
                      className="rounded text-primary focus:ring-primary w-4 h-4"
                      onChange={() => onChange({ categoryId: category.id })}
                      type="radio"
                      name="category"
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Khoảng giá */}
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

        </div>
      </div>
    </aside>
  );
}
