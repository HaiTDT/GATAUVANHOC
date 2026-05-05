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
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center py-4 md:py-6 bg-surface-container-lowest rounded-xl p-4 md:p-6 transition-all organic-shadow border border-outline-variant/30 relative">
      <div className="flex-1 flex items-center gap-4 md:gap-6 w-full">
        <Link href={`/products/${item.productId}`} className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-surface-container rounded-lg md:rounded-xl overflow-hidden block">
          {item.product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={item.product.name}
              className="w-full h-full object-cover"
              src={item.product.imageUrl}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500 text-[10px]">No image</div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/products/${item.productId}`}>
            <h3 className="text-sm md:text-lg font-bold text-on-surface hover:text-primary transition-colors line-clamp-2">{item.product.name}</h3>
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs md:text-sm font-bold text-on-surface">
              {formatPrice(item.unitPrice || item.product.price)}
            </span>
            {item.unitPrice && Number(item.unitPrice) < Number(item.product.price) && (
              <span className="bg-orange-100 text-orange-600 text-[8px] md:text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
                Flash Sale
              </span>
            )}
          </div>
          <p className="text-[10px] md:text-sm text-on-surface-variant mt-0.5 italic">
            Còn lại: {item.product.stock}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between w-full md:w-auto md:contents gap-4">
        {/* Quantity Controls */}
        <div className="flex items-center bg-stone-50 dark:bg-stone-800 rounded-full px-2 py-1 border border-outline-variant/30">
          <button 
            className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-primary hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full transition-colors disabled:opacity-50"
            onClick={decrement}
            disabled={item.quantity <= 1}
          >
            <span className="material-symbols-outlined text-[16px] md:text-sm">remove</span>
          </button>
          <span className="mx-2 md:mx-4 font-bold text-on-surface text-sm w-4 text-center">{item.quantity}</span>
          <button 
            className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-primary hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full transition-colors disabled:opacity-50"
            onClick={increment}
          >
            <span className="material-symbols-outlined text-[16px] md:text-sm">add</span>
          </button>
        </div>
        
        {/* Total Price & Delete */}
        <div className="flex flex-col items-end gap-1 md:ml-4">
          <span className="text-sm md:text-lg font-bold text-secondary">{formatPrice(item.lineTotal ?? 0)}</span>
          <button
            className="text-on-surface-variant hover:text-error transition-colors p-1"
            onClick={() => onDelete(item.id)}
            title="Xóa sản phẩm"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
