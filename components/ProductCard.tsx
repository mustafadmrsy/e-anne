'use client'
import Link from 'next/link'
import { useCart } from './CartProvider'
import { useToast } from './ToastProvider'
import { useState } from 'react'

export type Product = {
  slug: string
  name: string
  price: string | number
  image: string
  brand?: string
  sellerName?: string
  rating?: number // 0-5
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  const { show } = useToast()
  const priceNumber = typeof product.price === 'number'
    ? product.price
    : (Number(product.price.replace(/[^0-9,]/g, '').replace(',', '.')) || 0)
  const priceText = typeof product.price === 'number'
    ? `₺${product.price.toFixed(2)}`
    : product.price
  const stars = (() => {
    const r = Math.max(0, Math.min(5, Math.floor(product.rating ?? 0)))
    return '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(0, 5 - r)
  })()
  const [qty, setQty] = useState<number>(1)
  const inc = () => setQty(v => Math.min(99, v + 1))
  const dec = () => setQty(v => Math.max(1, v - 1))
  return (
    <article
      className="group rounded-2xl border border-slate-200 bg-white shadow-card hover:shadow-cardHover transition overflow-hidden"
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
        <div className="overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            itemProp="image"
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            width={600}
            height={600}
          />
        </div>
      </Link>
      <div className="p-4">
        {product.sellerName && (
          <div className="text-xs sm:text-sm text-slate-600">{product.sellerName}</div>
        )}
        {product.rating != null && (
          <div className="mt-1 text-amber-500 text-base sm:text-lg" aria-label={`Puan: ${product.rating}/5`}>{stars}</div>
        )}
        {product.brand && (
          <div className="text-sm text-slate-600" itemProp="brand">
            {product.brand}
          </div>
        )}
        <h3 className="mt-1 font-semibold text-slate-900" itemProp="name">
          {product.name}
        </h3>
        <div className="mt-2 text-lg font-bold text-slate-900" itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <meta itemProp="priceCurrency" content="TRY" />
          <meta itemProp="availability" content="https://schema.org/InStock" />
          <meta itemProp="price" content={priceNumber.toFixed(2)} />
          {priceText}
        </div>
        <div className="mt-3 flex items-stretch gap-2">
          <div className="inline-flex items-center rounded-lg border border-slate-300">
            <button type="button" onClick={dec} className="px-3 py-2 text-slate-700 hover:bg-slate-50">-</button>
            <input
              value={qty}
              onChange={(e)=>{
                const v = parseInt(e.target.value||'1',10)
                if (!isNaN(v)) setQty(Math.max(1, Math.min(99, v)))
              }}
              className="w-12 text-center outline-none py-2 text-sm"
              inputMode="numeric"
            />
            <button type="button" onClick={inc} className="px-3 py-2 text-slate-700 hover:bg-slate-50">+</button>
          </div>
          <button
            className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-white font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand/50"
            aria-label={`Sepete ekle: ${product.name}`}
            onClick={() => {
              add({ slug: product.slug, name: product.name, price: priceNumber, image: product.image }, qty)
              show(`${qty} adet eklendi`)
            }}
          >
            Sepete Ekle
          </button>
        </div>
      </div>
    </article>
  )
}

