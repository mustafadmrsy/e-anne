import { fetchProducts } from '@/lib/firestoreProducts'
import { ProductGrid } from './ProductGrid'

export default async function ServerProductGrid({ limit = 24 }: { limit?: number }) {
  const items = await fetchProducts(limit)
  // Map to ProductCard type shape
  const products = items.map(p => ({
    slug: p.slug,
    name: p.name,
    price: p.price,
    image: p.image,
    sellerName: p.sellerName,
    rating: p.rating,
  }))
  return <ProductGrid products={products as any} />
}
