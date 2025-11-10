'use client'
import Link from 'next/link'
import { useCart } from './CartProvider'
import { useToast } from './ToastProvider'
import { useState } from 'react'
import { useCartUI } from './CartUIProvider'

export type Product = {
  slug: string
  name: string
  price: string | number
  image: string
  brand?: string
  sellerName?: string
  storeName?: string
  seller?: string
  rating?: number
  category?: string
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  const { show } = useToast()
  const { openCart } = useCartUI()
  const priceNumber =
    typeof product.price === 'number'
      ? product.price
      : Number(product.price.replace(/[^0-9,]/g, '').replace(',', '.')) || 0

  const priceText =
    typeof product.price === 'number'
      ? `₺${product.price.toFixed(2)}`
      : product.price

  const [qty, setQty] = useState<number>(1)
  const inc = () => setQty(v => Math.min(99, v + 1))
  const dec = () => setQty(v => Math.max(1, v - 1))
  const stars = (() => {
    const r = Math.max(0, Math.min(5, Math.floor(product.rating ?? 0)))
    return '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(0, 5 - r)
  })()
  const displaySeller = (product as any).sellerName || (product as any).storeName || (product as any).seller || undefined

  return (
    <article
      className="group rounded-3xl border border-secondary/20 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all overflow-hidden hover:-translate-y-0.5"
      itemScope
      itemType="https://schema.org/Product"
      role="listitem"
    >
      <Link
        href={`/product/${product.slug}`}
        className="block"
        aria-label={`${product.name} detay sayfasına git`}
        itemProp="url"
      >
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="aspect-square w-full object-cover duration-500 ease-out group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />

          {/* Kategori etiketi */}
          {product.category && (
            <div className="absolute left-3 top-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary text-white px-2.5 py-1 text-[11px] font-medium shadow-md">
                <span aria-hidden>🏷️</span>
                <span>{product.category}</span>
              </span>
            </div>
          )}
          {/* Satıcı / Mağaza etiketi */}
          {displaySeller && (
            <div className="absolute right-3 top-3 z-10 max-w-[70%]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary text-white px-2.5 py-1 text-xs font-medium shadow-md">
                <span aria-hidden>🏪</span>
                <span className="truncate max-w-[160px]">{displaySeller}</span>
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <h3 className="font-semibold text-slate-900 line-clamp-2">
          {product.name}
        </h3>
        {product.rating != null && (
          <div className="mt-1 text-amber-500 text-sm" aria-label={`Puan: ${product.rating}/5`}>{stars}</div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <div className="text-xl font-extrabold text-slate-900">
            {priceText}
          </div>
        </div>

        {/* Üstte adet chip, altta tam genişlik buton */}
        <div className="mt-3 space-y-2">
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/95 px-1.5 h-8 shadow">
              <button type="button" onClick={dec} aria-label="Azalt" className="h-6 w-6 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-50">−</button>
              <span className="px-1 text-sm font-medium text-slate-800 select-none">{qty}</span>
              <button type="button" onClick={inc} aria-label="Arttır" className="h-6 w-6 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-50">＋</button>
            </div>
          </div>
          <button
            className="w-full rounded-xl bg-secondary px-4 py-3 text-white font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-secondary/30"
            aria-label={`Sepete ekle: ${product.name}`}
            onClick={() => {
              add({ slug: product.slug, name: product.name, price: priceNumber, image: product.image }, qty)
              show(`${qty} adet eklendi`)
              openCart()
            }}
          >
            🛒 Sepete Ekle
          </button>
        </div>
      </div>
    </article>
  )
}
