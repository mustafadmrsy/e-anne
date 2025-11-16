/**
 * Checkout Page - Multi-step checkout process
 * Uses Zustand store for state management
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, useCheckoutStore } from "@/lib/stores";

// Step Components (will be in separate files)
import { CustomerInfoStep } from "@/components/checkout/CustomerInfoStep";
import { ShippingAddressStep } from "@/components/checkout/ShippingAddressStep";
import { PaymentMethodStep } from "@/components/checkout/PaymentMethodStep";
import { OrderReviewStep } from "@/components/checkout/OrderReviewStep";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, summary, initializeCart } = useCartStore();
  const { step } = useCheckoutStore();

  useEffect(() => {
    initializeCart();
  }, [initializeCart]);

  // Redirect if cart is empty
  useEffect(() => {
    if (summary && !summary.hasItems) {
      router.push('/cart');
    }
  }, [summary, router]);

  if (!cart || !summary) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ödeme</h1>
        <p className="text-gray-600 mt-2">
          Güvenli ödeme için bilgilerinizi doldurun
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {[
            { key: 'customer', label: 'Müşteri Bilgileri' },
            { key: 'shipping', label: 'Teslimat Adresi' },
            { key: 'payment', label: 'Ödeme Yöntemi' },
            { key: 'review', label: 'Sipariş Özeti' }
          ].map((s, index) => (
            <div key={s.key} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step === s.key
                      ? 'bg-gray-900 text-white'
                      : index < ['customer', 'shipping', 'payment', 'review'].indexOf(step)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index < ['customer', 'shipping', 'payment', 'review'].indexOf(step) ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs mt-2 text-center hidden sm:block">{s.label}</span>
              </div>
              {index < 3 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    index < ['customer', 'shipping', 'payment', 'review'].indexOf(step)
                      ? 'bg-green-600'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Steps */}
        <div className="lg:col-span-2">
          {step === 'customer' && <CustomerInfoStep />}
          {step === 'shipping' && <ShippingAddressStep />}
          {step === 'payment' && <PaymentMethodStep />}
          {step === 'review' && <OrderReviewStep />}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Sipariş Özeti</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ürün Toplamı</span>
                <span className="font-medium">₺{cart.subtotal.toFixed(2)}</span>
              </div>

              {cart.discountTotal > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>İndirim</span>
                  <span>-₺{cart.discountTotal.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Kargo</span>
                <span className={cart.shippingTotal === 0 ? 'text-green-600 font-medium' : ''}>
                  {cart.shippingTotal === 0 ? 'Ücretsiz' : `₺${cart.shippingTotal.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Toplam</span>
                <span className="text-xl">₺{cart.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Cart Items Summary */}
            <div className="mt-6 border-t pt-4">
              <h3 className="text-sm font-medium mb-3">Sepetteki Ürünler</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 flex-1 line-clamp-1">
                      {item.productName} x{item.quantity}
                    </span>
                    <span className="font-medium ml-2">
                      ₺{item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
