"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "../../components/ProductCard";
import { Sidebar } from "../../components/store/Sidebar";
import { ErrorMessage } from "../../components/ui";
import { api, type Category, type Product } from "../../lib/api";
import { CATEGORY_GROUPS } from "../../lib/constants";
import styles from "../../components/store/StoreLayout.module.css";

type Filters = {
  search: string;
  categoryId: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  page: number;
  isFlashSale?: boolean;
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-on-surface-variant">Đang tải sản phẩm...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const groupKey = searchParams.get("group") ?? "";
  const initialFlashSale = searchParams.get("flashSale") === "true";

  // Lấy cấu hình nhóm hiện tại
  const activeGroup = CATEGORY_GROUPS.find(g => g.key === groupKey) ?? null;

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState<Filters>({
    search: "",
    categoryId: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    sort: "",
    page: 1,
    isFlashSale: initialFlashSale || undefined
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Danh mục con hiển thị trong sidebar: chỉ các danh mục thuộc nhóm đang chọn
  const visibleCategories = useMemo(() => {
    if (!activeGroup) return allCategories;
    const slugSet = new Set<string>(activeGroup.categorySlugs);
    return allCategories.filter(c => slugSet.has(c.slug));
  }, [allCategories, activeGroup]);

  // Top brands của nhóm đang chọn
  const topBrands: string[] = activeGroup ? [...activeGroup.topBrands] : [];

  // categoryIds để gọi API khi chưa chọn danh mục nhỏ cụ thể
  const groupCategoryIds = useMemo(() => {
    if (!activeGroup || filters.categoryId) return "";
    const slugSet = new Set<string>(activeGroup.categorySlugs);
    const ids = allCategories.filter(c => slugSet.has(c.slug)).map(c => c.id);
    return ids.join(",");
  }, [activeGroup, allCategories, filters.categoryId]);

  const queryParams = useMemo(
    () => ({
      ...filters,
      categoryIds: groupCategoryIds || undefined,
      limit: 9
    } as Record<string, string | number | boolean | undefined>),
    [filters, groupCategoryIds]
  );

  useEffect(() => {
    api.getCategories().then(setAllCategories).catch(() => setAllCategories([]));
  }, []);

  // Reset filters khi group thay đổi
  useEffect(() => {
    setFilters({
      search: "",
      categoryId: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      sort: "",
      page: 1,
      isFlashSale: initialFlashSale || undefined
    });
  }, [groupKey, initialFlashSale]);



  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await api.getProducts(queryParams);

        if (!active) {
          return;
        }

        setProducts(result.data);
        setMeta({
          page: result.meta.page,
          totalPages: result.meta.totalPages || 1,
          total: result.meta.total
        });
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Cannot load products");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, [queryParams]);

  const updateFilters = (next: Partial<Filters>) => {
    setFilters((current) => ({
      ...current,
      ...next,
      page: next.page ?? 1
    }));
  };

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="relative flex flex-col items-center overflow-hidden rounded-xl bg-surface-container-low p-12 text-center md:p-20">
          <h1 className="font-headline mb-4 text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
            {filters.isFlashSale
              ? "🔥 Khuyến Mãi Flash Sale"
              : activeGroup
              ? activeGroup.label
              : "Tất cả sản phẩm"}
          </h1>
          <p className="max-w-2xl leading-relaxed text-on-surface-variant">
            {filters.isFlashSale
              ? "Ưu đãi có hạn – Nhanh tay kẻo lỡ!"
              : activeGroup
              ? `Khám phá bộ sưu tập ${activeGroup.label} tại Botanical Atelier`
              : "Khám phá các sản phẩm chăm sóc da và làm đẹp cao cấp"}
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 pb-24 md:flex-row">
        <Sidebar
          brand={filters.brand}
          categories={visibleCategories}
          categoryId={filters.categoryId}
          maxPrice={filters.maxPrice}
          minPrice={filters.minPrice}
          onChange={updateFilters}
          topBrands={topBrands}
        />

        <section className="flex-1">
          <div className="mb-8 grid gap-3 rounded-xl bg-surface-container-lowest p-4 shadow-sm sm:grid-cols-[1fr_180px_140px]">
            <input
              className="rounded-lg border border-outline-variant bg-white px-4 py-3 text-sm focus:ring-primary text-on-surface"
              onChange={(event) => updateFilters({ search: event.target.value })}
              placeholder="Tìm serum, kem dưỡng, toner..."
              value={filters.search}
            />
            <select
              className="rounded-lg border border-outline-variant bg-white px-4 py-3 text-sm focus:ring-primary text-on-surface"
              onChange={(event) => updateFilters({ sort: event.target.value })}
              value={filters.sort}
            >
              <option value="">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>
            <button
              className="rounded-lg border border-outline-variant px-4 py-3 text-sm font-semibold text-primary hover:bg-stone-100 transition-colors"
              onClick={() => setFilters({
                search: "",
                categoryId: "",
                brand: "",
                minPrice: "",
                maxPrice: "",
                sort: "",
                page: 1,
                isFlashSale: undefined
              })}
              type="button"
            >
              Xóa lọc
            </button>
          </div>

          <ErrorMessage message={error} />

          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-on-surface-variant">
              {loading ? "Đang tải sản phẩm..." : `${meta.total} sản phẩm`}
            </p>
            <p className="text-sm text-on-surface-variant">
              Trang {meta.page} / {meta.totalPages}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div className="h-[350px] animate-pulse rounded-xl bg-surface-container-low" key={item} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-12 text-center text-on-surface-variant">
              Không tìm thấy sản phẩm phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-20 flex items-center justify-center gap-2">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg text-primary transition-all hover:bg-stone-200 disabled:opacity-40"
              disabled={meta.page <= 1}
              onClick={() => updateFilters({ page: meta.page - 1 })}
              type="button"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-bold text-white">
              {meta.page}
            </button>
            {meta.page + 1 <= meta.totalPages && (
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-200 transition-colors"
                onClick={() => updateFilters({ page: meta.page + 1 })}
                type="button"
              >
                {meta.page + 1}
              </button>
            )}
            {meta.page + 2 <= meta.totalPages && (
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-200 transition-colors"
                onClick={() => updateFilters({ page: meta.page + 2 })}
                type="button"
              >
                {meta.page + 2}
              </button>
            )}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg text-primary transition-all hover:bg-stone-200 disabled:opacity-40"
              disabled={meta.page >= meta.totalPages}
              onClick={() => updateFilters({ page: meta.page + 1 })}
              type="button"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

