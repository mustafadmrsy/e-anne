/**
 * Cart Summary Component - Order summary with totals
 */

'use client';

import Link from 'next/link';
import type { CartSummary } from '@/lib/models';

interface CartSummaryComponentProps {
  summary: CartSummary;
  subtotal: number;
  shippingCost: number;
  discountTotal: number;
  grandTotal: number;
}

export function CartSummaryComponent({
  summary,
  subtotal,
  shippingCost,
  discountTotal,
  grandTotal
}: CartSummaryComponentProps) {
  return (
    <div className="bg-white rounded-lg border p-6 sticky top-4">
      <h2 className="text-lg font-semibold mb-4">Sipariş Özeti</h2>

      <div className="space-y-3 mb-4">
        {/* Item Count */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Ürün Sayısı ({summary.itemCount})
          </span>
          <span className="font-medium">₺{subtotal.toFixed(2)}</span>
        </div>

        {/* Discount */}
        {discountTotal > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>İndirim</span>
            <span>-₺{discountTotal.toFixed(2)}</span>
          </div>
        )}

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Kargo</span>
          <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
            {shippingCost === 0 ? 'Ücretsiz' : `₺${shippingCost.toFixed(2)}`}
          </span>
        </div>

        {/* Free shipping threshold */}
        {shippingCost > 0 && subtotal < 300 && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            300 TL ve üzeri alışverişlerde kargo ücretsiz!
            <br />
            <span className="text-amber-600 font-medium">
              {(300 - subtotal).toFixed(2)} TL daha ekleyin
            </span>
          </div>
        )}
      </div>

      <div className="border-t pt-4 mb-6">
        <div className="flex justify-between text-lg font-semibold">
          <span>Toplam</span>
          <span className="text-xl">₺{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <Link
        href="/checkout"
        className="block w-full bg-gray-900 text-white text-center py-3 rounded-md hover:bg-gray-800 transition-colors font-medium"
      >
        Ödemeye Geç
      </Link>

      {/* Continue Shopping */}
      <Link
        href="/products"
        className="block w-full text-center py-3 text-gray-600 hover:text-gray-900 mt-3"
      >
        Alışverişe Devam Et
      </Link>

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Güvenli Ödeme</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Hızlı Kargo</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <span>Kolay İade</span>
        </div>
      </div>
    </div>
  );
}
