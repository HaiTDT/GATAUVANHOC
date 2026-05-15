"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, ErrorMessage, PageHeader } from "@/components/ui";
import { api, type Category, type Lesson } from "@/lib/api";

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Bộ lọc
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  const load = async () => {
    try {
      setLoading(true);
      const result = await api.getLessons({
        search: search || undefined,
        categoryId: selectedCategoryId || undefined,
        limit: LIMIT,
        page
      });
      setLessons(result.data);
      setTotal(result.meta?.total || 0);
      setTotalPages(result.meta?.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải bài học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedCategoryId, page]);

  const remove = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài học này?")) return;
    try {
      await api.deleteLesson(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa bài học");
    }
  };

  return (
    <>
      <PageHeader 
        title="Quản lý Bài học" 
        description={`${total} bài học đã được tạo`}
        action={
          <Link
            href="/admin/lessons/new"
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-opacity-90 transition shadow-md"
          >
            <span className="material-symbols-outlined text-sm">add</span> Thêm mới
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-stone-400 text-[18px]">search</span>
          <input
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 bg-stone-50 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tên bài học..."
            type="text"
            value={search}
          />
        </div>

        <select
          className="rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all min-w-[180px]"
          onChange={(e) => { setSelectedCategoryId(e.target.value); setPage(1); }}
          value={selectedCategoryId}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <ErrorMessage message={error} />

      <section className="bg-white rounded-2xl shadow-sm overflow-hidden border border-stone-200">
        <div className="overflow-x-auto no-scrollbar">
          {loading ? (
            <div className="p-8 space-y-3 text-center">
              <p className="text-stone-500">Đang tải...</p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="p-8">
              <EmptyState message="Không tìm thấy bài học phù hợp." />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-[11px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Ảnh</th>
                  <th className="px-6 py-4">Tiêu đề</th>
                  <th className="px-6 py-4">Khối/Lớp</th>
                  <th className="px-6 py-4">Danh mục</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {lessons.map((l) => (
                  <tr className="hover:bg-stone-50 transition-colors" key={l.id}>
                    <td className="px-6 py-3">
                      {l.imageUrl ? (
                        <img src={l.imageUrl} alt={l.title} className="w-12 h-12 object-cover rounded-lg border border-stone-200" />
                      ) : (
                        <div className="w-12 h-12 bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-center text-[10px] text-stone-400">No img</div>
                      )}
                    </td>
                    <td className="px-6 py-3 font-bold text-stone-900 max-w-[300px]">
                      <span className="line-clamp-1">{l.title}</span>
                      <p className="text-[10px] text-stone-400 font-mono mt-0.5">{l.slug}</p>
                    </td>
                    <td className="px-6 py-3">
                      {l.grade ? (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">
                          Lớp {l.grade}
                        </span>
                      ) : (
                        <span className="text-xs text-stone-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs bg-sage/20 text-primary px-2 py-1 rounded-full font-bold">
                        {l.category?.name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${l.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                        {l.isActive ? "Hiển thị" : "Ẩn"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/lessons/${l.slug}`} target="_blank" className="p-2 hover:bg-stone-100 text-stone-500 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </Link>
                        <Link href={`/admin/lessons/${l.id}/assignments`} className="p-2 hover:bg-orange-50 text-orange-600 rounded-lg transition-colors" title="Quản lý bài tập">
                          <span className="material-symbols-outlined text-lg">assignment</span>
                        </Link>
                        <Link href={`/admin/lessons/${l.id}/edit`} className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </Link>
                        <button onClick={() => remove(l.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100 bg-stone-50/50">
            <p className="text-xs text-stone-500">
              Trang {page} / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold hover:bg-white disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                Trước
              </button>
              <button
                className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold hover:bg-white disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
