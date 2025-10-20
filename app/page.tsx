'use client'
import { ProductGrid } from '@/components/ProductGrid'
import { products } from '@/lib/products'
import Hero from '@/components/Hero'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <main className="bg-white text-secondary">
      {/* Hero */}
      <Hero />

      {/* Ürün Tanıtım Bölümü */}
      <section id="urunler" aria-labelledby="urunler-heading" className="container-narrow py-16">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl font-extrabold tracking-tight"
              id="urunler-heading"
            >
              Erişte ve Doğal Ürünler
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mt-2 text-slate-600 text-lg"
            >
              Annemizin elinden çıkan doğal, taze ve lezzetli ürünler 🍜
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-6 sm:mt-0"
          >
            <Link
              href="#"
              className="px-6 py-3 bg-secondary text-white rounded-2xl font-medium shadow-md hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              Tüm Ürünleri Gör
            </Link>
          </motion.div>
        </div>

        {/* Ürün Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-10"
        >
          <ProductGrid products={products} />
        </motion.div>
      </section>

      {/* Ekstra: Güven & Kalite Alanı */}
      <section className="bg-slate-50 py-14 mt-12 border-t border-slate-200">
        <div className="container-narrow grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { title: 'Tamamen Doğal', desc: 'Katkısız, ev yapımı ürünler.' },
            { title: 'Güvenli Paketleme', desc: 'Taze kalması için özenle hazırlanır.' },
            { title: 'Hızlı Teslimat', desc: 'Kayseri’den Türkiye’nin her yerine.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg text-secondary">{item.title}</h3>
              <p className="mt-2 text-slate-600 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  )
}
