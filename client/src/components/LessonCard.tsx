"use client";

import Link from "next/link";
import { type Lesson } from "../lib/api";

export function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <Link href={`/lessons/${lesson.id}`} className="group relative flex flex-col bg-white rounded-xl overflow-hidden transition-all duration-300 organic-shadow hover:-translate-y-1 border border-stone-50 dark:border-stone-800">
      <div className="aspect-[4/3] w-full relative overflow-hidden bg-stone-50 dark:bg-stone-800">
        <img
          alt={lesson.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={lesson.imageUrl || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80'}
        />
        
        <div className="absolute top-2 left-2 md:top-4 md:left-4 flex flex-col gap-2">
          <div className="bg-primary text-white px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-[9px] md:text-xs font-bold shadow-md w-fit">
            {lesson.category?.name || "Bài học"}
          </div>
          {lesson.grade && (
            <div className="bg-pearl text-primary border border-primary/20 px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-[9px] md:text-xs font-bold shadow-sm w-fit">
              Lớp {lesson.grade}
            </div>
          )}
        </div>
      </div>
      <div className="pt-3 md:pt-5 px-3 md:px-4 flex flex-col flex-1 pb-4 md:pb-5">
        <h3 className="text-on-surface font-headline font-bold text-sm md:text-lg leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {lesson.title}
        </h3>
        <p className="text-xs md:text-sm text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed mb-4">
          {lesson.description || "Nội dung đang được cập nhật. Học sinh vui lòng xem chi tiết bài học."}
        </p>
        <div className="flex items-center justify-between mt-auto border-t border-stone-100 dark:border-stone-800 pt-3 md:pt-4">
          <div className="flex items-center gap-1 text-primary text-xs md:text-sm font-bold">
            <span>Học ngay</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </div>
          {lesson.videoUrl && (
            <div className="flex items-center gap-1 text-sage text-[10px] md:text-xs font-medium">
              <span className="material-symbols-outlined text-[14px]">play_circle</span>
              <span>Có video</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
