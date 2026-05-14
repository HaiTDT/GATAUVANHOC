"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ErrorMessage } from "../../../components/ui";
import { api, type Lesson } from "../../../lib/api";

export default function LessonDetailPage() {
  const params = useParams<{ id: string }>();
  const lessonId = params.id;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const lessonData = await api.getLesson(lessonId);
      setLesson(lessonData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải bài học");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  if (!lesson) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <ErrorMessage message={error} />
        {!error && <p className="text-sm text-stone-600">Đang tải bài học...</p>}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="bg-white rounded-2xl p-6 md:p-10 organic-shadow border border-stone-100">
        
        <div className="mb-8 border-b border-stone-100 pb-8">
          <span className="inline-block px-3 py-1 bg-pearl text-primary text-xs font-bold rounded-full mb-4">
            {lesson.category?.name || "Bài học"}
          </span>
          <h1 className="text-3xl md:text-5xl font-headline font-bold text-stone-900 leading-tight mb-4">
            {lesson.title}
          </h1>
          <p className="text-stone-500 text-sm md:text-base leading-relaxed">
            {lesson.description || "Nội dung đang được cập nhật."}
          </p>
        </div>

        {lesson.videoUrl && (
          <div className="mb-10 rounded-xl overflow-hidden shadow-sm border border-stone-100 bg-stone-50">
            <div className="aspect-video relative">
              <iframe 
                src={lesson.videoUrl.replace("watch?v=", "embed/")} 
                title={lesson.title}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            </div>
          </div>
        )}

        <div className="prose prose-stone max-w-none md:prose-lg lg:prose-xl prose-headings:font-headline prose-headings:text-primary prose-a:text-sage hover:prose-a:text-primary prose-img:rounded-xl">
          <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </div>
        
      </div>
    </div>
  );
}
