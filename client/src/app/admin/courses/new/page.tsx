"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ErrorMessage } from "@/components/ui";
import { api } from "@/lib/api";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function AdminNewCoursePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    price: 0,
    imageUrl: "",
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.createAdminCourse(form);
      router.push("/admin/courses");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <header className="mb-8 flex items-center gap-3">
        <Link href="/admin/courses" className="text-stone-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined mt-1">arrow_back</span>
        </Link>
        <h2 className="font-bold font-headline text-2xl text-primary">Tạo Khóa học mới</h2>
      </header>

      <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        <ErrorMessage message={error} />
        
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-stone-700 mb-2">Tên khóa học</label>
              <input 
                type="text" 
                required 
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="Ví dụ: Khóa học Luyện thi THPT Quốc gia môn Văn"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Slug (URL)</label>
              <input 
                type="text" 
                value={form.slug}
                onChange={e => setForm({...form, slug: e.target.value})}
                className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="khoa-hoc-van-thpt"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Giá khóa học (VNĐ)</label>
              <input 
                type="number" 
                required 
                value={form.price}
                onChange={e => setForm({...form, price: Number(e.target.value)})}
                className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-stone-700 mb-2">Ảnh đại diện (URL)</label>
              <input 
                type="url" 
                value={form.imageUrl}
                onChange={e => setForm({...form, imageUrl: e.target.value})}
                className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-stone-700 mb-2">Mô tả ngắn</label>
              <textarea 
                rows={3}
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-stone-700 mb-2">Nội dung chi tiết</label>
              <RichTextEditor 
                value={form.content}
                onChange={val => setForm({...form, content: val})}
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <input 
                type="checkbox" 
                id="isActive"
                checked={form.isActive}
                onChange={e => setForm({...form, isActive: e.target.checked})}
                className="w-4 h-4 rounded border-stone-300 text-primary"
              />
              <label htmlFor="isActive" className="text-sm font-bold text-stone-700">Kích hoạt khóa học</label>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-100 flex justify-end gap-3">
            <Link href="/admin/courses" className="px-6 py-3 border border-stone-300 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-50">
              Hủy
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-opacity-90 disabled:opacity-50"
            >
              {loading ? "Đang tạo..." : "Tạo khóa học"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
