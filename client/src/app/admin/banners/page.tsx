"use client";

import { FormEvent, useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { EmptyState, ErrorMessage } from "@/components/ui";
import { api, type Banner } from "@/lib/api";

const emptyForm = { 
  title: "", 
  subtitle: "", 
  imageUrl: "", 
  linkUrl: "", 
  order: 0, 
  isActive: true 
};

function AdminBannersContent() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminBanners();
      setBanners(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách banner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      if (editingId) {
        await api.updateBanner(editingId, form);
      } else {
        await api.createBanner(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu banner");
    }
  };

  const edit = (banner: Banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle ?? "",
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl ?? "",
      order: banner.order,
      isActive: banner.isActive
    });
  };

  const remove = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa banner này?")) {
      return;
    }

    try {
      await api.deleteBanner(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa banner");
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      await api.updateBanner(banner.id, { isActive: !banner.isActive });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật trạng thái");
    }
  };

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <h2 className="font-bold font-headline text-2xl text-primary">Quản lý Banner trang chủ</h2>
      </header>
      
      <ErrorMessage message={error} />
      
      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        <form className="space-y-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 organic-shadow h-fit" onSubmit={submit}>
          <h2 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">{editingId ? 'edit_square' : 'add_photo_alternate'}</span>
            {editingId ? "Sửa Banner" : "Thêm Banner mới"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Tiêu đề chính</label>
              <input className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none" onChange={(e) => setForm({ ...form, title: e.target.value })} required value={form.title} placeholder="Ví dụ: Hành trình khám phá tri thức..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Tiêu đề phụ</label>
              <input className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none" onChange={(e) => setForm({ ...form, subtitle: e.target.value })} value={form.subtitle} placeholder="Nhập mô tả ngắn gọn..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">URL Hình ảnh</label>
              <input className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none" onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required value={form.imageUrl} placeholder="https://images.unsplash.com/..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Link liên kết (tùy chọn)</label>
              <input className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none" onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} value={form.linkUrl} placeholder="/lessons hoặc https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Thứ tự hiển thị</label>
                <input type="number" className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none" onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} value={form.order} />
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer py-2.5">
                  <input type="checkbox" className="w-4 h-4 accent-primary" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                  <span className="text-sm font-semibold text-on-surface">Kích hoạt</span>
                </label>
              </div>
            </div>
          </div>

          {form.imageUrl && (
            <div className="mt-4 rounded-lg overflow-hidden border border-outline-variant/30 aspect-video bg-stone-100">
               <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Invalid+Image+URL')} />
            </div>
          )}

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
          {loading ? (
             <div className="p-20 flex justify-center">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
             </div>
          ) : banners.length === 0 ? (
            <div className="p-8">
              <EmptyState message="Chưa có banner nào." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-widest font-bold">
                    <th className="px-6 py-4 border-b border-surface-container">Banner</th>
                    <th className="px-6 py-4 border-b border-surface-container text-center">Thứ tự</th>
                    <th className="px-6 py-4 border-b border-surface-container text-center">Trạng thái</th>
                    <th className="px-6 py-4 border-b border-surface-container text-center w-32">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-sm">
                  {banners.map((banner) => (
                    <tr className="hover:bg-surface-container-low/50 transition-colors" key={banner.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-24 aspect-video rounded overflow-hidden flex-shrink-0 bg-stone-100 border">
                             <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">{banner.title}</p>
                            {banner.subtitle && <p className="text-xs text-stone-500 line-clamp-1">{banner.subtitle}</p>}
                            {banner.linkUrl && <p className="text-[10px] text-primary font-mono mt-0.5">{banner.linkUrl}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-stone-600">{banner.order}</td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => toggleActive(banner)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${banner.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${banner.isActive ? 'bg-emerald-500' : 'bg-stone-400'}`}></span>
                          {banner.isActive ? 'Đang bật' : 'Đang tắt'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => edit(banner)} title="Sửa" className="p-2 hover:bg-primary/10 text-primary rounded transition-colors">
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button onClick={() => remove(banner.id)} title="Xóa" className="p-2 hover:bg-error-container text-error rounded transition-colors">
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default function AdminBannersPage() {
  return (
    <Protected adminOnly>
      <AdminBannersContent />
    </Protected>
  );
}
