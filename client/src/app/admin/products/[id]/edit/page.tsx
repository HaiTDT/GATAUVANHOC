"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ErrorMessage } from "../../../../../components/ui";
import { api, type Category } from "../../../../../lib/api";

const emptyProductForm = {
  name: "",
  slug: "",
  description: "",
  brand: "",
  price: "",
  imageUrl: "",
  stock: "0",
  categoryId: "",
  isActive: true,
  isFlashSale: false
};

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyProductForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    Promise.all([
      api.getCategories(),
      api.getProduct(id)
    ])
    .then(([catRes, prodRes]) => {
      setCategories(catRes);
      setForm({
        name: prodRes.name,
        slug: prodRes.slug,
        description: prodRes.description ?? "",
        brand: prodRes.brand ?? "",
        price: String(prodRes.price),
        imageUrl: prodRes.imageUrl ?? "",
        stock: String(prodRes.stock),
        categoryId: prodRes.categoryId,
        isActive: prodRes.isActive,
        isFlashSale: prodRes.isFlashSale
      });
    })
    .catch(err => {
      console.error(err);
      setError("Không thể tải thông tin sản phẩm");
    })
    .finally(() => {
      setInitialLoading(false);
    });
  }, [id]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock)
    };

    try {
      await api.updateProduct(id, payload);
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot save product");
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải thông tin sản phẩm...</div>;
  }

  return (
    <div className="max-w-4xl">
      <header className="mb-8 flex items-center gap-3">
        <Link href="/admin/products" className="text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined mt-1">arrow_back</span>
        </Link>
        <h2 className="font-bold font-headline text-2xl text-primary">Chỉnh sửa Sản phẩm</h2>
      </header>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden p-8 organic-shadow border border-outline-variant/30">
        <ErrorMessage message={error} />
        
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-on-surface mb-2">Tên sản phẩm</label>
              <input 
                type="text" 
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required 
                className="w-full rounded-lg border-surface-variant bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm transition-colors"
                placeholder="Nhập tên sản phẩm..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Slug (đường dẫn URL)</label>
              <input 
                type="text" 
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full rounded-lg border-surface-variant bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm transition-colors"
                placeholder="ten-san-pham"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Thương hiệu</label>
              <input 
                type="text" 
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full rounded-lg border-surface-variant bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm transition-colors"
                placeholder="Nhập thương hiệu"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Danh mục</label>
              <select 
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required 
                className="w-full rounded-lg border-surface-variant bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm transition-colors"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Giá (đ)</label>
              <input 
                type="number" 
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required 
                className="w-full rounded-lg border-surface-variant bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm transition-colors"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Tồn kho</label>
              <input 
                type="number" 
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required 
                className="w-full rounded-lg border-surface-variant bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm transition-colors"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-on-surface mb-2">Đường dẫn hình ảnh (URL)</label>
              <input 
                type="url" 
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full rounded-lg border-surface-variant bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm transition-colors" 
                placeholder="https://..."
              />
            </div>
            
            <div className="md:col-span-2 flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded border-surface-variant text-primary focus:ring-primary"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-on-surface cursor-pointer">Sản phẩm đang hoạt động (Hiển thị cho khách hàng)</label>
            </div>

            <div className="md:col-span-2 flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="isFlashSale"
                checked={form.isFlashSale}
                onChange={(e) => setForm({ ...form, isFlashSale: e.target.checked })}
                className="rounded border-surface-variant text-secondary focus:ring-secondary"
              />
              <label htmlFor="isFlashSale" className="text-sm font-bold text-secondary cursor-pointer">Sản phẩm nổi bật (hiển thị trên Trang Chủ)</label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-on-surface mb-2">Mô tả sản phẩm</label>
              <textarea 
                rows={5} 
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border-surface-variant bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm transition-colors"
                placeholder="Nhập mô tả chi tiết sản phẩm..."
              ></textarea>
            </div>
          </div>
          
          <div className="pt-6 border-t border-surface-variant flex justify-end gap-3">
            <Link href="/admin/products" className="px-6 py-3 border border-outline-variant/50 rounded-lg text-sm font-semibold hover:bg-surface-container-low transition-colors">
              Hủy
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 shadow-lg shadow-primary/30 transition disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
