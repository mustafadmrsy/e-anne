import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sipariş Onayı | E-Anne',
  description: 'Siparişiniz başarıyla alındı',
};

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const orderId = searchParams.id;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg border p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Siparişiniz Alındı!</h1>
          <p className="text-gray-600 mb-6">
            Siparişiniz başarıyla oluşturuldu. En kısa sürede kargoya verilecektir.
          </p>
          
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Sipariş Numaranız</p>
              <p className="text-lg font-mono font-semibold">{orderId}</p>
            </div>
          )}
          
          <div className="flex gap-3 justify-center">
            <a
              href="/orders"
              className="px-6 py-3 border rounded-md hover:bg-gray-50"
            >
              Siparişlerim
            </a>
            <a
              href="/"
              className="bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800"
            >
              Alışverişe Devam
            </a>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Sipariş detayları e-posta adresinize gönderildi.</p>
          <p className="mt-2">Sorularınız için <a href="/contact" className="underline">iletişime geçin</a></p>
        </div>
      </div>
    </div>
  );
}
