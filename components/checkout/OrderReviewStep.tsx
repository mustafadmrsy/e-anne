// Order Review Step
'use client';
import { useCartStore, useCheckoutStore } from '@/lib/stores';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function OrderReviewStep() {
  const router = useRouter();
  const { cart, summary } = useCartStore();
  const { customerInfo, shippingAddress, paymentMethod, goToPreviousStep } = useCheckoutStore();
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const items = cart?.items || [];
  
  const handleSubmit = async () => {
    if (!terms) {
      alert('Lütfen sözleşmeyi kabul edin');
      return;
    }
    setLoading(true);
    try {
      // Create order via checkout service
      const { getCheckoutService } = await import('@/lib/services');
      const checkoutService = getCheckoutService();
      
      if (!cart?.id) {
        throw new Error('Cart not found');
      }
      
      console.log('Creating order with:', {
        cartId: cart.id,
        customerInfo,
        shippingAddress,
        paymentMethod
      });
      
      const orderResult = await checkoutService.createOrder({
        cartId: cart.id,
        customer: customerInfo as any,
        shippingAddress: shippingAddress as any,
        billingAddress: shippingAddress as any, // Same as shipping for now
        paymentMethod
      });
      
      console.log('Order result:', orderResult);
      
      if (!orderResult.success || !orderResult.data) {
        throw new Error(orderResult.error || 'Failed to create order');
      }
      
      // Create payment
      const { getPaymentService } = await import('@/lib/services');
      const paymentService = getPaymentService();
      const paymentResult = await paymentService.createPayment(orderResult.data.orderId);
      
      if (!paymentResult.success || !paymentResult.data) {
        throw new Error(paymentResult.error || 'Failed to create payment');
      }
      
      const payment = paymentResult.data;
      
      // Shopier ödeme formunu otomatik submit et
      if (payment.paymentForm && payment.paymentUrl) {
        // Create and submit Shopier form
        const formContainer = document.createElement('div');
        formContainer.innerHTML = payment.paymentForm;
        document.body.appendChild(formContainer);
        
        const form = formContainer.querySelector('form') as HTMLFormElement;
        if (form) {
          form.submit();
        } else {
          throw new Error('Payment form not found');
        }
      } else {
        router.push(`/order/success?id=${orderResult.data.orderId}`);
      }
    } catch (error) {
      console.error('Order submission error:', error);
      alert('Sipariş oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Sipariş Özeti</h2>
        
        <div className="space-y-4 text-sm">
          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">Müşteri Bilgileri</h3>
            <p>{customerInfo.firstName} {customerInfo.lastName}</p>
            <p>{customerInfo.email}</p>
            <p>{customerInfo.phone}</p>
          </div>
          
          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">Teslimat Adresi</h3>
            <p>{shippingAddress.street}</p>
            <p>{shippingAddress.district}, {shippingAddress.city}</p>
            <p>{shippingAddress.postalCode}</p>
          </div>
          
          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">Ödeme Yöntemi</h3>
            <p>{paymentMethod === 'credit_card' ? 'Kredi Kartı / Banka Kartı' : paymentMethod}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Ürünler ({items.length})</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.productName} x {item.quantity}</span>
                  <span>{item.totalPrice.toFixed(2)} ₺</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border p-6">
        <label className="flex items-start gap-3">
          <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} className="mt-1" />
          <span className="text-sm">
            <a href="/terms" className="underline" target="_blank">Mesafeli Satış Sözleşmesi</a> ve{' '}
            <a href="/privacy-policy" className="underline" target="_blank">Gizlilik Politikası</a>'nı okudum ve kabul ediyorum.
          </span>
        </label>
      </div>
      
      <div className="flex gap-3">
        <button onClick={goToPreviousStep} disabled={loading} className="px-6 py-3 border rounded-md">Geri</button>
        <button onClick={handleSubmit} disabled={loading || !terms} className="bg-gray-900 text-white px-8 py-3 rounded-md disabled:opacity-50">
          {loading ? 'İşleniyor...' : `Siparişi Tamamla (${summary?.grandTotal.toFixed(2) || '0.00'} ₺)`}
        </button>
      </div>
    </div>
  );
}
