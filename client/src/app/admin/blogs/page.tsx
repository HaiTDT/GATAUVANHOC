"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, ErrorMessage } from "@/components/ui";
import { api, type Blog } from "@/lib/api";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const result = await api.getBlogs({ limit: 100 });
      setBlogs(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot load blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
      return;
    }

    try {
      await api.deleteBlog(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot delete blog");
    }
  };

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <h2 className="font-bold font-headline text-2xl text-primary">Quản lý Blog (Trang chủ)</h2>
        <div className="flex items-center gap-4">
          <Link href="/admin/blogs/new" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-opacity-90 transition organic-shadow">
            <span className="material-symbols-outlined text-sm">add</span> Thêm bài viết mới
          </Link>
        </div>
      </header>
      
      <ErrorMessage message={error} />
      
      <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden organic-shadow border border-outline-variant/30">
        <div className="overflow-x-auto no-scrollbar">
          {loading ? (
            <p className="p-8 text-sm text-slate-600 text-center">Đang tải bài viết...</p>
          ) : blogs.length === 0 ? (
            <div className="p-8">
              <EmptyState message="Chưa có bài viết nào. Hãy bấm 'Thêm bài viết mới'." />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4 border-b border-surface-container">ID</th>
                  <th className="px-6 py-4 border-b border-surface-container">Ảnh</th>
                  <th className="px-6 py-4 border-b border-surface-container">Tiêu đề</th>
                  <th className="px-6 py-4 border-b border-surface-container text-center">Trạng thái</th>
                  <th className="px-6 py-4 border-b border-surface-container text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-sm">
                {blogs.map((b) => (
                  <tr className="hover:bg-surface-container-low/50 transition-colors" key={b.id}>
                    <td className="px-6 py-4 font-mono font-bold text-slate-600 text-xs">{b.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">
                      {b.imageUrl ? (
                        <img src={b.imageUrl} alt={b.title} className="w-16 h-12 object-cover rounded-md border border-surface-variant shadow-sm" />
                      ) : (
                        <div className="w-16 h-12 bg-surface-variant rounded-md border border-surface-container flex items-center justify-center text-xs text-slate-400">No img</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-on-surface">
                      {b.title}
                      <p className="font-normal text-xs text-slate-500 mt-1 line-clamp-1">{b.excerpt}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${b.isActive ? 'bg-primary/10 text-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                        {b.isActive ? "Hiển thị" : "Ẩn"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/blogs/${b.id}/edit`} title="Sửa" className="p-2 hover:bg-primary/10 text-primary rounded transition-colors">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </Link>
                        <button onClick={() => remove(b.id)} title="Xóa" className="p-2 hover:bg-error-container text-error rounded transition-colors">
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
