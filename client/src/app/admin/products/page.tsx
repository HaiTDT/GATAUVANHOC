"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, ErrorMessage } from "../../../components/ui";
import { api, formatPrice, type Product } from "../../../lib/api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const productResult = await api.getProducts({ limit: 100 });
      setProducts(productResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      return;
    }

    try {
      await api.deleteProduct(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot delete product");
    }
  };

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <h2 className="font-bold font-headline text-2xl text-primary">Quản lý Sản phẩm</h2>
        <div className="flex items-center gap-4">
          <Link href="/admin/products/new" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-opacity-90 transition organic-shadow">
            <span className="material-symbols-outlined text-sm">add</span> Thêm mới
          </Link>
        </div>
      </header>
      
      <ErrorMessage message={error} />
      
      <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden organic-shadow border border-outline-variant/30">
        <div className="overflow-x-auto no-scrollbar">
          {loading ? (
            <p className="p-8 text-sm text-slate-600 text-center">Đang tải sản phẩm...</p>
          ) : products.length === 0 ? (
            <div className="p-8">
              <EmptyState message="Chưa có sản phẩm nào. Hãy bấm 'Thêm mới'." />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4 border-b border-surface-container">ID</th>
                  <th className="px-6 py-4 border-b border-surface-container">Ảnh</th>
                  <th className="px-6 py-4 border-b border-surface-container">Tên sản phẩm</th>
                  <th className="px-6 py-4 border-b border-surface-container">Thương hiệu</th>
                  <th className="px-6 py-4 border-b border-surface-container">Giá (đ)</th>
                  <th className="px-6 py-4 border-b border-surface-container text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-sm">
                {products.map((p) => (
                  <tr className="hover:bg-surface-container-low/50 transition-colors" key={p.id}>
                    <td className="px-6 py-4 font-mono font-bold text-slate-600 text-xs">{p.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded-md border border-surface-variant shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 bg-surface-variant rounded-md border border-surface-container flex items-center justify-center text-xs text-slate-400">No img</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-on-surface">{p.name}</td>
                    <td className="px-6 py-4 text-slate-600">{p.brand || '-'}</td>
                    <td className="px-6 py-4 font-semibold text-secondary">{formatPrice(p.price)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
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
      </section>
    </>
  );
}
