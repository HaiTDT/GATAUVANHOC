"use client";

import { FormEvent, useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { EmptyState, ErrorMessage } from "@/components/ui";
import { api, type Category } from "@/lib/api";

const emptyForm = { name: "", slug: "", description: "" };

function AdminCategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    setCategories(await api.getCategories());
  };

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Không thể tải danh mục"));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      if (editingId) {
        await api.updateCategory(editingId, form);
      } else {
        await api.createCategory(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu danh mục");
    }
  };

  const edit = (category: Category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? ""
    });
  };

  const remove = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) {
      return;
    }

    try {
      await api.deleteCategory(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa danh mục");
    }
  };

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <h2 className="font-bold font-headline text-2xl text-primary">Quản lý Danh mục</h2>
      </header>
      
      <ErrorMessage message={error} />
      
      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <form className="space-y-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 organic-shadow h-fit" onSubmit={submit}>
          <h2 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">{editingId ? 'edit_square' : 'add_box'}</span>
            {editingId ? "Sửa danh mục" : "Thêm danh mục mới"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Tên danh mục</label>
              <input className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none" onChange={(event) => setForm({ ...form, name: event.target.value })} required value={form.name} placeholder="Nhập tên danh mục..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Đường dẫn (Slug)</label>
              <input className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none" onChange={(event) => setForm({ ...form, slug: event.target.value })} value={form.slug} placeholder="ten-danh-muc" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Mô tả</label>
              <textarea className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none" onChange={(event) => setForm({ ...form, description: event.target.value })} rows={4} value={form.description} placeholder="Mô tả danh mục..." />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-outline-variant/20 mt-6">
            <button className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition organic-shadow" type="submit">
              {editingId ? "Lưu thay đổi" : "Thêm mới"}
            </button>
            {editingId && (
              <button
                className="flex-1 bg-surface-container-high text-on-surface px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-surface-container-highest transition border border-outline-variant/50"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                type="button"
              >
                Hủy
              </button>
            )}
          </div>
        </form>
        
        <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden organic-shadow border border-outline-variant/30 h-fit">
          {categories.length === 0 ? (
            <div className="p-8">
              <EmptyState message="Chưa có danh mục nào." />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4 border-b border-surface-container">Tên danh mục</th>
                  <th className="px-6 py-4 border-b border-surface-container">Đường dẫn</th>
                  <th className="px-6 py-4 border-b border-surface-container text-center w-32">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-sm">
                {categories.map((category) => (
                  <tr className="hover:bg-surface-container-low/50 transition-colors" key={category.id}>
                    <td className="px-6 py-4 font-bold text-on-surface">
                      {category.name}
                      {category.description && <p className="text-xs text-slate-500 font-normal mt-1 line-clamp-1">{category.description}</p>}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{category.slug}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => edit(category)} title="Sửa" className="p-2 hover:bg-primary/10 text-primary rounded transition-colors">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button onClick={() => remove(category.id)} title="Xóa" className="p-2 hover:bg-error-container text-error rounded transition-colors">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  );
}

export default function AdminCategoriesPage() {
  return (
    <Protected adminOnly>
      <AdminCategoriesContent />
    </Protected>
  );
}
