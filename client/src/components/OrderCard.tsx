import { formatPrice, type Order } from "../lib/api";
import { StatusBadge } from "./ui";

export function OrderCard({ order }: { order: Order }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
          <p className="text-sm text-slate-500">
            {new Date(order.createdAt).toLocaleString("vi-VN")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <p className="font-semibold">{formatPrice(order.totalAmount)}</p>
        </div>
      </div>
      <div className="mt-4 divide-y divide-slate-100">
        {order.items.map((item) => (
          <div className="flex justify-between gap-4 py-3 text-sm" key={item.id}>
            <span>
              {item.product.name} x {item.quantity}
            </span>
            <span>{formatPrice(Number(item.unitPrice) * item.quantity)}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-slate-600">
        Ship to {order.shippingName}, {order.shippingPhone}, {order.shippingAddress}
      </p>
    </article>
  );
}
