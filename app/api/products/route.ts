import { NextRequest, NextResponse } from 'next/server'
import { getAdminDB } from '@/lib/firebaseAdmin'

export async function GET(req: NextRequest) {
  try {
    const db = getAdminDB()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const slug = searchParams.get('slug')
    const limitParam = Number(searchParams.get('limit') || '24')
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 24
    const normalize = (s: string) => (s || '')
      .toLowerCase()
      .trim()
      .replace(/[çÇ]/g, 'c')
      .replace(/[ğĞ]/g, 'g')
      .replace(/[ıİ]/g, 'i')
      .replace(/[öÖ]/g, 'o')
      .replace(/[şŞ]/g, 's')
      .replace(/[üÜ]/g, 'u')
      .replace(/[^a-z0-9-\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    if (slug) {
      try {
        const normalized = normalize(slug)
        // A) Root katalogdan çöz (marketplace mantığı)
        const catRef = db.collection('catalog').doc(normalized)
        const catSnap = await catRef.get()
        let d: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> | null = null
        if (catSnap.exists) {
          const c = catSnap.data() as any
          if (c?.sellerId && c?.productId) {
            d = await db.doc(`sellers/${c.sellerId}/products/${c.productId}`).get()
          } else if (c?.path) {
            d = await db.doc(String(c.path)).get()
          }
        }
        // B) Katalog yoksa eski fallbacklerle çöz
        if (!d || !d.exists) {
          // 1) slug == input
          let snap = await db.collectionGroup('products').where('slug', '==', slug).limit(1).get()
          // 2) slug == normalized
          if (snap.empty && slug !== normalized) {
            snap = await db.collectionGroup('products').where('slug', '==', normalized).limit(1).get()
          }
          // 3) slugNormalized == normalized
          if (snap.empty) {
            try { snap = await db.collectionGroup('products').where('slugNormalized', '==', normalized).limit(1).get() } catch {}
          }
          if (snap.empty) return NextResponse.json({ ok: true, items: [] })
          d = snap.docs[0]
        }
        if (!d || !d.exists) return NextResponse.json({ ok: true, items: [] })
        const data = d.data() as any
        const sellerRef = d.ref.parent.parent
        const sellerId = sellerRef?.id || ''
        let sellerName: string | undefined
        try {
          const s = await sellerRef?.get()
          sellerName = s?.get('name') || s?.get('storeName') || undefined
        } catch {}
        // Reviews oku (opsiyonel)
        let reviews: Array<{id?: string; userName?: string; rating: number; comment?: string; createdAt?: any; role?: string; replies?: Array<{userName?: string; comment?: string; createdAt?: any; role?: string}>}> = []
        let ratingCount = 0
        let ratingAvg = 0
        try {
          const revSnap = await d.ref.collection('reviews').orderBy('createdAt', 'desc').limit(20).get()
          let sum = 0
          const ids: string[] = []
          revSnap.forEach(r => {
            const rd = r.data() as any
            const rt = Number(rd.rating || 0)
            sum += rt
            const base: any = {
              id: r.id,
              userName: rd.userName || rd.authorName || undefined,
              rating: rt,
              comment: rd.comment || '',
              createdAt: rd.createdAt || null,
              role: rd.role || undefined,
            }
            reviews.push(base)
            ids.push(r.id)
          })
          // Replies'i isteğe bağlı oku (sınırlı)
          for (let i = 0; i < reviews.length; i++) {
            try {
              const rid = reviews[i].id || revSnap.docs[i].id
              const repSnap = await d.ref.collection('reviews').doc(rid).collection('replies').orderBy('createdAt','asc').limit(10).get()
              if (!repSnap.empty) {
                reviews[i].replies = repSnap.docs.map(rr => {
                  const rrd = rr.data() as any
                  return {
                    userName: rrd.userName || rrd.authorName || undefined,
                    comment: rrd.comment || '',
                    createdAt: rrd.createdAt || null,
                    role: rrd.role || undefined,
                  }
                })
              }
            } catch {}
          }
          ratingCount = revSnap.size
          ratingAvg = ratingCount > 0 ? sum / ratingCount : 0
        } catch {}
        const item = {
          id: d.id,
          sellerId,
          slug: data.slug,
          name: data.name,
          image: data.image || data.imageUrl || '',
          price: Number(data.price || 0),
          category: data.category || null,
          rating: Number(data.rating || ratingAvg || 0),
          sellerName,
          description: data.description || '',
          reviews,
          ratingAvg,
          ratingCount,
          reviewsIds: reviews.map(r => r.id).filter(Boolean),
        }
        return NextResponse.json({ ok: true, items: [item] })
      } catch (err) {
        console.error('GET /api/products slug error:', (err as any)?.message)
        return NextResponse.json({ ok: true, items: [] })
      }
    }

    const runQuery = async () => {
      try {
        let qs: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>
        if (category) {
          qs = db.collectionGroup('products').where('category', '==', category).orderBy('createdAt', 'desc').limit(limit)
        } else {
          qs = db.collectionGroup('products').orderBy('createdAt', 'desc').limit(limit)
        }
        return await qs.get()
      } catch (e) {
        // Fallback: orderBy olmadan dene (index gereksinimi veya missing field durumlarında)
        if (category) {
          return await db.collectionGroup('products').where('category', '==', category).limit(limit).get()
        } else {
          return await db.collectionGroup('products').limit(limit).get()
        }
      }
    }
    const snap = await runQuery()

    const items = await Promise.all(snap.docs.map(async (d) => {
      const data = d.data() as any
      const sellerRef = d.ref.parent.parent
      const sellerId = sellerRef?.id || ''
      let sellerName: string | undefined
      try {
        const s = await sellerRef?.get()
        sellerName = s?.get('name') || undefined
      } catch {}
      return {
        id: d.id,
        sellerId,
        slug: data.slug,
        name: data.name,
        image: data.image || data.imageUrl || '',
        price: Number(data.price || 0),
        category: data.category || null,
        rating: Number(data.rating || 0),
        sellerName,
      }
    }))

    return NextResponse.json({ ok: true, items })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
