"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, formatPrice, type FlashSaleCampaign } from "@/lib/api";

export default function FlashSalePage() {
  const [campaign, setCampaign] = useState<FlashSaleCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    api.getFeaturedFlashSale()
      .then(res => setCampaign(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!campaign) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(campaign.endTime).getTime();
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
  }, [campaign]);

  const formatNum = (n: number) => n.toString().padStart(2, "0");

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-slate-500 font-medium">Đang tải danh sách khuyến mãi...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">bolt_slash</span>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Hiện không có Flash Sale nào</h2>
        <p className="text-slate-500 mb-8">Hãy quay lại sau để nhận những ưu đãi hấp dẫn nhất!</p>
        <Link href="/products" className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:opacity-90 transition">
          Xem các sản phẩm khác
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <header className="mb-12 text-center bg-orange-50 py-16 rounded-3xl organic-shadow border border-orange-100">
        <span className="inline-block px-4 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-full mb-6 animate-bounce">
          GIỚI HẠN THỜI GIAN
        </span>
        <h1 className="font-headline text-5xl font-extrabold text-orange-900 mb-6 uppercase tracking-tight">
          {campaign.name}
        </h1>
        
        <div className="flex justify-center items-center gap-4 mb-8">
          <div className="text-center">
            <div className="bg-orange-600 text-white w-16 h-16 flex items-center justify-center rounded-xl text-2xl font-mono font-bold shadow-xl">
              {formatNum(timeLeft.hours)}
            </div>
            <span className="text-[10px] font-bold text-orange-700 uppercase mt-2 block">Giờ</span>
          </div>
          <div className="text-orange-600 font-bold text-2xl pb-6">:</div>
          <div className="text-center">
            <div className="bg-orange-600 text-white w-16 h-16 flex items-center justify-center rounded-xl text-2xl font-mono font-bold shadow-xl">
              {formatNum(timeLeft.minutes)}
            </div>
            <span className="text-[10px] font-bold text-orange-700 uppercase mt-2 block">Phút</span>
          </div>
          <div className="text-orange-600 font-bold text-2xl pb-6">:</div>
          <div className="text-center">
            <div className="bg-orange-600 text-white w-16 h-16 flex items-center justify-center rounded-xl text-2xl font-mono font-bold shadow-xl animate-pulse">
              {formatNum(timeLeft.seconds)}
            </div>
            <span className="text-[10px] font-bold text-orange-700 uppercase mt-2 block">Giây</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {campaign.items?.map((item) => {
          const p = item.product;
          const salePrice = Number(p.price) * (1 - item.discountPercentage / 100);
          
          return (
            <Link key={p.id} href={`/products/${p.id}`} className="group bg-white rounded-2xl overflow-hidden organic-shadow flex flex-col hover:-translate-y-2 transition-transform duration-300">
              <div className="aspect-square overflow-hidden bg-slate-50 relative">
                <img 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  alt={p.name} 
                  src={p.imageUrl || 'https://via.placeholder.com/400'} 
                />
                <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                  -{item.discountPercentage}%
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-slate-800 text-lg mb-4 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
                  {p.name}
                </h3>
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-orange-600 font-bold text-2xl">{formatPrice(salePrice)}</span>
                    <span className="text-slate-400 line-through text-xs ml-2 block">{formatPrice(p.price)}</span>
                  </div>
                  <button className="bg-slate-900 text-white w-10 h-10 rounded-full hover:bg-orange-600 transition-colors flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
