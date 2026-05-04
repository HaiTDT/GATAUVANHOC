"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, formatPrice, type Blog, type FlashSaleCampaign } from "@/lib/api";

export default function Home() {
  const [featuredCampaign, setFeaturedCampaign] = useState<FlashSaleCampaign | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    Promise.all([
      api.getFeaturedFlashSale(),
      api.getBlogs({ isActive: true, limit: 3 })
    ])
      .then(([flashRes, blogsRes]) => {
        setFeaturedCampaign(flashRes);
        setBlogs(blogsRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!featuredCampaign) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(featuredCampaign.endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [featuredCampaign]);

  const formatNum = (n: number) => n.toString().padStart(2, "0");

  return (
    <>
      {/* PHẦN 1: HERO BANNER */}
      <section className="mb-24">
        <div className="relative rounded-xl overflow-hidden bg-surface-container-low min-h-[500px] flex items-center">
          <div className="absolute inset-0 z-0">
            <img className="w-full h-full object-cover opacity-90"
              alt="high-end skincare products arranged artistically with organic monstera leaves and soft morning sunlight shadows on a clean stone surface"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuq5KQRKI6pLLqdowa9k034oGlNbSaPGYzg9WdBqu9o9caSR3FtNlQPT_VWezRh8MWNTmFtqbJmbd18aRpWqYE9PM2pzkOIFxjRe58_emm5iNg-lYd2UEzHxkjxULQKIVAMqXY6BQfjVfyxYaol9okqK4fSBeWAubE2ZZoA4JWlfID7YRWut3MojWldKXwpTY44Fk8tAZ3d8NRA5NJo7NcJkrSE2cKGaQQgtItTRpSPfOTwXe26H4d48nLjvc06dPZWaNEXpaWqm01" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent"></div>
          </div>
          <div className="relative z-10 w-full md:w-1/2 p-12 lg:p-20">
            <span
              className="inline-block px-3 py-1 bg-primary-fixed text-on-primary-fixed text-xs font-bold tracking-widest uppercase mb-6 rounded-sm">BỘ
              SƯU TẬP MỚI</span>
            <h1 className="font-headline text-5xl lg:text-6xl font-extrabold text-primary leading-tight mb-6">Đánh thức vẻ đẹp
              <br /><span className="italic font-light">nguyên bản</span></h1>
            <p className="text-on-surface-variant text-lg mb-8 max-w-md leading-relaxed">Khám phá dòng sản phẩm nước hoa cao cấp
              với chiết xuất từ thảo mộc quý hiếm, giúp phục hồi và trẻ hóa làn da từ sâu bên trong.</p>
            <div className="flex gap-4">
              <Link href="/products"
                className="cta-gradient text-white px-8 py-4 rounded-md font-bold text-sm shadow-lg hover:scale-105 transition-transform inline-block">KHÁM
                PHÁ NGAY</Link>
              <Link href="/products?sale=true"
                className="bg-white/50 backdrop-blur-sm text-primary px-8 py-4 rounded-md font-bold text-sm hover:bg-white transition-colors inline-block">XEM
                ƯU ĐÃI</Link>
            </div>
          </div>
        </div>
      </section>

      {/* PHẦN 2: FLASH SALE */}
      {featuredCampaign && (
        <section className="mb-24">
          <div className="bg-secondary-fixed rounded-xl p-8 lg:p-12 relative overflow-hidden organic-shadow border border-secondary-fixed/50">
            <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-secondary text-4xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                <div>
                  <h2 className="font-headline text-3xl font-extrabold text-on-secondary-fixed uppercase tracking-tight">{featuredCampaign.name}</h2>
                  <p className="text-on-secondary-fixed-variant text-xs font-bold uppercase tracking-widest mt-1 opacity-70">Ưu đãi giới hạn - Đừng bỏ lỡ!</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <div className="bg-on-secondary-fixed text-white px-3 py-2 rounded font-mono font-bold shadow-lg">{formatNum(timeLeft.hours)}</div>
                  <div className="text-on-secondary-fixed font-bold py-2">:</div>
                  <div className="bg-on-secondary-fixed text-white px-3 py-2 rounded font-mono font-bold shadow-lg">{formatNum(timeLeft.minutes)}</div>
                  <div className="text-on-secondary-fixed font-bold py-2">:</div>
                  <div className="bg-on-secondary-fixed text-white px-3 py-2 rounded font-mono font-bold shadow-lg animate-pulse">{formatNum(timeLeft.seconds)}</div>
                </div>
              </div>
              <Link className="text-on-secondary-fixed-variant font-bold border-b-2 border-on-secondary-fixed-variant pb-1 hover:opacity-70 transition-opacity"
                href="/flash-sale">Xem tất cả deal hời</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-[400px] rounded-xl bg-surface-container-lowest/50 animate-pulse" />
                ))
              ) : !featuredCampaign.items || featuredCampaign.items.length === 0 ? (
                <div className="col-span-3 text-center py-12 text-on-secondary-fixed-variant font-medium">
                  Chưa có sản phẩm Flash Sale nào được thiết lập.
                </div>
              ) : (
                featuredCampaign.items
                  .sort((a, b) => b.discountPercentage - a.discountPercentage)
                  .slice(0, 6)
                  .map((item) => {
                    const p = item.product;
                    const salePrice = Number(p.price) * (1 - item.discountPercentage / 100);
                    
                    return (
                      <Link key={p.id} href={`/products/${p.id}`} className="group bg-surface-container-lowest rounded-xl overflow-hidden organic-shadow flex flex-col hover:-translate-y-2 transition-transform duration-300 cursor-pointer">
                        <div className="block aspect-square overflow-hidden bg-surface-container-low relative">
                          <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            alt={p.name} src={p.imageUrl || 'https://via.placeholder.com/400'} />
                          <div className="absolute top-4 left-4 bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded shadow-lg flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                            -{item.discountPercentage}%
                          </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="font-bold text-primary text-lg mb-4 group-hover:underline line-clamp-2 leading-snug">{p.name}</h3>
                          <div className="flex items-center justify-between mt-auto">
                            <div>
                              <span className="text-secondary font-bold text-2xl">{formatPrice(salePrice)}</span>
                              <span className="text-slate-400 line-through text-xs ml-2">{formatPrice(p.price)}</span>
                            </div>
                            <button className="bg-primary text-white w-10 h-10 rounded-full hover:bg-primary-container hover:text-primary transition-colors flex items-center justify-center shadow-md">
                              <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                            </button>
                          </div>
                        </div>
                      </Link>
                    );
                  })
              )}
            </div>
          </div>
        </section>
      )}

      {/* PHẦN 3: BLOG / TIN TỨC LÀM ĐẸP */}
      <section className="mb-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-secondary font-bold tracking-widest text-xs uppercase">BÍ QUYẾT TỪ CHUYÊN GIA</span>
            <h2 className="font-headline text-4xl font-extrabold text-primary mt-2">Góc làm đẹp & Tin tức</h2>
          </div>
          <Link href="#" className="text-primary font-bold flex items-center gap-2 hover:translate-x-2 transition-transform">
            Xem tất cả bài viết <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
             Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-[350px] rounded-xl bg-surface-container-low animate-pulse" />
            ))
          ) : blogs.length === 0 ? (
             <div className="col-span-3 text-center py-12 text-slate-500 bg-surface-container-lowest rounded-xl border border-surface-container border-dashed">
                Chưa có bài viết nào. (Đăng nhập Admin để thêm bài viết)
             </div>
          ) : (
            blogs.map((blog) => (
              <Link key={blog.id} href={`/blogs/${blog.id}`} className="group cursor-pointer">
                <article>
                  <div className="aspect-[16/10] rounded-xl overflow-hidden mb-6 bg-surface-container-low organic-shadow">
                    <img 
                      src={blog.imageUrl || "https://images.unsplash.com/photo-1615397323214-729227520e5c?auto=format&fit=crop&q=80&w=800"} 
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                    <span className="text-secondary">Làm đẹp</span>
                    <span>•</span>
                    <span>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <h3 className="font-headline text-xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-slate-600 line-clamp-3 text-sm leading-relaxed">
                    {blog.excerpt || blog.content.substring(0, 150) + "..."}
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
