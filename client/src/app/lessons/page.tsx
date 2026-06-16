import { Suspense } from "react";
import { LessonsClient } from "./LessonsClient";
import { serverApi } from "@/lib/api-server";

export default async function LessonsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  
  const search = typeof resolvedParams?.search === 'string' ? resolvedParams.search : "";
  const grade = typeof resolvedParams?.grade === 'string' ? resolvedParams.grade : "";
  const categoryId = typeof resolvedParams?.categoryId === 'string' ? resolvedParams.categoryId : "";
  const page = Number(resolvedParams?.page) || 1;

  let lessons: any[] = [];
  let meta = { page: 1, totalPages: 1, total: 0 };
  let categories: any[] = [];

  try {
    const [lessonsRes, categoriesRes] = await Promise.all([
      serverApi.getLessons({ search, page, grade, categoryId, limit: 12 }),
      serverApi.getCategories()
    ]);
    lessons = lessonsRes.data || [];
    meta = lessonsRes.meta || { page: 1, totalPages: 1, total: 0 };
    categories = categoriesRes || [];
  } catch (err) {
    console.error("Failed to fetch lessons data", err);
  }

  return (
    <Suspense fallback={<div className="p-12 text-center text-stone-500">Đang tải danh sách bài học...</div>}>
      <LessonsClient lessons={lessons} categories={categories} meta={meta} />
    </Suspense>
  );
}
