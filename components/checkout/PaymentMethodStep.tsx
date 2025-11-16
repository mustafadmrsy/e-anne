// Payment Method Step
'use client';
import { useCheckoutStore } from '@/lib/stores';

export function PaymentMethodStep() {
  const { paymentMethod, setPaymentMethod, goToNextStep, goToPreviousStep } = useCheckoutStore();
  
  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-6">Ödeme Yöntemi</h2>
      <div className="space-y-3">
        <label className={`block border rounded-lg p-4 cursor-pointer ${paymentMethod === 'credit_card' ? 'border-gray-900 bg-gray-50' : ''}`}>
          <input type="radio" name="payment" checked={paymentMethod === 'credit_card'} onChange={() => setPaymentMethod('credit_card')} className="mr-3" />
          <span className="font-medium">Kredi Kartı / Banka Kartı</span>
        </label>
      </div>
      <div className="flex gap-3 pt-6">
        <button onClick={goToPreviousStep} className="px-6 py-3 border rounded-md">Geri</button>
        <button onClick={goToNextStep} className="bg-gray-900 text-white px-8 py-3 rounded-md">Devam Et</button>
      </div>
    </div>
  );
}
