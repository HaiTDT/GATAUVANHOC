"use client";

import { useEffect, useState } from "react";
import { ErrorMessage } from "../../../components/ui";
import { api, formatPrice } from "../../../lib/api";

export default function InventoryDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api.getInventoryAnalytics()
      .then(setData)
      .catch(err => setError(err instanceof Error ? err.message : "Cannot load inventory data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const StockStatusBadge = ({ stock }: { stock: number }) => {
    if (stock === 0) return <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-[10px] font-bold">HẾT HÀNG</span>;
    if (stock < 10) return <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">SẮP HẾT</span>;
    return <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">ỔN ĐỊNH</span>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-headline text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
          Quản lý Tồn kho & Dự báo
        </h1>
        <p className="text-sm text-slate-500 mt-1">Theo dõi mức độ tồn kho, cảnh báo hàng sắp hết và gợi ý nhập hàng</p>
      </div>

      <ErrorMessage message={error} />

      {data && (
        <>
          {/* KPI Row */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-surface-container-lowest p-6 rounded-xl organic-shadow">
              <h3 className="text-xs text-slate-500 uppercase tracking-wider font-medium">Tổng sản phẩm</h3>
              <p className="text-3xl font-bold font-headline text-on-surface mt-2">{data.summary.totalProducts}</p>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl organic-shadow">
              <h3 className="text-xs text-red-500 uppercase tracking-wider font-medium">Đang hết hàng</h3>
              <p className="text-3xl font-bold font-headline text-red-600 mt-2">{data.summary.outOfStockCount}</p>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl organic-shadow">
              <h3 className="text-xs text-amber-600 uppercase tracking-wider font-medium">Cảnh báo sắp hết</h3>
              <p className="text-3xl font-bold font-headline text-amber-600 mt-2">{data.summary.lowStockCount}</p>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl organic-shadow">
              <h3 className="text-xs text-emerald-600 uppercase tracking-wider font-medium">Kho hàng ổn định</h3>
              <p className="text-3xl font-bold font-headline text-emerald-600 mt-2">{data.summary.healthyStockCount}</p>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Low Stock Table */}
            <section className="bg-surface-container-lowest rounded-xl organic-shadow overflow-hidden border border-outline-variant/30">
              <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center bg-red-50/30">
                <h3 className="text-sm font-bold font-headline text-red-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">warning</span>
                  Cảnh báo sắp hết hàng
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low text-[10px] uppercase font-bold text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Sản phẩm</th>
                      <th className="px-6 py-3">Danh mục</th>
                      <th className="px-6 py-3 text-center">Tồn</th>
                      <th className="px-6 py-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container text-xs">
                    {data.lowStockItems.map((item: any) => (
                      <tr key={item.id} className="hover:bg-red-50/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-on-surface truncate max-w-[200px]">{item.name}</td>
                        <td className="px-6 py-4 text-slate-500">{item.category}</td>
                        <td className="px-6 py-4 text-center font-bold text-red-600">{item.stock}</td>
                        <td className="px-6 py-4"><StockStatusBadge stock={item.stock} /></td>
                      </tr>
                    ))}
                    {data.lowStockItems.length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">Kho hàng đang rất dồi dào</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Restock Suggestions */}
            <section className="bg-surface-container-lowest rounded-xl organic-shadow overflow-hidden border border-outline-variant/30">
              <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center bg-blue-50/30">
                <h3 className="text-sm font-bold font-headline text-blue-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">auto_awesome</span>
                  Gợi ý nhập hàng (Dựa trên nhu cầu)
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {data.restockSuggestions.map((s: any) => (
                  <div key={s.id} className="p-4 rounded-xl border border-blue-100 bg-white shadow-sm flex items-center justify-between group hover:border-blue-300 transition-all">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-bold text-on-surface truncate">{s.name}</p>
                      <div className="flex gap-4 mt-1">
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">sell</span>
                          Bán 30 ngày qua: <span className="font-bold">{s.soldLast30d}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">inventory</span>
                          Hiện tại: <span className="font-bold">{s.currentStock}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-blue-600 mb-1">Gợi ý nhập</p>
                      <span className={`px-3 py-1 rounded-lg text-sm font-black ${s.urgency === 'HIGH' ? 'bg-red-600 text-white animate-pulse' : 'bg-blue-600 text-white'}`}>
                        +{s.suggestedAmount}
                      </span>
                    </div>
                  </div>
                ))}
                {data.restockSuggestions.length === 0 && (
                  <div className="py-10 text-center text-slate-400">Chưa có gợi ý nào cần thiết lúc này</div>
                )}
              </div>
            </section>
          </div>

          {/* Strategy Tip */}
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex items-start gap-4">
             <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
               <span className="material-symbols-outlined">lightbulb</span>
             </div>
             <div>
               <h4 className="font-bold text-emerald-800 text-sm">Mẹo quản lý vận hành</h4>
               <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                 Hệ thống tính toán **Gợi ý nhập hàng** dựa trên công thức: `(Lượng bán 30 ngày qua * 1.5) - Tồn kho hiện tại`. 
                 Điều này giúp bạn duy trì đủ hàng dự phòng (Safety Stock) để tránh tình trạng đứt gãy chuỗi cung ứng trong thời gian chờ nhập hàng mới.
               </p>
             </div>
          </div>
        </>
      )}
    </div>
  );
}
