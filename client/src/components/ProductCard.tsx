"use client";

import Link from "next/link";
import { useState } from "react";
import { api, type Product } from "../lib/api";
import { useCart } from "./CartProvider";

export function ProductCard({ product }: { product: Product }) {
  const [message, setMessage] = useState("");
  const { refreshCart } = useCart();
  const flashSaleItem = product.flashSaleItems && product.flashSaleItems.length > 0 ? product.flashSaleItems[0] : null;

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.addCartItem({ productId: product.id, quantity: 1 });
      setMessage("Đã thêm vào giỏ hàng");
      refreshCart();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể thêm vào giỏ hàng");
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.addCartItem({ productId: product.id, quantity: 1 });
      refreshCart();
      window.location.href = "/cart";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể mua ngay");
    }
  };

  return (
    <Link href={`/products/${product.id}`} className="group relative flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden transition-all duration-300 organic-shadow hover:-translate-y-1 border border-stone-50 dark:border-stone-800">
      <div className="aspect-square w-full relative overflow-hidden bg-stone-50 dark:bg-stone-800">
        <img
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={product.imageUrl || 'https://via.placeholder.com/400'}
        />
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-tertiary text-on-tertiary px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-[9px] md:text-xs font-bold">
            Sắp hết
          </div>
        )}
        
        <button
          className="absolute top-2 right-2 md:top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 bg-white/80 backdrop-blur text-secondary rounded-full shadow-lg flex items-center justify-center hover:bg-secondary hover:text-white transition-all z-10"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              await api.addToFavorites(product.id);
              setMessage("Đã lưu vào yêu thích");
            } catch {
              setMessage("Không thể lưu yêu thích");
            }
          }}
          type="button"
        >
          <span className="material-symbols-outlined text-lg md:text-xl">favorite</span>
        </button>

        {/* Actions - Visible on hover (Desktop) and Always (Mobile if needed, or simplified) */}
        <div className="absolute bottom-2 left-2 right-2 md:bottom-4 md:left-4 md:right-4 flex gap-1 md:gap-2 opacity-100 md:opacity-0 md:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button
            className="flex-1 bg-primary text-white py-1.5 md:py-2 rounded-lg shadow-lg font-bold text-[10px] md:text-xs hover:opacity-90 transition-all disabled:opacity-50"
            disabled={!product.isActive || product.stock <= 0}
            onClick={handleBuyNow}
            type="button"
          >
            Mua
          </button>
          <button
            className="w-8 h-8 md:w-10 md:h-10 bg-white text-primary rounded-lg shadow-lg flex items-center justify-center hover:bg-primary-container transition-all disabled:opacity-50"
            disabled={!product.isActive || product.stock <= 0}
            onClick={addToCart}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] md:text-lg">add_shopping_cart</span>
          </button>
        </div>
      </div>
      <div className="pt-3 md:pt-6 px-2 md:px-3 flex flex-col gap-1 md:gap-2 pb-3 md:pb-4">
        <div className="flex text-yellow-500">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              className="material-symbols-outlined text-[10px] md:text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
              key={star}
            >
              star
            </span>
          ))}
        </div>
        <h3 className="text-on-surface font-headline font-bold text-sm md:text-lg leading-tight line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">
          {product.name}
        </h3>
        <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-2 mt-auto pt-1 md:pt-2">
          {flashSaleItem ? (
            <>
              <span className="text-secondary font-headline text-base md:text-xl font-bold">
                {Math.round(Number(product.price) * (1 - flashSaleItem.discountPercentage / 100)).toLocaleString()}<span className="text-[10px] md:text-sm ml-0.5">đ</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[10px] md:text-xs line-through">
                  {Number(product.price).toLocaleString()}đ
                </span>
                <span className="bg-orange-100 text-orange-600 text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 rounded">
                  -{flashSaleItem.discountPercentage}%
                </span>
              </div>
            </>
          ) : (
            <span className="text-secondary font-headline text-base md:text-xl font-bold">
              {Number(product.price).toLocaleString()}<span className="text-[10px] md:text-sm ml-1">đ</span>
            </span>
          )}
        </div>
        {message && <p className="text-[10px] text-emerald-700 font-medium line-clamp-1">{message}</p>}
      </div>
    </Link>
  );
}
