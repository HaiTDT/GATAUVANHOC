"use client";

import Link from "next/link";
import { formatPrice, type CartItem as CartItemType } from "../lib/api";

type CartItemProps = {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onDelete: (itemId: string) => void;
};

export function CartItem({ item, onUpdateQuantity, onDelete }: CartItemProps) {
  const increment = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const decrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-6 bg-surface-container-lowest rounded-xl p-6 transition-all organic-shadow border border-outline-variant/30">
      <div className="md:col-span-6 flex items-center gap-6">
        <Link href={`/products/${item.productId}`} className="w-24 h-24 flex-shrink-0 bg-surface-container rounded-xl overflow-hidden block">
          {item.product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={item.product.name}
              className="w-full h-full object-cover"
              src={item.product.imageUrl}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500 text-xs">No image</div>
          )}
        </Link>
        <div>
          <Link href={`/products/${item.productId}`}>
            <h3 className="text-lg font-bold text-on-surface hover:text-primary transition-colors">{item.product.name}</h3>
          </Link>
          <p className="text-sm text-on-surface-variant mt-1 italic">
            Còn lại: {item.product.stock}
          </p>
        </div>
      </div>
      
      <div className="md:col-span-2 text-center flex flex-col items-center gap-1">
        <span className="font-body font-bold text-on-surface">
          {formatPrice(item.unitPrice || item.product.price)}
        </span>
        {item.unitPrice && Number(item.unitPrice) < Number(item.product.price) && (
          <span className="bg-orange-100 text-orange-600 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
            Flash Sale
          </span>
        )}
      </div>
      
      <div className="md:col-span-2 flex justify-center">
        <div className="flex items-center bg-surface-container rounded-full px-3 py-1 border border-outline-variant/50">
          <button 
            className="w-8 h-8 flex items-center justify-center text-primary hover:bg-surface-container-high rounded-full transition-colors disabled:opacity-50"
            onClick={decrement}
            disabled={item.quantity <= 1}
          >
            <span className="material-symbols-outlined text-sm">remove</span>
          </button>
          <span className="mx-4 font-bold text-on-surface w-4 text-center">{item.quantity}</span>
          <button 
            className="w-8 h-8 flex items-center justify-center text-primary hover:bg-surface-container-high rounded-full transition-colors disabled:opacity-50"
            onClick={increment}
          >
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        </div>
      </div>
      
      <div className="md:col-span-2 flex flex-col items-end gap-2">
        <span className="text-lg font-bold text-on-surface">{formatPrice(item.lineTotal ?? 0)}</span>
        <button
          className="text-on-surface-variant hover:text-error transition-colors p-2"
          onClick={() => onDelete(item.id)}
          title="Xóa sản phẩm"
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  );
}
