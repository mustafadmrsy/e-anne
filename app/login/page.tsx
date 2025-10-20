import Link from 'next/link'
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

              <form
                className="space-y-5"
                action="#"
                method="post"
                aria-labelledby="login-heading"
              >
                <h2 id="login-heading" className="sr-only">
                  Giriş Formu
                </h2>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700"
                  >
                    E-posta
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="ornek@mail.com"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand transition-all"
                  />
                </div>

                {/* Şifre */}
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Şifre
                    </label>
                    <Link
                      href="/forgot"
                      className="text-sm text-brand hover:opacity-80"
                    >
                      Şifremi Unuttum
                    </Link>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand transition-all"
                  />
                </div>

                {/* Remember me */}
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                    />
                    Beni hatırla
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full rounded-lg bg-brand px-4 py-2.5 text-white font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-brand/50"
                >
                  Giriş Yap
                </button>

                {/* Google ile giriş */}
                <div className="mt-2">
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-800 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-slate-200"
                    aria-label="Google ile giriş yap"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path fill="#EA4335" d="M12 11.8v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.7-2.6-5.7-5.8S8.9 8.4 12 8.4c1.8 0 3 .8 3.7 1.5l2.5-2.4C17 6 14.8 5 12 5 7.5 5 3.8 8.7 3.8 13.2S7.5 21.4 12 21.4c6 0 7.4-4.2 7.4-6.4 0-.4 0-.7-.1-1H12z"/>
                      <path fill="#34A853" d="M12 21.4c3.6 0 4.9-2.4 5.1-3.6H12v-3.6H7c-.1.3-.2.7-.2 1 0 2.8 2.3 6.2 5.2 6.2z"/>
                      <path fill="#4A90E2" d="M7 15.2l-3.2-2.5C3.3 11.9 3.1 11 3.1 10c0-1 .2-1.9.7-2.8L7 9.7c-.3.8-.4 1.8-.4 2.8 0 .9.1 1.8.4 2.7z"/>
                      <path fill="#FBBC05" d="M3.8 7.2C4.9 5 7.3 3.6 10 3.6c2.8 0 5 1 6.2 2.9L13.7 9.9c-.6-.7-1.9-1.5-3.7-1.5-3.1 0-5.7 2.6-5.7 5.8 0 1 .2 1.9.6 2.7L3.8 17c-.5-1-.7-2-.7-3.2 0-2.3.3-4.3.7-6.6z"/>
                    </svg>
                    Google ile giriş
                  </button>
                </div>

                <p className="text-center text-sm text-slate-600 mt-4">
                  Hesabın yok mu?{' '}
                  <Link
                    href="/register"
                    className="font-medium text-brand hover:opacity-80"
                  >
                    Kayıt ol
                  </Link>
                </p>
              </form>
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
