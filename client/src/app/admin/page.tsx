"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorMessage } from "../../components/ui";
import { api, formatPrice, type Order, type Product } from "../../lib/api";

type Dashboard = {
  totalRevenue: string;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  topProducts: Array<{
    product: Product | null;
    totalSold: number;
    orderItemCount: number;
  }>;
  recentOrders: Order[];
};

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getAdminDashboard()
      .then(setDashboard)
      .catch((err) => setError(err instanceof Error ? err.message : "Cannot load dashboard"));
  }, []);

  return (
    <div className="space-y-8">
      <ErrorMessage message={error} />
      {!dashboard ? (
        <p className="text-sm text-slate-600">Đang tải dashboard...</p>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-none relative overflow-hidden group organic-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                </div>
              </div>
              <h3 className="text-slate-500 text-sm font-medium">Tổng doanh thu</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold font-headline text-on-surface">{formatPrice(dashboard.totalRevenue)}</span>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5">
                <span className="material-symbols-outlined text-8xl">trending_up</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-none relative overflow-hidden group organic-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
                </div>
              </div>
              <h3 className="text-slate-500 text-sm font-medium">Tổng số đơn hàng</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold font-headline text-on-surface">{dashboard.totalOrders}</span>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5">
                <span className="material-symbols-outlined text-8xl">receipt_long</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-none relative overflow-hidden group organic-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-tertiary-container/10 rounded-xl flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                </div>
              </div>
              <h3 className="text-slate-500 text-sm font-medium">Tổng số khách hàng</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold font-headline text-on-surface">{dashboard.totalCustomers}</span>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5">
                <span className="material-symbols-outlined text-8xl">group</span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-sm flex flex-col h-[480px] organic-shadow">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-bold font-headline text-primary">Biểu đồ Tổng quan</h2>
                  <p className="text-xs text-slate-500 mt-1">Giao diện biểu diễn mô phỏng</p>
                </div>
              </div>
              <div className="flex-1 flex items-end gap-3 pb-4">
                {[40, 55, 45, 85, 60, 75, 90].map((h, i) => (
                  <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer" key={i}>
                    <div className={`w-full ${h === 85 ? 'bg-primary/80' : h === 90 ? 'bg-secondary-container/40 group-hover:bg-secondary-container/60' : 'bg-surface-container-high group-hover:bg-primary/20'} rounded-t-lg transition-all`} style={{ height: `${h}%` }}></div>
                    <span className={`text-[10px] ${h === 85 ? 'text-primary font-bold' : 'text-slate-400 font-medium'}`}>Ngày {i+1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary p-8 rounded-xl shadow-lg flex flex-col text-white relative overflow-hidden h-[480px] organic-shadow">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold font-headline mb-2 leading-tight">Sản phẩm<br/>Bán chạy Nhất</h2>
                
                <div className="mt-6 space-y-4">
                  {dashboard.topProducts.slice(0, 4).map((item) => (
                    <div className="flex items-center justify-between border-b border-white/10 pb-3" key={item.product?.id ?? item.totalSold}>
                      <span className="text-sm text-white/90 truncate pr-4">{item.product?.name ?? "Đã xóa"}</span>
                      <span className="text-sm font-bold bg-white/20 px-2 py-1 rounded">{item.totalSold}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            </div>
          </div>

          <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden organic-shadow border border-outline-variant/30">
            <div className="px-8 py-6 flex justify-between items-center border-b border-surface-container">
              <h2 className="text-xl font-bold font-headline text-on-surface">Đơn hàng Gần đây</h2>
              <Link className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline" href="/admin/orders">
                Tất cả đơn hàng
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </Link>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-widest font-bold">
                    <th className="px-8 py-4">Mã đơn</th>
                    <th className="px-8 py-4">Khách hàng</th>
                    <th className="px-8 py-4">Trạng thái</th>
                    <th className="px-8 py-4">Tổng cộng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-sm">
                  {dashboard.recentOrders.map((order) => (
                    <tr className="hover:bg-surface-container-low/50 transition-colors" key={order.id}>
                      <td className="px-8 py-5 font-mono text-primary font-bold">{order.id.slice(0, 8)}</td>
                      <td className="px-8 py-5">
                        <p className="font-bold">{order.shippingName}</p>
                        <p className="text-[10px] text-slate-500 italic">{order.shippingPhone}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${order.status === 'COMPLETED' || order.status === 'DELIVERED' ? 'bg-primary-fixed text-on-primary-fixed' : order.status === 'CANCELLED' ? 'bg-error-container text-on-error-container' : 'bg-secondary-fixed text-on-secondary-fixed'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-bold text-on-surface">{formatPrice(order.totalAmount)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
