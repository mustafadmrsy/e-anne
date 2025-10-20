'use client'
import Link from 'next/link'
import { useCart } from './CartProvider'
import { useToast } from './ToastProvider'

export type Product = {
  slug: string
  name: string
  price: string
  image: string
  brand?: string
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  const { show } = useToast()
  const priceNumber = Number(product.price.replace(/[^0-9,]/g, '').replace(',', '.')) || 0
  return (
    <article
      className="group rounded-xl border border-slate-200 bg-white shadow-card hover:shadow-cardHover transition"
      itemScope
      itemType="https://schema.org/Product"
      role="listitem"
    >
      <Link
        href={`/urun/${product.slug}`}
        className="block"
        aria-label={`${product.name} detay sayfasına git`}
        itemProp="url"
      >
        <div className="overflow-hidden rounded-t-xl">
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
          {product.price}
        </div>
        <button
          className="mt-3 w-full rounded-lg bg-brand px-4 py-2.5 text-white font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand/50"
          aria-label={`Sepete ekle: ${product.name}`}
          onClick={() => {
            add({ slug: product.slug, name: product.name, price: priceNumber, image: product.image })
            show('Ürün sepete eklendi')
          }}
        >
          Sepete Ekle
        </button>
      </div>
    </article>
  )
}

