import { getAdminDB } from '@/lib/firebaseAdmin'

export type FSProduct = {
  id: string
  sellerId: string
  name: string
  slug: string
  image: string
  price: number
  category?: string
  rating?: number
  sellerName?: string
}

export async function fetchProducts(limit = 24): Promise<FSProduct[]> {
  const db = getAdminDB()
  const qs = await db.collectionGroup('products').orderBy('createdAt', 'desc').limit(limit).get()
  const items: FSProduct[] = []
  for (const d of qs.docs) {
    const data = d.data() as any
    const sellerRef = d.ref.parent.parent
    const sellerId = sellerRef?.id || ''
    let sellerName: string | undefined
    try {
      const s = await sellerRef?.get()
      sellerName = s?.get('name') || undefined
    } catch {}
    items.push({
      id: d.id,
      sellerId,
      name: data.name,
      slug: data.slug,
      image: data.image,
      price: Number(data.price || 0),
      category: data.category,
      rating: Number(data.rating || 0),
      sellerName,
    })
  }
  return items
}

export async function fetchProductsByCategory(category: string, limit = 48): Promise<FSProduct[]> {
  const db = getAdminDB()
  const qs = await db.collectionGroup('products').where('category', '==', category).orderBy('createdAt', 'desc').limit(limit).get()
  const items: FSProduct[] = []
  for (const d of qs.docs) {
    const data = d.data() as any
    const sellerRef = d.ref.parent.parent
    const sellerId = sellerRef?.id || ''
    let sellerName: string | undefined
    try {
      const s = await sellerRef?.get()
      sellerName = s?.get('name') || undefined
    } catch {}
    items.push({
      id: d.id,
      sellerId,
      name: data.name,
      slug: data.slug,
      image: data.image,
      price: Number(data.price || 0),
      category: data.category,
      rating: Number(data.rating || 0),
      sellerName,
    })
  }
  return items
}
