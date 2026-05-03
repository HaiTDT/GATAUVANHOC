"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorMessage } from "@/components/ui";
import { api, formatPrice, type FlashSaleCampaign, type Product } from "@/lib/api";

export default function AdminFlashSaleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<FlashSaleCampaign | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Form states for campaign
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Form states for adding product
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [discount, setDiscount] = useState(10);

  const load = async () => {
    try {
      setLoading(true);
      const [campaignData, productsData, categoriesData] = await Promise.all([
        api.getAdminFlashSale(id),
        api.getProducts({ limit: 500 }),
        api.getCategories()
      ]);
      
      setCampaign(campaignData);
      setProducts(productsData.data);
      setCategories(categoriesData);
      
      setName(campaignData.name);
      setStartTime(campaignData.startTime.substring(0, 16));
      setEndTime(campaignData.endTime.substring(0, 16));
      setIsActive(campaignData.isActive);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải thông tin chiến dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const saveCampaign = async () => {
    try {
      await api.updateFlashSale(id, {
        name,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        isActive
      });
      alert("Đã lưu thông tin chiến dịch");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu thông tin");
    }
  };

  const addProduct = async () => {
    if (!selectedProductId) return;
    try {
      await api.addFlashSaleItem(id, {
        productId: selectedProductId,
        discountPercentage: discount
      });
      setSelectedProductId("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể thêm sản phẩm");
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await api.removeFlashSaleItem(id, productId);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa sản phẩm");
    }
  };

  if (loading && !campaign) {
    return <div className="p-8 animate-pulse bg-surface-container-low rounded-xl h-64" />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="font-bold font-headline text-2xl text-primary">Chi tiết Chiến dịch</h2>
            <p className="text-sm text-slate-500 mt-1">{campaign?.name}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={saveCampaign}
            className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition organic-shadow"
          >
            Lưu thay đổi
          </button>
        </div>
      </header>

      <ErrorMessage message={error} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cấu hình thời gian */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white p-6 rounded-xl border border-outline-variant/30 organic-shadow shadow-sm">
            <h3 className="font-bold text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">settings</span>
              Thiết lập chiến dịch
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tên chiến dịch</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary/10 transition-all text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bắt đầu</label>
                <input 
                  type="datetime-local" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary/10 transition-all text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Kết thúc</label>
                <input 
                  type="datetime-local" 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary/10 transition-all text-sm outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={isActive} 
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">Kích hoạt chiến dịch</label>
              </div>
            </div>
          </section>

          <section className="bg-orange-50 p-6 rounded-xl border border-orange-100">
            <h3 className="font-bold text-orange-700 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Thêm sản phẩm
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-orange-600 uppercase mb-1">Lọc theo danh mục</label>
                <select 
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    setSelectedProductId(""); // Reset product selection when category changes
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-orange-200 bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200 mb-2"
                >
                  <option value="">-- Tất cả danh mục --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-orange-600 uppercase mb-1">Chọn sản phẩm</label>
                <select 
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-orange-200 bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {products
                    .filter(p => !selectedCategoryId || p.categoryId === selectedCategoryId)
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-orange-600 uppercase mb-1">Giảm giá (%)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="1" max="99" 
                    value={discount} 
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="flex-1 accent-orange-500"
                  />
                  <span className="font-bold text-orange-700 min-w-[40px] text-right">{discount}%</span>
                </div>
              </div>

              <button
                onClick={addProduct}
                disabled={!selectedProductId}
                className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-bold shadow-md hover:bg-orange-600 transition-colors disabled:bg-orange-200"
              >
                Thêm vào Flash Sale
              </button>
            </div>
          </section>
        </div>

        {/* Danh sách sản phẩm trong Flash Sale */}
        <div className="lg:col-span-2">
          <section className="bg-white rounded-xl border border-outline-variant/30 organic-shadow shadow-sm overflow-hidden">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/30">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">bolt</span>
                Sản phẩm đang tham gia ({campaign?.items?.length || 0})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50">
                    <th className="px-6 py-3">Sản phẩm</th>
                    <th className="px-6 py-3 text-center">Giá gốc</th>
                    <th className="px-6 py-3 text-center">Giảm giá</th>
                    <th className="px-6 py-3 text-center">Giá Sale</th>
                    <th className="px-6 py-3 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-sm">
                  {campaign?.items?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                        Chưa có sản phẩm nào trong chiến dịch này.
                      </td>
                    </tr>
                  ) : (
                    campaign?.items?.map((item) => {
                      const salePrice = Number(item.product.price) * (1 - item.discountPercentage / 100);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {item.product.imageUrl && (
                                <img src={item.product.imageUrl} alt="" className="w-10 h-10 object-cover rounded-md border" />
                              )}
                              <span className="font-medium text-slate-700 line-clamp-1">{item.product.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-slate-400 line-through">
                            {formatPrice(item.product.price)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">-{item.discountPercentage}%</span>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-secondary">
                            {formatPrice(salePrice)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => removeItem(item.product.id)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                              title="Xóa khỏi chiến dịch"
                            >
                              <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
