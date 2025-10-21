"use client"

import { notFound, useRouter } from 'next/navigation'
import { products } from '@/lib/products'
import { useCart } from '@/components/CartProvider'

export default function ProductPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { add } = useCart()
  const product = products.find(p => p.slug === params.slug)
  if (!product) return notFound()
  const priceNumber = (() => {
    const n = product.price.replace(/[^0-9,\.]/g, '').replace(',', '.')
    const v = parseFloat(n)
    return Number.isFinite(v) ? v : 0
  })()

  return (
    <main className="container-narrow py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
            <img src={product.image} alt={product.name} className="w-full h-auto object-cover" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>
          <div className="mt-2 text-2xl font-extrabold">{product.price}</div>
          <div className="mt-4 text-slate-600">{product.description}</div>
          <div className="mt-2 text-sm">
            {product.stock && product.stock > 0 ? (
              <span className="text-green-600">Stokta: {product.stock} adet</span>
            ) : (
              <span className="text-red-600">Stokta yok</span>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              className="rounded-lg bg-brand px-4 py-3 text-white font-semibold hover:bg-[#e18700] focus:outline-none focus:ring-2 focus:ring-secondary"
              onClick={() => {
                add({ slug: product.slug, name: product.name, price: priceNumber, image: product.image }, 1)
              }}
            >
              Sepete Ekle
            </button>
            <button
              className="rounded-lg bg-secondary px-4 py-3 text-white font-semibold hover:bg-[#115e99] focus:outline-none focus:ring-2 focus:ring-secondary"
              onClick={() => {
                add({ slug: product.slug, name: product.name, price: priceNumber, image: product.image }, 1)
                router.push('/cart')
              }}
            >
              Hemen Satın Al
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
