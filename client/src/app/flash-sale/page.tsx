"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, formatPrice, type FlashSaleCampaign } from "@/lib/api";
import { useCart } from "@/components/CartProvider";

export default function FlashSalePage() {
  const router = useRouter();
  const { refreshCart } = useCart();
  const [campaign, setCampaign] = useState<FlashSaleCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [addingId, setAddingId] = useState<string | null>(null);

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

  const handleAddToCart = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingId(productId);
    try {
      await api.addCartItem({ productId, quantity: 1 });
      refreshCart();
      alert("Đã thêm vào giỏ hàng thành công!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể thêm vào giỏ hàng");
    } finally {
      setAddingId(null);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.addCartItem({ productId, quantity: 1 });
      refreshCart();
      router.push("/cart");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể thực hiện mua ngay");
    }
  };

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
    <div className="pb-20 px-4 max-w-7xl mx-auto">
      <header className="mb-12 text-center bg-gradient-to-br from-orange-50 to-red-50 py-16 rounded-3xl organic-shadow border border-orange-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-200/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="relative z-10">
          <span className="inline-block px-4 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-full mb-6 animate-bounce shadow-lg">
            GIỚI HẠN THỜI GIAN
          </span>
          <h1 className="font-headline text-5xl font-extrabold text-orange-900 mb-6 uppercase tracking-tight">
            {campaign.name}
          </h1>
          
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="text-center">
              <div className="bg-orange-600 text-white w-16 h-16 flex items-center justify-center rounded-xl text-2xl font-mono font-bold shadow-xl border-b-4 border-orange-800">
                {formatNum(timeLeft.hours)}
              </div>
              <span className="text-[10px] font-bold text-orange-700 uppercase mt-2 block">Giờ</span>
            </div>
            <div className="text-orange-600 font-bold text-2xl pb-6">:</div>
            <div className="text-center">
              <div className="bg-orange-600 text-white w-16 h-16 flex items-center justify-center rounded-xl text-2xl font-mono font-bold shadow-xl border-b-4 border-orange-800">
                {formatNum(timeLeft.minutes)}
              </div>
              <span className="text-[10px] font-bold text-orange-700 uppercase mt-2 block">Phút</span>
            </div>
            <div className="text-orange-600 font-bold text-2xl pb-6">:</div>
            <div className="text-center">
              <div className="bg-orange-600 text-white w-16 h-16 flex items-center justify-center rounded-xl text-2xl font-mono font-bold shadow-xl border-b-4 border-orange-800 animate-pulse">
                {formatNum(timeLeft.seconds)}
              </div>
              <span className="text-[10px] font-bold text-orange-700 uppercase mt-2 block">Giây</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {campaign.items?.map((item) => {
          const p = item.product;
          const salePrice = Number(p.price) * (1 - item.discountPercentage / 100);
          
          return (
            <div key={p.id} className="group bg-white rounded-2xl overflow-hidden organic-shadow flex flex-col hover:-translate-y-2 transition-transform duration-300 border border-slate-100">
              <Link href={`/products/${p.id}`} className="block aspect-square overflow-hidden bg-slate-50 relative">
                <img 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  alt={p.name} 
                  src={p.imageUrl || 'https://via.placeholder.com/400'} 
                />
                <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                  -{item.discountPercentage}%
                </div>
              </Link>
              <div className="p-6 flex flex-col flex-1">
                <Link href={`/products/${p.id}`}>
                  <h3 className="font-bold text-slate-800 text-lg mb-4 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors h-12">
                    {p.name}
                  </h3>
                </Link>
                <div className="mb-6">
                  <span className="text-orange-600 font-bold text-2xl">{formatPrice(salePrice)}</span>
                  <span className="text-slate-400 line-through text-xs ml-2">{formatPrice(p.price)}</span>
                  
                  <div className="mt-4 bg-slate-100 h-2 rounded-full overflow-hidden relative">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.max(15, (p.stock / 100) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sắp cháy hàng</span>
                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Còn {p.stock} sp</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={(e) => handleBuyNow(e, p.id)}
                    className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-700 transition-colors shadow-md shadow-orange-200"
                  >
                    Mua ngay
                  </button>
                  <button 
                    onClick={(e) => handleAddToCart(e, p.id)}
                    disabled={addingId === p.id}
                    className="w-12 h-12 bg-slate-100 text-slate-800 rounded-xl hover:bg-orange-100 hover:text-orange-600 transition-colors flex items-center justify-center border border-slate-200 disabled:opacity-50"
                    title="Thêm vào giỏ hàng"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {addingId === p.id ? 'sync' : 'add_shopping_cart'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
