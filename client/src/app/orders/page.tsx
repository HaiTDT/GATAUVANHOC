"use client";

import { useEffect, useState } from "react";
import { Protected } from "../../components/Protected";
import { EmptyState, ErrorMessage } from "../../components/ui";
import { api, formatPrice, type Order } from "../../lib/api";
import { useAuth } from "../../components/AuthProvider";

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api
      .getOrders()
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : "Cannot load orders"))
      .finally(() => setLoading(false));
  }, []);

  const totalSpent = orders.reduce((acc, order) => acc + (order.status !== 'CANCELLED' ? Number(order.totalAmount) : 0), 0);
  const hasakiPoints = Math.floor(totalSpent / 10000); // Giả lập tính điểm

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold font-headline text-primary tracking-tight">Đơn hàng của tôi</h1>
        <p className="text-on-surface-variant mt-2">Theo dõi và quản lý lịch sử mua hàng của bạn tại Hasaki.</p>
      </header>

      <ErrorMessage message={error} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-surface-container-lowest p-6 rounded-xl border-none shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group organic-shadow">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-on-surface-variant">Tổng đơn hàng</span>
            <span className="material-symbols-outlined text-primary">shopping_cart</span>
          </div>
          <div className="text-3xl font-extrabold font-headline text-primary">{orders.length}</div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border-none shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group organic-shadow">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-on-surface-variant">Chi tiêu tích lũy</span>
            <span className="material-symbols-outlined text-secondary">payments</span>
          </div>
          <div className="text-3xl font-extrabold font-headline text-secondary">
            {formatPrice(totalSpent)}
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border-none shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group organic-shadow">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-on-surface-variant">Điểm Hasaki</span>
            <span className="material-symbols-outlined text-tertiary">stars</span>
          </div>
          <div className="text-3xl font-extrabold font-headline text-tertiary">{hasakiPoints}</div>
        </div>
      </div>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden organic-shadow border border-outline-variant/30">
        <div className="p-6 flex items-center justify-between border-b border-surface-variant">
          <h2 className="font-headline font-bold text-lg text-on-surface">Lịch sử đơn hàng</h2>
        </div>
        
        {loading ? (
          <p className="p-8 text-sm text-slate-600 text-center">Đang tải đơn hàng...</p>
        ) : orders.length === 0 ? (
          <div className="p-8">
            <EmptyState message="Bạn chưa có đơn hàng nào." />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    <th className="px-6 py-4">Mã đơn hàng</th>
                    <th className="px-6 py-4">Ngày đặt</th>
                    <th className="px-6 py-4">Sản phẩm</th>
                    <th className="px-6 py-4">Tổng thanh toán</th>
                    <th className="px-6 py-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant">
                  {orders.map((order) => (
                    <tr className="hover:bg-surface-container-low transition-colors group" key={order.id}>
                      <td className="px-6 py-5 font-bold text-primary">#{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-6 py-5 text-sm">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-surface-variant overflow-hidden flex-shrink-0">
                            {order.items[0]?.product?.imageUrl ? (
                               <img src={order.items[0].product.imageUrl} alt={order.items[0].product.name} className="w-full h-full object-cover" />
                            ) : (
                               <div className="w-full h-full bg-slate-200"></div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm truncate max-w-[150px] font-medium">{order.items[0]?.product?.name || "Sản phẩm đã xóa"}</p>
                            {order.items.length > 1 && (
                              <span className="text-xs text-on-surface-variant">+{order.items.length - 1} món khác</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-secondary">{formatPrice(order.totalAmount)}</td>
                      <td className="px-6 py-5">
                        <OrderStatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-stone-100">
               {orders.map((order) => (
                 <div key={order.id} className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Mã đơn hàng</p>
                          <p className="font-bold text-primary text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                       </div>
                       <OrderStatusBadge status={order.status} />
                    </div>
                    
                    <div className="flex gap-4">
                       <div className="w-16 h-16 rounded-lg bg-stone-50 border border-stone-100 overflow-hidden flex-shrink-0">
                          <img src={order.items[0]?.product?.imageUrl || ''} alt="" className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-on-surface line-clamp-1">{order.items[0]?.product?.name || "Sản phẩm"}</p>
                          <p className="text-[10px] text-on-surface-variant mt-1">Đặt ngày: {new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
                          {order.items.length > 1 && (
                            <p className="text-[10px] text-emerald-600 font-medium mt-1">+{order.items.length - 1} sản phẩm khác</p>
                          )}
                       </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                       <span className="text-xs font-medium text-on-surface-variant">Tổng thanh toán</span>
                       <span className="font-bold text-secondary text-base">{formatPrice(order.totalAmount)}</span>
                    </div>
                 </div>
               ))}
            </div>
          </>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-headline font-bold text-xl text-primary mb-6">Gợi ý dành riêng cho bạn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-primary/5 rounded-2xl p-6 md:p-8 flex items-center justify-between overflow-hidden relative group">
                <div className="z-10 relative">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 block">Deal độc quyền</span>
                    <h3 className="text-xl md:text-2xl font-bold font-headline mb-4 max-w-[200px]">Giảm 20% cho dòng sản phẩm Organic</h3>
                    <button className="bg-primary text-white px-6 py-2 rounded-md font-bold text-xs hover:bg-primary/90 transition-colors">Mua ngay</button>
                </div>
            </div>
            <div className="bg-secondary/5 rounded-2xl p-6 md:p-8 flex items-center justify-between overflow-hidden relative group">
                <div className="z-10 relative">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1 block">Dịch vụ Spa</span>
                    <h3 className="text-xl md:text-2xl font-bold font-headline mb-4 max-w-[200px]">Liệu trình Massage Thảo mộc</h3>
                    <button className="bg-secondary text-white px-6 py-2 rounded-md font-bold text-xs hover:bg-secondary/90 transition-colors">Đặt lịch</button>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  if (status === 'COMPLETED' || status === 'DELIVERED') {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-primary-fixed text-on-primary-fixed-variant">
        <span className="w-1 h-1 rounded-full bg-primary-container mr-1.5"></span>
        Đã giao
      </span>
    );
  }
  if (status === 'CANCELLED') {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-error-container text-on-error-container">
        <span className="w-1 h-1 rounded-full bg-error mr-1.5"></span>
        Đã hủy
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-secondary-fixed text-on-secondary-fixed-variant">
      <span className="w-1 h-1 rounded-full bg-secondary-container mr-1.5"></span>
      {status}
    </span>
  );
}

export default function OrdersPage() {
  return (
    <Protected>
      <OrdersContent />
    </Protected>
  );
}

