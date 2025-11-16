// Shipping Address Step
'use client';
import { useCheckoutStore } from '@/lib/stores';

export function ShippingAddressStep() {
  const { shippingAddress, setShippingAddress, goToNextStep, goToPreviousStep } = useCheckoutStore();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToNextStep();
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-6">Teslimat Adresi</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Adres *</label>
          <textarea
            required
            rows={3}
            value={shippingAddress.street || ''}
            onChange={(e) => setShippingAddress({ street: e.target.value })}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-gray-900"
            placeholder="Mahalle, sokak, bina no, daire no"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Şehir *</label>
            <input
              required
              value={shippingAddress.city || ''}
              onChange={(e) => setShippingAddress({ city: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-gray-900"
              placeholder="İstanbul"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">İlçe *</label>
            <input
              required
              value={shippingAddress.district || ''}
              onChange={(e) => setShippingAddress({ district: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-gray-900"
              placeholder="Kadıköy"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mahalle</label>
            <input
              value={shippingAddress.neighbourhood || ''}
              onChange={(e) => setShippingAddress({ neighbourhood: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-gray-900"
              placeholder="Acıbadem"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Posta Kodu *</label>
            <input
              required
              value={shippingAddress.postalCode || ''}
              onChange={(e) => setShippingAddress({ postalCode: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-gray-900"
              placeholder="34000"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ülke *</label>
          <input
            required
            value={shippingAddress.country || 'Türkiye'}
            onChange={(e) => setShippingAddress({ country: e.target.value })}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-gray-900"
            placeholder="Türkiye"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Adres Tarifi (Opsiyonel)</label>
          <input
            value={shippingAddress.additionalInfo || ''}
            onChange={(e) => setShippingAddress({ additionalInfo: e.target.value })}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-gray-900"
            placeholder="Kapı kodu, kat bilgisi vs."
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={goToPreviousStep}
            className="px-6 py-3 border rounded-md hover:bg-gray-50"
          >
            Geri
          </button>
          <button
            type="submit"
            className="bg-gray-900 text-white px-8 py-3 rounded-md hover:bg-gray-800"
          >
            Devam Et
          </button>
        </div>
      </form>
    </div>
  );
}
