import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { serverApi } from "@/lib/api-server";

export default async function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let blog: any = null;
  let relatedBlogs: any[] = [];

  try {
    const [blogRes, relatedRes] = await Promise.all([
      serverApi.getBlog(id),
      serverApi.getBlogs({ isActive: true, limit: 4 })
    ]);
    blog = blogRes;
    relatedBlogs = relatedRes.data.filter((b: any) => b.id !== id).slice(0, 3);
  } catch (err) {
    console.error("Failed to fetch blog details", err);
  }

  if (!blog) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">Không tìm thấy bài viết</h2>
        <Link href="/" className="text-secondary font-bold hover:underline">Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-surface-container-lowest pb-24">
      {/* Hero Section with Image */}
      <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden mb-12">
        <SafeImage 
          src={blog.imageUrl || "https://images.unsplash.com/photo-1615397323214-729227520e5c?auto=format&fit=crop&q=80&w=1600"} 
          alt={blog.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end">
          <div className="container mx-auto px-4 pb-16">
            <div className="max-w-4xl">
              <nav className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-widest mb-6">
                <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                <span className="text-secondary-fixed">Bí quyết làm đẹp</span>
              </nav>
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
                {blog.title}
              </h1>
              <div className="flex items-center gap-6 text-white/80 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-lg">calendar_today</span>
                  {new Date(blog.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-lg">person</span>
                  Hasaki Beauty
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Main Content */}
          <article className="lg:w-2/3">
            {blog.excerpt && (
              <p className="text-xl text-slate-600 font-medium italic mb-10 border-l-4 border-secondary pl-6 leading-relaxed">
                {blog.excerpt.replace(/&nbsp;|\u00A0/g, " ")}
              </p>
            )}
            
            <div 
              className="prose prose-lg max-w-none prose-headings:font-headline prose-headings:text-primary prose-p:text-slate-700 prose-img:rounded-2xl prose-img:shadow-xl blog-content break-words"
              dangerouslySetInnerHTML={{ __html: blog.content.replace(/&nbsp;|\u00A0/g, " ") }}
            />

            {/* Social Share & Tags */}
            <div className="mt-16 pt-8 border-t border-surface-container flex flex-wrap justify-between items-center gap-6">
              <div className="flex gap-2">
                {['Skincare', 'Beauty Tips', 'Hasaki'].map(tag => (
                  <span key={tag} className="px-4 py-1.5 bg-surface-container text-on-surface-variant rounded-full text-xs font-bold uppercase tracking-wider">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chia sẻ:</span>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                    <span className="material-symbols-outlined text-lg">share</span>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                    <span className="material-symbols-outlined text-lg">content_copy</span>
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:w-1/3">
            <div className="sticky top-24 space-y-12">
              {/* Popular Articles */}
              <div>
                <h3 className="font-headline text-2xl font-extrabold text-primary mb-8 flex items-center gap-3">
                  Bài viết liên quan
                  <div className="h-1 flex-1 bg-gradient-to-r from-secondary/50 to-transparent rounded-full"></div>
                </h3>
                <div className="space-y-8">
                  {relatedBlogs.map((item: any) => (
                    <Link key={item.id} href={`/blogs/${item.id}`} className="flex gap-4 group">
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container relative">
                        <SafeImage 
                          src={item.imageUrl || "https://images.unsplash.com/photo-1615397323214-729227520e5c?auto=format&fit=crop&q=80&w=200"} 
                          alt={item.title}
                          fill
                          sizes="96px"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Tin tức</span>
                        <h4 className="font-bold text-primary text-sm line-clamp-2 group-hover:text-secondary transition-colors leading-snug">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 mt-2 font-medium">
                          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Newsletter or Promo */}
              <div className="bg-primary rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-4xl text-secondary mb-4">mail</span>
                  <h3 className="text-xl font-bold mb-4 leading-tight">Đăng ký nhận bản tin làm đẹp từ chuyên gia</h3>
                  <p className="text-white/70 text-sm mb-6">Cập nhật xu hướng làm đẹp mới nhất và nhận voucher ưu đãi mỗi tuần.</p>
                  <div className="space-y-3">
                    <input 
                      type="email" 
                      placeholder="Email của bạn" 
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:bg-white/20 transition-colors"
                    />
                    <button className="w-full bg-secondary text-on-secondary font-bold py-3 rounded-lg text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">
                      ĐĂNG KÝ NGAY
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
