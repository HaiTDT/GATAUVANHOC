"use client";

import { useEffect, useState } from "react";
import { api, Course, formatPrice } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { Protected } from "@/components/Protected";
import Link from "next/link";
import { ErrorMessage } from "@/components/ui";

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.getMyCourses();
      setCourses(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  return (
    <Protected>
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-primary text-4xl">school</span>
             <h1 className="text-4xl font-extrabold text-stone-900 font-headline">Khóa học của tôi</h1>
          </div>
          <p className="text-stone-500 max-w-2xl font-medium">
            Nơi lưu trữ tất cả các khóa học bạn đã tham gia. Hãy tiếp tục hành trình khám phá tri thức văn học cùng Ga Tàu Văn Học nhé!
          </p>
        </header>

        <ErrorMessage message={error} />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-stone-50 rounded-[2rem] aspect-[4/5] animate-pulse" />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="group bg-white rounded-[2rem] overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-[16/10] overflow-hidden">
                  {course.imageUrl ? (
                    <img 
                      src={course.imageUrl} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-stone-200">image</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                     <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                       Đã sở hữu
                     </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-stone-900 line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-xs text-stone-400 font-bold uppercase tracking-widest">
                     <span className="flex items-center gap-1">
                       <span className="material-symbols-outlined text-[16px]">play_circle</span>
                       Vào học ngay
                     </span>
                  </div>

                  <Link 
                    href={`/courses/${course.slug}`}
                    className="block w-full py-3 bg-stone-900 text-white text-center rounded-xl font-bold hover:bg-primary transition-all shadow-lg shadow-stone-900/10"
                  >
                    Tiếp tục học
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-stone-50 rounded-[3rem] border-2 border-dashed border-stone-200">
            <span className="material-symbols-outlined text-6xl text-stone-200 mb-4">history_edu</span>
            <h2 className="text-xl font-bold text-stone-900 mb-2">Bạn chưa sở hữu khóa học nào</h2>
            <p className="text-stone-500 mb-8">Hãy khám phá kho tàng kiến thức tại thư viện khóa học của chúng tôi.</p>
            <Link 
              href="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-primary/20 transition-all"
            >
              Xem danh sách khóa học
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        )}
      </div>
    </Protected>
  );
}
