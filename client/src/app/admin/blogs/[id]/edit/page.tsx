"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ErrorMessage } from "../../../../../components/ui";
import { api } from "../../../../../lib/api";

const emptyBlogForm = {
  title: "",
  excerpt: "",
  content: "",
  imageUrl: "",
  isActive: true
};

export default function AdminEditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [form, setForm] = useState(emptyBlogForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    api.getBlog(id)
      .then((blog) => {
        setForm({
          title: blog.title,
          excerpt: blog.excerpt ?? "",
          content: blog.content,
          imageUrl: blog.imageUrl ?? "",
          isActive: blog.isActive
        });
      })
      .catch((err) => {
        console.error(err);
        setError("Không thể tải thông tin bài viết");
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
      await api.updateBlog(id, form);
      router.push("/admin/blogs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot save blog");
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải thông tin bài viết...</div>;
  }

  return (
    <div className="max-w-4xl">
      <header className="mb-8 flex items-center gap-3">
        <Link href="/admin/blogs" className="text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined mt-1">arrow_back</span>
        </Link>
        <h2 className="font-bold font-headline text-2xl text-primary">Chỉnh sửa bài viết</h2>
      </header>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden p-8 organic-shadow border border-outline-variant/30">
        <ErrorMessage message={error} />
        
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-on-surface mb-2">Tiêu đề bài viết</label>
              <input 
                type="text" 
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required 
                className="w-full rounded-lg border-surface-variant bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm transition-colors"
                placeholder="Nhập tiêu đề..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-on-surface mb-2">Đoạn trích (Mô tả ngắn gọn hiển thị ngoài trang chủ)</label>
              <input 
                type="text" 
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="w-full rounded-lg border-surface-variant bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm transition-colors"
                placeholder="Nhập đoạn tóm tắt ngắn gọn..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-on-surface mb-2">Đường dẫn hình ảnh (URL thumbnail)</label>
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
              <label htmlFor="isActive" className="text-sm font-medium text-on-surface cursor-pointer">Bài viết đang hoạt động (Hiển thị cho khách hàng)</label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-on-surface mb-2">Nội dung chi tiết</label>
              <textarea 
                rows={12} 
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full rounded-lg border-surface-variant bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm transition-colors font-mono"
                placeholder="Nhập nội dung bài viết..."
                required
              ></textarea>
            </div>
          </div>
          
          <div className="pt-6 border-t border-surface-variant flex justify-end gap-3">
            <Link href="/admin/blogs" className="px-6 py-3 border border-outline-variant/50 rounded-lg text-sm font-semibold hover:bg-surface-container-low transition-colors">
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
