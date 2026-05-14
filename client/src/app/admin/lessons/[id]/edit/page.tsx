"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ErrorMessage } from "../../../../../components/ui";
import { api, type Category } from "../../../../../lib/api";
import RichTextEditor from "../../../../../components/admin/RichTextEditor";

const emptyLessonForm = {
  title: "",
  slug: "",
  description: "",
  content: "",
  imageUrl: "",
  videoUrl: "",
  categoryId: "",
  grade: "" as string | number,
  isActive: true
};

export default function AdminEditLessonPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyLessonForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    Promise.all([
      api.getCategories(),
      api.getLesson(id)
    ])
    .then(([catRes, lessonRes]) => {
      setCategories(catRes);
      setForm({
        title: lessonRes.title,
        slug: lessonRes.slug,
        description: lessonRes.description ?? "",
        content: lessonRes.content ?? "",
        imageUrl: lessonRes.imageUrl ?? "",
        videoUrl: lessonRes.videoUrl ?? "",
        categoryId: lessonRes.categoryId,
        grade: lessonRes.grade ?? "",
        isActive: lessonRes.isActive
      });
    })
    .catch(err => {
      console.error(err);
      setError("Không thể tải thông tin bài học");
    })
    .finally(() => {
      setInitialLoading(false);
    });
  }, [id]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Clean up form data
      const data = {
        ...form,
        grade: form.grade === "" ? null : Number(form.grade)
      };

      await api.updateLesson(id, data);
      router.push("/admin/lessons");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot save lesson");
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-8 text-center text-stone-500">Đang tải thông tin bài học...</div>;
  }

  return (
    <div className="max-w-4xl">
      <header className="mb-8 flex items-center gap-3">
        <Link href="/admin/lessons" className="text-stone-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined mt-1">arrow_back</span>
        </Link>
        <h2 className="font-bold font-headline text-2xl text-primary">Chỉnh sửa Bài học</h2>
      </header>

      <section className="bg-white rounded-2xl shadow-sm overflow-hidden p-8 border border-stone-200">
        <ErrorMessage message={error} />
        
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-stone-700 mb-2">Tiêu đề bài học</label>
              <input 
                type="text" 
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required 
                className="w-full rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 px-4 py-3 text-sm transition-all outline-none"
                placeholder="Nhập tiêu đề..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Slug (đường dẫn URL)</label>
              <input 
                type="text" 
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 px-4 py-3 text-sm transition-all outline-none"
                placeholder="bai-hoc-van-hoc"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Danh mục</label>
              <select 
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required 
                className="w-full rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 px-4 py-3 text-sm transition-all outline-none"
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
              <label className="block text-sm font-bold text-stone-700 mb-2">Lớp</label>
              <select 
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value ? Number(e.target.value) : "" })}
                className="w-full rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 px-4 py-3 text-sm transition-all outline-none"
              >
                <option value="">Không chọn lớp</option>
                <optgroup label="THCS">
                  <option value="6">Lớp 6</option>
                  <option value="7">Lớp 7</option>
                  <option value="8">Lớp 8</option>
                  <option value="9">Lớp 9</option>
                </optgroup>
                <optgroup label="THPT">
                  <option value="10">Lớp 10</option>
                  <option value="11">Lớp 11</option>
                  <option value="12">Lớp 12</option>
                </optgroup>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-stone-700 mb-2">Đường dẫn hình ảnh (URL)</label>
              <input 
                type="url" 
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 px-4 py-3 text-sm transition-all outline-none" 
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-stone-700 mb-2">Đường dẫn Video (Youtube/Vimeo URL)</label>
              <input 
                type="url" 
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                className="w-full rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 px-4 py-3 text-sm transition-all outline-none" 
                placeholder="https://..."
              />
            </div>
            
            <div className="md:col-span-2 flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isActive" className="text-sm font-bold text-stone-700 cursor-pointer">Bài học đang hoạt động (Hiển thị cho học sinh)</label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-stone-700 mb-2">Mô tả tóm tắt</label>
              <textarea 
                rows={3} 
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 px-4 py-3 text-sm transition-all outline-none"
                placeholder="Nhập mô tả ngắn..."
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-stone-700 mb-2">Nội dung chi tiết</label>
              <RichTextEditor 
                value={form.content}
                onChange={(content) => setForm({ ...form, content })}
                placeholder="Nhập nội dung bài học..."
              />
            </div>
          </div>
          
          <div className="pt-6 border-t border-stone-100 flex justify-end gap-3">
            <Link href="/admin/lessons" className="px-6 py-3 border border-stone-300 rounded-xl text-sm font-bold hover:bg-stone-50 transition-colors text-stone-600">
              Hủy
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-opacity-90 shadow-lg shadow-primary/20 transition disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
