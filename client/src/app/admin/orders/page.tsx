"use client";

import { useEffect, useState } from "react";
import { Protected } from "../../../components/Protected";
import { EmptyState, ErrorMessage, Field, PageHeader, StatusBadge, inputClass } from "../../../components/ui";
import { api, formatPrice, type Order, type OrderStatus } from "../../../lib/api";

const filterStatuses = ["", "PENDING", "PAID", "CANCELLED", "COMPLETED"] as const;
const updateStatuses: OrderStatus[] = ["PENDING", "PAID", "CANCELLED", "COMPLETED"];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PAID: "Đã thanh toán",
  CANCELLED: "Đã hủy",
  COMPLETED: "Hoàn thành"
};

function AdminOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const result = await api.getAdminOrders({ status, page, limit: 10 });
      setOrders(result.data);
      setMeta({
        page: result.meta.page,
        totalPages: result.meta.totalPages || 1,
        total: result.meta.total
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách đơn hàng");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const updateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      await api.updateAdminOrderStatus(orderId, nextStatus);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật đơn hàng");
    }
  };

  return (
    <div>
      <PageHeader title="Quản lý Đơn hàng" description="Xem danh sách và cập nhật trạng thái đơn hàng." />
      <ErrorMessage message={error} />
      <div className="mb-4 max-w-xs">
        <Field label="Lọc theo trạng thái">
          <select
            className={inputClass}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
            value={status}
          >
            {filterStatuses.map((value) => (
              <option key={value || "all"} value={value}>
                {value ? STATUS_LABELS[value] : "Tất cả"}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {orders.length === 0 ? (
        <EmptyState message="Không có đơn hàng nào." />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article className="rounded-lg border border-slate-200 bg-white p-5" key={order.id}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-semibold">Đơn hàng #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-slate-600">
                    {order.user?.email} · {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {order.shippingName}, {order.shippingPhone}, {order.shippingAddress}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={order.status} />
                  <p className="font-semibold">{formatPrice(order.totalAmount)}</p>
                  <select
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                    onChange={(event) => updateStatus(order.id, event.target.value as OrderStatus)}
                    value={order.status}
                  >
                    {updateStatuses.map((value) => (
                      <option key={value} value={value}>
                        {STATUS_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 divide-y divide-slate-100">
                {order.items.map((item) => (
                  <div className="flex justify-between gap-4 py-3 text-sm" key={item.id}>
                    <span>{item.product.name} x {item.quantity}</span>
                    <span>{formatPrice(Number(item.unitPrice) * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="mt-6 flex items-center justify-between">
        <button
          className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
          disabled={meta.page <= 1}
          onClick={() => setPage(meta.page - 1)}
          type="button"
        >
          Trang trước
        </button>
        <span className="text-sm text-slate-600">
          Trang {meta.page} / {meta.totalPages} · {meta.total} đơn hàng
        </span>
        <button
          className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
          disabled={meta.page >= meta.totalPages}
          onClick={() => setPage(meta.page + 1)}
          type="button"
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Protected adminOnly>
      <AdminOrdersContent />
    </Protected>
  );
}
