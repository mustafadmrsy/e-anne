import Link from 'next/link'
import RegisterForm from '@/components/RegisterForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kayıt Ol | E-Anne',
  description:
    "E-Anne'ye hızlıca kayıt olun. Siparişlerinizi yönetin, favorilerinizi kaydedin ve kampanyalardan haberdar olun."
}

export default function RegisterPage() {
  return (
    <main className="h-screen overflow-hidden bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
      <div className="container px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center max-w-6xl mx-auto -mt-2 sm:-mt-3">
          <div className="order-1 lg:order-2 relative overflow-hidden rounded-2xl border border-slate-200 shadow-md">
            <img
              src="/background/eriste-background.jpg"
              alt="Erişte ve doğal ürünler"
              className="h-48 sm:h-64 lg:h-96 w-full object-cover object-[50%_20%]"
            />
            <div className="absolute inset-0 bg-secondary/50 mix-blend-multiply" />
          </div>

          <div className="order-2 lg:order-1">
            <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl shadow-slate-200/40">
              <header className="text-center mb-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-secondary">Kayıt Ol</h1>
                <p className="mt-1 text-slate-600 text-sm">
                  Hesabını oluştur ve E-Anne’nin ayrıcalıklarından yararlanmaya başla.
                </p>
              </header>

              <RegisterForm />
            </div>
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Kayıt Ol | E-Anne',
            description: "E-Anne'ye güvenle kayıt olun.",
            potentialAction: {
              '@type': 'RegisterAction',
              target: '/register'
            }
          })
        }}
      />
    </main>
  )
}
