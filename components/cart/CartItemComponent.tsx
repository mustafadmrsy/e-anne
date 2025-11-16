/**
 * Cart Item Component - Single cart item display with quantity controls
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CartItem } from '@/lib/models';
import { useCartStore } from '@/lib/stores';
import { useState } from 'react';

interface CartItemComponentProps {
  item: CartItem;
}

export function CartItemComponent({ item }: CartItemComponentProps) {
  const { updateQuantity, removeItem } = useCartStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.maxQuantity) return;
    
    setIsUpdating(true);
    try {
      await updateQuantity(item.id, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await removeItem(item.id);
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border">
      {/* Product Image */}
      <Link href={`/product/${item.productSlug}`} className="flex-shrink-0">
        <div className="relative w-24 h-24 rounded-md overflow-hidden">
          <Image
            src={item.productImage.url}
            alt={item.productImage.alt}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link 
          href={`/product/${item.productSlug}`}
          className="font-medium text-gray-900 hover:text-gray-700 line-clamp-2"
        >
          {item.productName}
        </Link>
        
        {item.variationName && (
          <p className="text-sm text-gray-600 mt-1">
            {item.variationName}: {item.variationValue}
          </p>
        )}
        
        {item.sellerName && (
          <p className="text-xs text-gray-500 mt-1">
            Satıcı: {item.sellerName}
          </p>
        )}

        <div className="flex items-center gap-4 mt-3">
          {/* Quantity Controls */}
          <div className="flex items-center border rounded-md">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="px-3 py-1 border-x min-w-[3rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating || item.quantity >= item.maxQuantity}
              className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            disabled={isUpdating}
            className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            Kaldır
          </button>
        </div>

        {item.quantity >= item.maxQuantity && (
          <p className="text-xs text-amber-600 mt-2">
            Maksimum stok miktarına ulaştınız
          </p>
        )}
      </div>

      {/* Price */}
      <div className="flex-shrink-0 text-right">
        <p className="font-semibold text-lg text-gray-900">
          ₺{item.totalPrice.toFixed(2)}
        </p>
        {item.quantity > 1 && (
          <p className="text-sm text-gray-600">
            ₺{item.unitPrice.toFixed(2)} / adet
          </p>
        )}
      </div>
    </div>
  );
}
