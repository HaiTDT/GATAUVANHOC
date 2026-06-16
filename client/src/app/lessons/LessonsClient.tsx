"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { LessonCard } from "@/components/LessonCard";
import { type Lesson, type Category } from "@/lib/api";

type Filters = {
  search: string;
  page: number;
  grade: string;
  categoryId: string;
};

export function LessonsClient({ 
  lessons, 
  categories, 
  meta 
}: { 
  lessons: Lesson[], 
  categories: Category[], 
  meta: { page: number, totalPages: number, total: number } 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: Filters = {
    search: searchParams.get("search") ?? "",
    grade: searchParams.get("grade") ?? "",
    categoryId: searchParams.get("categoryId") ?? "",
    page: Number(searchParams.get("page")) || 1,
  };

  const updateFilters = (next: Partial<Filters>) => {
    const newFilters = { ...filters, ...next, page: next.page ?? 1 };
    
    // Update URL
    const params = new URLSearchParams();
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.grade) params.set("grade", newFilters.grade);
    if (newFilters.categoryId) params.set("categoryId", newFilters.categoryId);
    if (newFilters.page > 1) params.set("page", String(newFilters.page));
    
    router.push(`/lessons?${params.toString()}`, { scroll: false });
  };

  const handleGradeToggle = (gradeValue: string) => {
    updateFilters({ grade: filters.grade === gradeValue ? "" : gradeValue });
  };

  const handleCategoryToggle = (id: string) => {
    updateFilters({ categoryId: filters.categoryId === id ? "" : id });
  };

  const groups = [
    { name: "THCS", grades: [6, 7, 8, 9] },
    { name: "THPT", grades: [10, 11, 12] }
  ];

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="relative flex flex-col items-center overflow-hidden rounded-xl bg-pearl p-12 text-center md:p-20 shadow-sm border border-stone-100">
          <h1 className="font-headline mb-4 text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
            Khám phá Kho Tàng Văn Học
          </h1>
          <p className="max-w-2xl leading-relaxed text-stone-600 dark:text-stone-300">
            Hệ thống bài học đa dạng từ cơ bản đến nâng cao, bao gồm Đọc hiểu, Nghị luận văn học và Nghị luận xã hội giúp học sinh nắm vững kiến thức.
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl flex-col md:flex-row gap-8 px-6 pb-24">
        {/* Left Sidebar Filter */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24 rounded-xl bg-white p-6 shadow-sm border border-stone-100">
            <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">filter_list</span>
              Bộ lọc bài học
            </h3>

            {/* Categories Section */}
            <div className="mb-8">
              <h4 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-4 px-2">
                Danh mục
              </h4>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${
                      filters.categoryId === category.id
                        ? "bg-primary/10 text-primary"
                        : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                    }`}
                  >
                    <span className="line-clamp-1">{category.name}</span>
                    {filters.categoryId === category.id && (
                      <span className="material-symbols-outlined text-xs">check</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {groups.map((group) => (
              <div key={group.name} className="mb-8 last:mb-0">
                <h4 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-4 px-2">
                  Khối {group.name}
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => handleGradeToggle(group.grades.join(","))}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${
                      filters.grade === group.grades.join(",")
                        ? "bg-primary/10 text-primary"
                        : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                    }`}
                  >
                    Tất cả {group.name}
                    {filters.grade === group.grades.join(",") && (
                      <span className="material-symbols-outlined text-xs">check</span>
                    )}
                  </button>
                  {group.grades.map((grade) => (
                    <button
                      key={grade}
                      onClick={() => handleGradeToggle(String(grade))}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${
                        filters.grade === String(grade)
                          ? "bg-primary/10 text-primary"
                          : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                      }`}
                    >
                      Lớp {grade}
                      {filters.grade === String(grade) && (
                        <span className="material-symbols-outlined text-xs">check</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={() => updateFilters({ grade: "", search: "", categoryId: "", page: 1 })}
              className="mt-4 w-full py-2 text-sm text-stone-500 hover:text-primary transition-colors flex items-center justify-center gap-2 border-t border-stone-50 pt-4"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              Xóa tất cả lọc
            </button>
          </div>
        </aside>

        <section className="flex-1">
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-stone-100">
            <div className="relative w-full md:max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 text-lg">search</span>
              <input
                className="w-full rounded-lg border border-stone-200 bg-stone-50 pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-on-surface"
                onChange={(event) => updateFilters({ search: event.target.value, page: 1 })}
                placeholder="Tìm kiếm bài học..."
                value={filters.search}
              />
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
              Đã tìm thấy {meta.total} bài học
            </p>
            <p className="text-sm text-stone-500">
              Trang {meta.page} / {meta.totalPages || 1}
            </p>
          </div>

          {lessons.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-16 text-center text-stone-500">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">menu_book</span>
              <p>Không tìm thấy bài học nào phù hợp với bộ lọc hiện tại.</p>
              <button 
                onClick={() => updateFilters({ grade: "", search: "", categoryId: "", page: 1 })}
                className="mt-4 text-primary font-bold hover:underline"
              >
                Xóa bộ lọc và xem tất cả
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {lessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} />
              ))}
            </div>
          )}

          <div className="mt-16 flex items-center justify-center gap-2">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg text-primary transition-all hover:bg-pearl disabled:opacity-40"
              disabled={meta.page <= 1}
              onClick={() => updateFilters({ page: meta.page - 1 })}
              type="button"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-bold text-white shadow-sm">
              {meta.page}
            </button>
            {meta.page + 1 <= meta.totalPages && (
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 transition-colors font-medium"
                onClick={() => updateFilters({ page: meta.page + 1 })}
                type="button"
              >
                {meta.page + 1}
              </button>
            )}
            {meta.page + 2 <= meta.totalPages && (
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 transition-colors font-medium"
                onClick={() => updateFilters({ page: meta.page + 2 })}
                type="button"
              >
                {meta.page + 2}
              </button>
            )}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg text-primary transition-all hover:bg-pearl disabled:opacity-40"
              disabled={meta.page >= meta.totalPages}
              onClick={() => updateFilters({ page: meta.page + 1 })}
              type="button"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
