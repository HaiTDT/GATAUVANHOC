"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, type Course } from "../../lib/api";
import { useAuth } from "../../components/AuthProvider";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.getCourses()
      .then(setCourses)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-stone-900 tracking-tight">
          Khoá Học <span className="text-primary italic">Chuyên Sâu</span>
        </h1>
        <p className="text-stone-500 max-w-2xl mx-auto text-lg">
          Nâng cao kiến thức văn học với các lộ trình bài tập được thiết kế bài bản và có sự đồng hành của giáo viên.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
          <span className="material-symbols-outlined text-6xl text-stone-200 mb-4">school</span>
          <p className="text-stone-500 font-medium">Hiện chưa có khóa học nào mới. Vui lòng quay lại sau!</p>
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const router = useRouter();

  return (
    <div className="group bg-white rounded-[2rem] overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative aspect-[16/10] overflow-hidden">
        {course.imageUrl ? (
          <img 
            src={course.imageUrl} 
            alt={course.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-stone-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-stone-300">image</span>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-extrabold text-primary shadow-sm">
          {course.price === 0 ? "MIỄN PHÍ" : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price)}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <h3 className="text-xl font-bold text-stone-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed">
          {course.description || "Khóa học chuyên sâu giúp bạn nắm vững kiến thức trọng tâm và rèn luyện kỹ năng làm bài tập văn học."}
        </p>
        
        <div className="pt-4 flex items-center justify-between border-t border-stone-50">
          <div className="flex items-center gap-2 text-stone-400 text-xs font-medium">
             <span className="material-symbols-outlined text-sm">group</span>
             <span>1.2k học viên</span>
          </div>
          <button 
            onClick={() => router.push(`/courses/${encodeURIComponent(course.slug || course.id)}`)}
            className="px-6 py-2 bg-stone-900 text-white rounded-full text-sm font-bold hover:bg-primary transition-colors shadow-lg shadow-stone-900/10 cursor-pointer"
          >
            Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
