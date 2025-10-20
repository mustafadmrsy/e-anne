import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative isolate">
      <img
        src="/background/eriste-background.jpg"
        alt="Erişte arka plan"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-secondary/60 mix-blend-multiply" />

      <div className="container-narrow py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              Anne Eli Değmiş Gibi: Taze ve Doğal Erişte
            </h1>
            <p className="mt-4 text-white/90 max-w-prose text-lg">
              Geleneksel tariflerle, katkısız malzemelerle hazırlanan lezzetleri kapına getiriyoruz.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="#urunler"
                className="rounded-lg bg-brand px-5 py-3 text-white font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-brand/50"
              >
                Erişteyi Keşfet
              </Link>
              <Link
                href="/kampanyalar"
                className="rounded-lg border border-white/80 text-white px-5 py-3 font-semibold hover:bg-white hover:text-secondary transition"
              >
                Kampanyalar
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-white/15 text-white px-3 py-1 backdrop-blur">%100 Doğal</span>
              <span className="rounded-full bg-white/15 text-white px-3 py-1 backdrop-blur">Ev Yapımı</span>
              <span className="rounded-full bg-white/15 text-white px-3 py-1 backdrop-blur">Hızlı Teslimat</span>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-2xl bg-white/90 p-5 shadow-xl border border-white/60">
              <div className="grid grid-cols-3 gap-3">
                <img
                  src="https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=600&auto=format&fit=crop"
                  alt="Ev yapımı erişte"
                  className="h-28 w-full rounded-lg object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?q=80&w=600&auto=format&fit=crop"
                  alt="Doğal malzemeler"
                  className="h-28 w-full rounded-lg object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=600&auto=format&fit=crop"
                  alt="Geleneksel tat"
                  className="h-28 w-full rounded-lg object-cover"
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-secondary font-semibold">Taze üretim, günlük gönderim</p>
                <p className="text-slate-600 text-sm">Kayseri’den Türkiye’nin her yerine</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

