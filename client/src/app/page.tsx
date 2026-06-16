import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { serverApi } from "@/lib/api-server";

export default async function Home() {
  let lessons: any[] = [];
  let blogs: any[] = [];
  let banners: any[] = [];

  try {
    const [blogsRes, lessonsRes, bannersRes] = await Promise.all([
      serverApi.getBlogs({ isActive: true, limit: 3 }),
      serverApi.getLessons({ limit: 8 }),
      serverApi.getBanners()
    ]);
    blogs = blogsRes.data || [];
    lessons = lessonsRes.data || [];
    banners = bannersRes || [];
  } catch (err) {
    console.error("Failed to fetch home page data", err);
  }

  const activeBanner = banners.length > 0 ? banners[0] : null;

  return (
    <>
      {/* PHẦN 1: HERO BANNER */}
      <section className="mb-12 md:mb-24">
        <div className="relative rounded-xl overflow-hidden bg-surface-container-low min-h-[300px] md:min-h-[500px] flex items-center">
          <div className="absolute inset-0 z-0">
            <SafeImage 
              className="object-cover opacity-90"
              alt="banner background"
              src={activeBanner?.imageUrl || "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80"} 
              fill
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-pearl/90 via-pearl/40 to-transparent md:from-pearl/80 z-10"></div>
          </div>
          <div className="relative z-20 w-full md:w-3/4 lg:w-1/2 p-6 md:p-12 lg:p-20">
            <span
              className="inline-block px-3 py-1 bg-brand-dark text-white text-[10px] md:text-xs font-bold tracking-widest uppercase mb-4 md:mb-6 rounded-full">
              HỌC TẬP CHỦ ĐỘNG
            </span>
            <h1 className="font-headline text-3xl md:text-5xl lg:text-6xl font-extrabold text-brand-dark leading-tight mb-4 md:mb-6">
              {activeBanner?.title || <>Hành trình khám phá<br /><span className="italic font-light">Tri thức Văn học</span></>}
            </h1>
            <p className="text-on-surface text-sm md:text-lg mb-6 md:mb-8 max-w-md leading-relaxed">
              {activeBanner?.subtitle || "Nền tảng học tập chuyên sâu môn Ngữ Văn, giúp học sinh nắm vững kiến thức và rèn luyện kỹ năng làm bài hiệu quả."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link href={activeBanner?.linkUrl || "/lessons"}
                className="text-center bg-brand text-brand-dark px-8 py-3 md:py-4 rounded-full font-bold text-xs md:text-sm shadow-xl hover:scale-105 transition-transform inline-block border-2 border-brand-dark/10">
                VÀO HỌC NGAY
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PHẦN BÀI HỌC NỔI BẬT */}
      <section className="mb-12 md:mb-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-4">
          <div>
            <span className="text-brand-dark font-bold tracking-widest text-[10px] md:text-xs uppercase">BÀI HỌC TRỌNG TÂM</span>
            <h2 className="font-headline text-2xl md:text-4xl font-extrabold text-brand-dark mt-2">Bài học mới nhất</h2>
          </div>
          <Link href="/lessons" className="text-brand-dark text-sm font-bold flex items-center gap-2 hover:translate-x-2 transition-transform">
            Xem tất cả <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {lessons.length === 0 ? (
            <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center py-12 text-on-surface-variant font-medium text-sm border border-dashed rounded-xl">
              Chưa có bài học nào.
            </div>
          ) : (
            lessons.map((lesson: any) => (
              <Link key={lesson.id} href={`/lessons/${lesson.id}`} className="group bg-surface-container-lowest rounded-xl overflow-hidden organic-shadow flex flex-col hover:-translate-y-2 transition-transform duration-300 cursor-pointer border border-outline-variant/30">
                <div className="block aspect-[4/3] overflow-hidden bg-surface-container-low relative">
                  <SafeImage 
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    alt={lesson.title} 
                    src={lesson.imageUrl || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80'} 
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-xs text-brand-dark opacity-70 mb-1 font-bold">{lesson.category?.name || "Bài học"}</span>
                  <h3 className="font-bold text-brand-dark text-sm md:text-base mb-2 group-hover:underline line-clamp-2 leading-snug">{lesson.title}</h3>
                  <div className="flex items-center justify-between mt-auto pt-2 text-brand-dark font-bold text-sm">
                    <span>Học ngay</span>
                    <span className="material-symbols-outlined text-[16px]">menu_book</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* PHẦN 3: BLOG KIẾN THỨC */}
      <section className="mb-12 md:mb-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-4">
          <div>
            <span className="text-brand-dark font-bold tracking-widest text-[10px] md:text-xs uppercase">BÍ QUYẾT HỌC TẬP</span>
            <h2 className="font-headline text-2xl md:text-4xl font-extrabold text-brand-dark mt-2">Blog kiến thức</h2>
          </div>
          <Link href="/blogs" className="text-brand-dark text-sm font-bold flex items-center gap-2 hover:translate-x-2 transition-transform">
            Xem tất cả bài viết <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {blogs.length === 0 ? (
             <div className="col-span-1 sm:col-span-2 md:col-span-3 text-center py-12 text-slate-500 bg-surface-container-lowest rounded-xl border border-surface-container border-dashed text-sm">
                Chưa có bài viết nào.
             </div>
          ) : (
            blogs.map((blog: any) => (
              <Link key={blog.id} href={`/blogs/${blog.id}`} className="group cursor-pointer">
                <article>
                  <div className="aspect-[16/10] rounded-xl overflow-hidden mb-4 md:mb-6 bg-surface-container-low organic-shadow relative">
                    <SafeImage 
                      src={blog.imageUrl || "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80"} 
                      alt={blog.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                  <div className="flex items-center gap-4 text-[10px] md:text-xs font-bold text-brand-dark opacity-60 mb-2 md:mb-3 uppercase tracking-wider">
                    <span>Kiến thức</span>
                    <span>•</span>
                    <span>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <h3 className="font-headline text-lg md:text-xl font-bold text-brand-dark mb-2 md:mb-3 group-hover:text-brand-dark/80 transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-slate-600 line-clamp-2 md:line-clamp-3 text-xs md:text-sm leading-relaxed">
                    {blog.excerpt || blog.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "..."}
                  </p>
                </article>
              </Link>
            ))
          )}
        </div>
      </section>
    </>
  );
}
