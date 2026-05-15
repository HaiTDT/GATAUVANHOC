"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, ErrorMessage, PageHeader } from "@/components/ui";
import { api, type Course } from "@/lib/api";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminCourses();
      setCourses(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa khóa học này?")) return;
    try {
      await api.deleteAdminCourse(id);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageHeader 
        title="Quản lý Khóa học" 
        description={`${courses.length} khóa học hiện có`}
        action={
          <Link
            href="/admin/courses/new"
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-opacity-90 transition shadow-md"
          >
            <span className="material-symbols-outlined text-sm">add</span> Tạo khóa học mới
          </Link>
        }
      />

      <ErrorMessage message={error} />

      <section className="bg-white rounded-2xl shadow-sm overflow-hidden border border-stone-200">
        <div className="overflow-x-auto no-scrollbar">
          {loading ? (
            <div className="p-12 text-center text-stone-500">Đang tải...</div>
          ) : courses.length === 0 ? (
            <div className="p-12">
              <EmptyState message="Chưa có khóa học nào được tạo." />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-[11px] uppercase tracking-widest font-bold border-b border-stone-200">
                  <th className="px-6 py-4">Ảnh</th>
                  <th className="px-6 py-4">Tên khóa học</th>
                  <th className="px-6 py-4">Giá</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {courses.map((c) => (
                  <tr className="hover:bg-stone-50 transition-colors" key={c.id}>
                    <td className="px-6 py-3">
                      {c.imageUrl ? (
                        <img src={c.imageUrl} alt={c.title} className="w-12 h-12 object-cover rounded-lg border border-stone-200" />
                      ) : (
                        <div className="w-12 h-12 bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-center text-[10px] text-stone-400 uppercase font-bold">Course</div>
                      )}
                    </td>
                    <td className="px-6 py-3 font-bold text-stone-900">
                      <p>{c.title}</p>
                      <p className="text-[10px] text-stone-400 font-mono mt-0.5">{c.slug}</p>
                    </td>
                    <td className="px-6 py-3">
                      <span className="font-bold text-primary">
                        {c.price === 0 ? "Miễn phí" : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.price)}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                        {c.isActive ? "Hiển thị" : "Ẩn"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/admin/courses/${c.id}/assignments`} className="p-2 hover:bg-orange-50 text-orange-600 rounded-lg transition-colors" title="Quản lý bài tập">
                          <span className="material-symbols-outlined text-lg">assignment</span>
                        </Link>
                        <Link href={`/admin/courses/${c.id}/edit`} className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </Link>
                        <button onClick={() => handleDelete(c.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
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
