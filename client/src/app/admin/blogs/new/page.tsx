"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ErrorMessage } from "@/components/ui";
import { api } from "@/lib/api";
import RichTextEditor from "@/components/admin/RichTextEditor";

const emptyBlogForm = {
  title: "",
  excerpt: "",
  content: "",
  imageUrl: "",
  isActive: true
};

export default function AdminNewBlogPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyBlogForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.createBlog(form);
      router.push("/admin/blogs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot save blog");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <header className="mb-8 flex items-center gap-3">
        <Link href="/admin/blogs" className="text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined mt-1">arrow_back</span>
        </Link>
        <h2 className="font-bold font-headline text-2xl text-primary">Thêm bài viết mới</h2>
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
              <RichTextEditor 
                value={form.content}
                onChange={(content) => setForm({ ...form, content })}
                placeholder="Nhập nội dung bài viết với hình ảnh, định dạng..."
              />
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
              {loading ? "Đang lưu..." : "Đăng bài viết"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
