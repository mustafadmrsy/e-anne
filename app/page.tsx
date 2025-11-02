"use client"
import { useEffect, useState } from 'react'
import { getPageConfig } from '@/lib/siteConfig'
import BlockRenderer from '@/components/site/BlockRenderer'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ProductGrid } from '@/components/ProductGrid'

export default function HomePage() {
  const [blocks, setBlocks] = useState<any[] | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    getPageConfig('home').then(p => {
      if (!mounted) return
      setBlocks(p.layout || [])
    })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let alive = true
    fetch('/api/products?limit=24').then(r=>r.json()).then(d=>{
      if (!alive) return
      if (d?.ok) setProducts(d.items || [])
    }).catch(()=>{})
    return () => { alive = false }
  }, [])

  useEffect(() => {
    let alive = true
    fetch('/api/posts?limit=6').then(r=>r.json()).then(d=>{
      if (!alive) return
      if (d?.ok) setPosts(d.items || [])
    }).catch(()=>{})
    return () => { alive = false }
  }, [])

  // Eğer builder'dan bir layout varsa onu göster; aksi halde mevcut statik anasayfayı göster
  if (blocks && blocks.length > 0) {
    return (
      <main className="container-narrow py-6">
        <BlockRenderer blocks={blocks} />
      </main>
    )
  }

  return (
    <main className="bg-white text-secondary">
      {/* HERO — tek mağaza vurgusu */}
      <section className="relative overflow-hidden">
        {/* Arka plan blur bloblar */}
        <div aria-hidden className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute top-10 -right-24 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
        {/* Tüm alanı kaplayan arka plan */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: `url(/background/eriste-background.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Okunabilirlik için hafif karartma gradient */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-transparent" />
        <div className="container-narrow py-10 sm:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl sm:text-5xl font-extrabold leading-tight text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]"
              >
                Annemin Eriştesi ve Doğal Ürünleri
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mt-3 text-white/90 text-lg drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
              >
                Ev yapımı, katkısız ve sevgiyle hazırlanan ürünler. Tazelik ve lezzeti kapına getiriyoruz.
              </motion.p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link href="#urunler" className="inline-flex items-center justify-center rounded-2xl bg-secondary px-6 py-3 text-white font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">Ürünleri Keşfet</Link>
                <Link href="#hikaye" className="inline-flex items-center justify-center rounded-2xl border border-white px-6 py-3 font-semibold text-white hover:bg-white/10">Hikayemiz</Link>
              </div>
              {/* Güven rozetleri */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[{t:'Katkısız',d:'Ev yapımı'}, {t:'Güvenli Paket',d:'Tazelik garantisi'}, {t:'Hızlı Teslim',d:'Türkiye geneli'}].map((b,i)=> (
                  <div key={i} className="rounded-xl border border-white/30 bg-white/10 backdrop-blur p-3">
                    <div className="text-sm font-semibold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">{b.t}</div>
                    <div className="text-xs text-white/80">{b.d}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Sağ sütun görsel kart kaldırıldı; arka plan tüm alanı kaplıyor */}
          </div>
        </div>
      </section>

      

      {/* Dalga ayırıcı */}
      <div aria-hidden className="text-slate-200">
        <svg viewBox="0 0 1440 80" className="w-full h-10"><path d="M0,64 C240,16 480,16 720,64 C960,112 1200,112 1440,64 L1440,80 L0,80 Z" fill="currentColor" /></svg>
      </div>

      {/* HİKAYE — tek satıcı marka anlatısı */}
      <section id="hikaye" className="border-t border-slate-200 bg-slate-50/50 relative overflow-hidden">
        {/* Yumuşak blob */}
        <div aria-hidden className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-rose-300/10 blur-3xl" />
        <div className="container-narrow py-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Sol: Alıntı kartı */}
            <div className="md:col-span-7">
              <div className="rounded-3xl border bg-white p-6 sm:p-8">
                <div className="text-5xl leading-none text-secondary mb-3">“</div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Ev tadında, katkısız ve içten lezzetler</h3>
                <p className="mt-2 text-slate-600 text-sm sm:text-base">
                  Küçük partilerde, aynı mutfak disipliniyle; bugün yoğurup yarın kurutuyor, tazeliği bozmadan paketliyoruz.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">🥣</div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Özlem Anne</div>
                    <div className="text-xs text-slate-500">Kurucu • 2016'dan beri</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Sağ: İstatistikler + Mini zaman çizgisi */}
            <div className="md:col-span-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border bg-white p-4 text-center">
                  <div className="text-2xl font-extrabold text-secondary">4.9</div>
                  <div className="text-xs text-slate-600">Ortalama Puan</div>
                </div>
                <div className="rounded-2xl border bg-white p-4 text-center">
                  <div className="text-2xl font-extrabold text-secondary">48 Saat</div>
                  <div className="text-xs text-slate-600">İçinde Kargo</div>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border bg-white p-4">
                <div className="text-sm font-semibold text-slate-800 mb-2">Nasıl Hazırlıyoruz?</div>
                <ol className="space-y-2 text-sm">
                  <li className="flex gap-2"><span className="text-secondary">1.</span> Hamur açma ve kesim</li>
                  <li className="flex gap-2"><span className="text-secondary">2.</span> Doğal kurutma</li>
                  <li className="flex gap-2"><span className="text-secondary">3.</span> Hijyenik paketleme</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ÜRÜNLER — öne çıkanlar */}
      <section id="urunler" aria-labelledby="urunler-heading" className="container-narrow py-14">
        <div className="flex items-end justify-between gap-3">
          <div>
            <motion.h2 initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} transition={{duration:0.6}} className="text-2xl sm:text-3xl font-bold" id="urunler-heading">Öne Çıkan Ürünler</motion.h2>
            <p className="mt-1 text-slate-600">En çok sevilen lezzetlerimizden seçtik.</p>
          </div>
          <Link href="#urunler" className="hidden sm:inline-flex rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">Tümünü Gör</Link>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mt-6">
          {products.length > 0 ? (
            <ProductGrid products={products.slice(0,8).map(p => ({
              slug: p.slug,
              name: p.name,
              price: p.price,
              image: p.image,
              sellerName: p.sellerName,
              storeName: p.storeName,
              seller: p.seller,
              category: p.category,
              rating: p.rating,
            }))} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({length:8}).map((_,i)=>(
                <div key={i} className="rounded-2xl border p-3">
                  <div className="aspect-square rounded-xl bg-slate-100 animate-pulse" />
                  <div className="mt-3 h-3 w-3/4 bg-slate-100 rounded animate-pulse" />
                  <div className="mt-2 h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* MÜŞTERİ YORUMLARI — statik placeholder */}
      <section className="bg-white border-t border-slate-200">
        <div className="container-narrow py-12">
          <motion.h3 initial={{opacity:0,y:8}} whileInView={{opacity:1,y:0}} transition={{duration:0.5}} className="text-xl sm:text-2xl font-bold">Müşterilerimiz ne diyor?</motion.h3>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["Erişte harika, annemin yaptığı gibi.", "Paketleme çok özenliydi, taze geldi.", "Hızlı kargo, lezzet şahane."]
              .map((t,i)=> (
                <div key={i} className="rounded-2xl border p-4">
                  <div className="text-amber-500">★★★★★</div>
                  <p className="mt-2 text-slate-700 text-sm">{t}</p>
                  <div className="mt-2 text-xs text-slate-500">— Müşteri {i+1}</div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* NEDEN BİZ — özellik kartları (secondary renk) */}
      <section className="py-12 bg-white border-t border-slate-200">
        <div className="container-narrow">
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 border border-secondary/30 text-secondary rounded-full text-sm font-semibold">Neden Bizi Seçmelisiniz?</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-800">Farkımız Kalitemizde</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🛡️', title: 'Doğal & Katkısız', desc: 'Tamamen doğal malzemeler' },
              { icon: '👩‍🍳', title: 'El Emeği', desc: 'Geleneksel tariflerle' },
              { icon: '🚚', title: 'Hızlı Kargo', desc: '1-3 günde teslim' },
              { icon: '❤️', title: 'Sevgiyle Paket', desc: 'Özenle hazırlanır' },
            ].map((f: any, i: number) => (
              <div key={i} className="group rounded-2xl border border-secondary/30 bg-white p-6 shadow-sm hover:shadow-md transition">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-white text-2xl">
                  <span aria-hidden>{f.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG — Mutfaktan Haberler (secondary renk) */}
      <section className="py-12 bg-white border-t border-slate-200">
        <div className="container-narrow">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="inline-block px-3 py-1 border border-secondary/30 text-secondary rounded-full text-sm font-semibold">Blog & Tarifler</span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-800">Mutfaktan Haberler</h2>
            </div>
            <Link href="/blog" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-white text-sm">Tüm Yazılar <span aria-hidden>→</span></Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {(posts.length > 0 ? posts.slice(0,3) : [
              { id: 'ph1', title: 'Ev Yapımı Erişte Nasıl Saklanır?', createdAt: null, image: '📝', category: 'İpuçları' },
              { id: 'ph2', title: 'Tarhananın Faydaları ve Tarifleri', createdAt: null, image: '🥘', category: 'Tarif' },
              { id: 'ph3', title: 'Doğal Ürünlerin Önemi', createdAt: null, image: '🌿', category: 'Sağlık' },
            ]).map((p:any, idx:number) => (
              <article key={p.id || idx} className="group bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-2xl overflow-hidden border border-secondary/30 shadow-sm hover:shadow-md transition">
                {(() => {
                  const img = p.coverImage || p.image
                  const isUrl = typeof img === 'string' && (/^https?:\/\//i).test(img)
                  if (isUrl) {
                    return (
                      <div className="aspect-video overflow-hidden">
                        <img src={img} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                    )
                  }
                  return (
                    <div className="aspect-video bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center text-5xl">
                      <span>{img || '📝'}</span>
                    </div>
                  )
                })()}
                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-slate-600 mb-2">
                    <span className="px-2 py-0.5 bg-secondary text-white rounded-full">{p.category || 'Genel'}</span>
                    {p.createdAt && <span className="flex items-center gap-1"><span aria-hidden>📅</span>{new Date(p.createdAt._seconds ? p.createdAt._seconds*1000 : p.createdAt).toLocaleDateString()}</span>}
                  </div>
                  <h3 className="font-semibold text-slate-800 line-clamp-2">{p.title}</h3>
                  <div className="mt-3">
                    <Link href={p.id ? `/blog/${p.id}` : '#'} className="text-secondary text-sm inline-flex items-center gap-1">Devamını Oku <span aria-hidden>→</span></Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ÜRETİMDEN KARELER — kolaj */}
      <section className="border-t border-slate-200">
        <div className="container-narrow py-12">
          <motion.h3 initial={{opacity:0,y:8}} whileInView={{opacity:1,y:0}} transition={{duration:0.5}} className="text-xl sm:text-2xl font-bold">Üretimden Kareler</motion.h3>
          {/* Not: Akışkan şerit kaldırıldı; efektler her karenin içinde uygulanıyor */}
          {(() => {
            const imgs = [
              products[2]?.image,
              products[3]?.image,
              products[4]?.image,
              products[5]?.image,
              products[6]?.image,
              products[7]?.image,
            ] as (string | undefined)[]
            const labels = ['Hamur Açma','Kesim','Kuruma','Paketleme','Malzeme','Mutfağımız']
            return (
              <div className="mt-5 overflow-hidden" style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
                <motion.div
                  initial={{ x: 0 }}
                  animate={{ x: ['0%','-50%'] }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                  className="flex gap-3"
                >
                  {Array.from({length:2}).map((_,k)=> (
                    <div key={k} className="flex gap-3">
                      {imgs.map((src, idx) => (
                        <div key={`${k}-${idx}`} className="w-40 sm:w-48 lg:w-56 aspect-square shrink-0">
                          <div className="group relative h-full w-full overflow-hidden rounded-2xl border bg-white">
                            {/* Akışkan dönen gradient arkaplan */}
                            <div className="absolute -inset-6 rounded-3xl float-rotate opacity-70">
                              <div className="h-full w-full blur-2xl"
                                style={{
                                  background: 'radial-gradient(60% 60% at 20% 20%, rgba(255, 200, 150, 0.25), transparent 60%), radial-gradient(60% 60% at 80% 80%, rgba(255, 150, 200, 0.25), transparent 60%)'
                                }}
                              />
                            </div>
                            {src ? (
                              <img src={src} alt="Üretim karesi" className="relative z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
                            ) : (
                              <div className="relative z-10 h-full w-full bg-gradient-to-br from-amber-50 to-rose-50" />
                            )}
                            {/* karartma + etiket */}
                            <div className="pointer-events-none absolute inset-0 z-10 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            <div className="absolute left-2 bottom-2 z-20">
                              <span className="inline-flex items-center rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-700 shadow">{labels[idx] || 'Üretim'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </motion.div>
              </div>
            )
          })()}
          {/* Animasyon sınıfı */}
          <style jsx>{`
            @keyframes float-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .float-rotate { animation: float-rotate 20s linear infinite; }
          `}</style>
        </div>
      </section>

      {/* İSTATİSTİKLER — ikonlu kartlar (secondary renk) */}
      <section className="bg-white border-t border-slate-200">
        <div className="container-narrow py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { icon: '👥', value: '15K+', label: 'Mutlu Müşteri' },
              { icon: '📦', value: '50K+', label: 'Teslim Edilen Ürün' },
              { icon: '⭐', value: '4.9', label: 'Ortalama Puan' },
              { icon: '⏰', value: '2016', label: 'Sevgiyle Üretiyoruz' },
            ].map((s: any, i: number) => (
              <div key={i} className="text-center rounded-2xl border p-6 bg-white">
                <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-secondary/30 text-2xl">
                  <span aria-hidden>{s.icon}</span>
                </div>
                <div className="text-3xl font-extrabold text-slate-800">{s.value}</div>
                <div className="text-sm text-slate-600 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GENİŞ CTA BANDI */}
      <section className="relative overflow-hidden">
        <div className="container-narrow py-12">
          <div className="rounded-3xl border bg-gradient-to-r from-secondary to-cyan-600 text-white p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold">El emeği lezzetleri keşfet</h3>
                <p className="mt-1 text-white/90">Bugün sipariş ver, taptaze ulaşsın.</p>
              </div>
              <Link href="#urunler" className="inline-flex items-center justify-center rounded-2xl bg-white text-secondary px-6 py-3 font-semibold shadow hover:opacity-95">Alışverişe Başla</Link>
            </div>
          </div>
        </div>
      </section>

      {/* moved up: Neden Biz */}

      {/* moved up: Blog */}
    </main>
  )
}
