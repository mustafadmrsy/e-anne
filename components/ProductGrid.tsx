import { ProductCard, type Product } from './ProductCard'

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div role="list" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  )
}
