"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, ErrorMessage } from "../../../components/ui";
import { api, formatPrice, type Category, type Product } from "../../../lib/api";
import { CATEGORY_GROUPS } from "../../../lib/constants";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Bộ lọc
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedGroupKey, setSelectedGroupKey] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const load = async () => {
    try {
      setLoading(true);

      // Nếu chọn nhóm chủ đạo mà chưa chọn danh mục con cụ thể
      let categoryIds: string | undefined;
      if (selectedGroupKey && !selectedCategoryId) {
        const group = CATEGORY_GROUPS.find(g => g.key === selectedGroupKey);
        if (group) {
          const slugSet = new Set(group.categorySlugs);
          const ids = categories.filter(c => slugSet.has(c.slug)).map(c => c.id);
          categoryIds = ids.join(",");
        }
      }

      const result = await api.getProducts({
        search: search || undefined,
        categoryId: selectedCategoryId || undefined,
        categoryIds,
        limit: LIMIT,
        page
      });
      setProducts(result.data);
      setTotal(result.meta.total);
      setTotalPages(result.meta.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // Load categories một lần
  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  // Load sản phẩm khi filter thay đổi
  useEffect(() => {
    if (categories.length > 0 || !selectedGroupKey) {
      load();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedCategoryId, selectedGroupKey, page, categories]);

  const remove = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await api.deleteProduct(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa sản phẩm");
    }
  };

  // Danh mục con để hiển thị trong dropdown
  const visibleCategories = selectedGroupKey
    ? (() => {
        const group = CATEGORY_GROUPS.find(g => g.key === selectedGroupKey);
        if (!group) return categories;
        const slugSet = new Set(group.categorySlugs);
        return categories.filter(c => slugSet.has(c.slug));
      })()
    : categories;

  const handleGroupChange = (groupKey: string) => {
    setSelectedGroupKey(groupKey);
    setSelectedCategoryId(""); // reset danh mục con
    setPage(1);
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    setPage(1);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-bold font-headline text-2xl text-primary">Quản lý Sản phẩm</h2>
          <p className="text-sm text-slate-500 mt-1">{total} sản phẩm</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-opacity-90 transition organic-shadow"
        >
          <span className="material-symbols-outlined text-sm">add</span> Thêm mới
        </Link>
      </header>

      {/* Bộ lọc */}
      <div className="mb-6 flex flex-wrap gap-3 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm">
        {/* Tìm kiếm */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
          <input
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-outline-variant bg-white text-sm text-on-surface focus:ring-1 focus:ring-primary"
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Tìm tên sản phẩm..."
            type="text"
            value={search}
          />
        </div>

        {/* Lọc theo nhóm chủ đạo */}
        <select
          className="rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus:ring-1 focus:ring-primary min-w-[160px]"
          onChange={(e) => handleGroupChange(e.target.value)}
          value={selectedGroupKey}
        >
          <option value="">Tất cả nhóm</option>
          {CATEGORY_GROUPS.map(g => (
            <option key={g.key} value={g.key}>{g.label}</option>
          ))}
        </select>

        {/* Lọc theo danh mục con */}
        <select
          className="rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus:ring-1 focus:ring-primary min-w-[180px]"
          onChange={(e) => handleCategoryChange(e.target.value)}
          value={selectedCategoryId}
        >
          <option value="">Tất cả danh mục</option>
          {visibleCategories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Nút xóa lọc */}
        {(search || selectedGroupKey || selectedCategoryId) && (
          <button
            className="px-3 py-2 rounded-lg border border-outline-variant text-sm text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1"
            onClick={() => { setSearch(""); setSelectedGroupKey(""); setSelectedCategoryId(""); setPage(1); }}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">close</span> Xóa lọc
          </button>
        )}
      </div>

      <ErrorMessage message={error} />

      <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden organic-shadow border border-outline-variant/30">
        <div className="overflow-x-auto no-scrollbar">
          {loading ? (
            <div className="p-8 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-container-low" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-8">
              <EmptyState message="Không tìm thấy sản phẩm phù hợp." />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4 border-b border-surface-container">Ảnh</th>
                  <th className="px-6 py-4 border-b border-surface-container">Tên sản phẩm</th>
                  <th className="px-6 py-4 border-b border-surface-container">Danh mục</th>
                  <th className="px-6 py-4 border-b border-surface-container">Thương hiệu</th>
                  <th className="px-6 py-4 border-b border-surface-container">Giá (đ)</th>
                  <th className="px-6 py-4 border-b border-surface-container">Kho</th>
                  <th className="px-6 py-4 border-b border-surface-container text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-sm">
                {products.map((p) => (
                  <tr className="hover:bg-surface-container-low/50 transition-colors" key={p.id}>
                    <td className="px-6 py-3">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded-md border border-surface-variant shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 bg-surface-variant rounded-md border border-surface-container flex items-center justify-center text-xs text-slate-400">No img</div>
                      )}
                    </td>
                    <td className="px-6 py-3 font-semibold text-on-surface max-w-[220px]">
                      <span className="line-clamp-2">{p.name}</span>
                      {p.isFlashSale && (
                        <span className="inline-flex items-center gap-0.5 mt-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">
                          <span className="material-symbols-outlined text-[12px]">bolt</span> Flash Sale
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium">
                        {p.category?.name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{p.brand || '-'}</td>
                    <td className="px-6 py-3 font-semibold text-secondary">{formatPrice(p.price)}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.stock > 10 ? 'bg-green-50 text-green-700' : p.stock > 0 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/products/${p.id}`} title="Xem thử" target="_blank" className="p-2 hover:bg-slate-100 text-slate-500 rounded transition-colors">
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </Link>
                        <Link href={`/admin/products/${p.id}/edit`} title="Sửa" className="p-2 hover:bg-primary/10 text-primary rounded transition-colors">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </Link>
                        <button onClick={() => remove(p.id)} title="Xóa" className="p-2 hover:bg-error-container text-error rounded transition-colors">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-surface-container bg-surface-container-low/30">
            <p className="text-sm text-slate-500">
              Trang {page} / {totalPages} — {total} sản phẩm
            </p>
            <div className="flex items-center gap-2">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                type="button"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
                return (
                  <button
                    key={pageNum}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${pageNum === page ? 'bg-primary text-white' : 'border border-outline-variant text-slate-600 hover:bg-slate-100'}`}
                    onClick={() => setPage(pageNum)}
                    type="button"
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                type="button"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
