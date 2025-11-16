/**
 * Cart Page - Modern Shopping Cart
 * Server-Side Rendered with Client Components
 */

"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/stores";
import { CartItemComponent } from "@/components/cart/CartItemComponent";
import { CartSummaryComponent } from "@/components/cart/CartSummaryComponent";
import { EmptyCart } from "@/components/cart/EmptyCart";

export default function CartPage() {
  const { cart, summary, isLoading, initializeCart, clearCart } = useCartStore();

  // Initialize cart on mount
  useEffect(() => {
    initializeCart();
  }, [initializeCart]);

  // Loading state
  if (isLoading && !cart) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </main>
    );
  }

  // Empty cart
  if (!cart || !summary || !summary.hasItems) {
    return (
      <main className="container mx-auto px-4 py-8">
        <EmptyCart />
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sepetim</h1>
        <p className="text-gray-600 mt-2">
          {summary.itemCount} ürün sepetinizde
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Clear Cart Button */}
          {cart.items.length > 0 && (
            <div className="flex justify-end mb-4">
              <button
                onClick={async () => {
                  if (confirm('Sepeti temizlemek istediğinizden emin misiniz?')) {
                    await clearCart();
                  }
                }}
                className="text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                Sepeti Temizle
              </button>
            </div>
          )}

          {/* Cart Items List */}
          {cart.items.map((item) => (
            <CartItemComponent key={item.id} item={item} />
          ))}

          {/* Bundles (if any) */}
          {cart.bundles && cart.bundles.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Paket Ürünler</h2>
              <div className="space-y-4">
                {cart.bundles.map((bundle) => (
                  <div 
                    key={bundle.id}
                    className="bg-green-50 border border-green-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{bundle.bundleName}</h3>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 line-through">
                          ₺{bundle.originalPrice.toFixed(2)}
                        </p>
                        <p className="text-lg font-semibold text-green-600">
                          ₺{bundle.discountedPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-green-700">
                      {bundle.discountAmount.toFixed(2)} TL tasarruf
                    </p>
                    <div className="mt-3 space-y-2">
                      {bundle.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 text-sm text-gray-600">
                          <span>•</span>
                          <span>{item.productName} x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <CartSummaryComponent
            summary={summary}
            subtotal={cart.subtotal}
            shippingCost={cart.shippingTotal}
            discountTotal={cart.discountTotal}
            grandTotal={cart.grandTotal}
          />
        </div>
      </div>

      {/* Trust Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Güvenli Alışveriş</h3>
            <p className="text-sm text-gray-600 mt-1">
              SSL sertifikası ile korunan ödeme sayfası
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Hızlı Kargo</h3>
            <p className="text-sm text-gray-600 mt-1">
              300 TL üzeri ücretsiz kargo fırsatı
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Kolay İade</h3>
            <p className="text-sm text-gray-600 mt-1">
              14 gün içinde koşulsuz iade hakkı
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
