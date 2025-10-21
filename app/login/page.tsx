import Link from 'next/link'
import LoginForm from '@/components/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Giriş Yap | E-Anne',
  description:
    'E-Anne hesabınıza güvenle giriş yapın. Siparişlerinizi yönetin, favorilerinizi kaydedin ve hızlıca alışverişe devam edin.'
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
      <div className="container px-4 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">
          {/* ----- Görsel Alan ----- */}
          <div className="order-1 lg:order-2 relative overflow-hidden rounded-2xl border border-slate-200 shadow-md">
            <img
              src="/background/eriste-background.jpg"
              alt="Erişte ve doğal ürünler"
              className="h-56 sm:h-72 lg:h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-secondary/50 mix-blend-multiply" />
          </div>

          {/* ----- Form Alanı ----- */}
          <div className="order-2 lg:order-1">
            <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
              <header className="text-center mb-6">
                <h1 className="text-3xl font-extrabold tracking-tight text-secondary">
                  Giriş Yap
                </h1>
                <p className="mt-2 text-slate-600 text-sm">
                  Hesabına giriş yaparak E-Anne’nin tüm ayrıcalıklarından yararlan.
                </p>
              </header>

              <LoginForm />
            </div>
          </div>
        </div>
      </div>

      {/* JSON-LD: Login Action */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Giriş Yap | E-Anne',
            description: 'E-Anne hesabınıza güvenle giriş yapın.',
            potentialAction: {
              '@type': 'LoginAction',
              target: '/login'
            }
          })
        }}
      />
    </main>
  )
}
