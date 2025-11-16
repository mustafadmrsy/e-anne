/**
 * Customer Info Step - First step of checkout
 */

'use client';

import { useCheckoutStore } from '@/lib/stores';

export function CustomerInfoStep() {
  const { customerInfo, setCustomerInfo, goToNextStep } = useCheckoutStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToNextStep();
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-6">Müşteri Bilgileri</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ad *
            </label>
            <input
              type="text"
              required
              value={customerInfo.firstName || ''}
              onChange={(e) => setCustomerInfo({ firstName: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Adınız"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Soyad *
            </label>
            <input
              type="text"
              required
              value={customerInfo.lastName || ''}
              onChange={(e) => setCustomerInfo({ lastName: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Soyadınız"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-posta *
          </label>
          <input
            type="email"
            required
            value={customerInfo.email || ''}
            onChange={(e) => setCustomerInfo({ email: e.target.value })}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="ornek@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefon *
          </label>
          <input
            type="tel"
            required
            value={customerInfo.phone || ''}
            onChange={(e) => setCustomerInfo({ phone: e.target.value })}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="05xx xxx xx xx"
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-gray-900 text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium"
          >
            Devam Et
          </button>
        </div>
      </form>
    </div>
  );
}
