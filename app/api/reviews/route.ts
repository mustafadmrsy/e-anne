import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDB } from '@/lib/firebaseAdmin'

const normalize = (s: string) => (s || '')
  .toLowerCase().trim()
  .replace(/[çÇ]/g, 'c').replace(/[ğĞ]/g, 'g')
  .replace(/[ıİ]/g, 'i').replace(/[öÖ]/g, 'o')
  .replace(/[şŞ]/g, 's').replace(/[üÜ]/g, 'u')
  .replace(/[^a-z0-9-\s]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return NextResponse.json({ ok: false, error: 'auth/missing-token' }, { status: 401 })

    const auth = getAdminAuth()
    const db = getAdminDB()
    const decoded = await auth.verifyIdToken(token)
    const uid = decoded.uid
    const isAdmin = (decoded as any).admin === true

    const body = await req.json()
    const { slug, rating, comment, parentId } = body || {}
    if (!slug) return NextResponse.json({ ok: false, error: 'invalid/slug' }, { status: 400 })

    const norm = normalize(slug)
    // Resolve product via catalog first
    let prodRef: FirebaseFirestore.DocumentReference | null = null
    try {
      const cat = await db.collection('catalog').doc(norm).get()
      if (cat.exists) {
        const c = cat.data() as any
        if (c?.path) prodRef = db.doc(String(c.path))
        else if (c?.sellerId && c?.productId) prodRef = db.doc(`sellers/${c.sellerId}/products/${c.productId}`)
      }
    } catch {}
    // Fallback collectionGroup
    if (!prodRef) {
      const snap = await db.collectionGroup('products').where('slug', '==', norm).limit(1).get()
      if (!snap.empty) prodRef = snap.docs[0].ref
    }
    if (!prodRef) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })

    const prodSnap = await prodRef.get()
    if (!prodSnap.exists) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
    const sellerRef = prodRef.parent.parent
    const sellerId = sellerRef?.id

    // Determine role badge
    let role: 'seller'|'admin'|'buyer' = 'buyer'
    if (isAdmin) role = 'admin'
    else if (sellerId && sellerId === uid) role = 'seller'

    // Write review or reply
    if (parentId) {
      const replyRef = prodRef.collection('reviews').doc(parentId).collection('replies').doc()
      await replyRef.set({
        userId: uid,
        userName: decoded.name || decoded.email || null,
        comment: String(comment || ''),
        role,
        createdAt: new Date(),
      })
      // top-level tablo kaydı (reply)
      await db.collection('reviews').doc(replyRef.id).set({
        type: 'reply',
        parentId,
        slug: norm,
        productPath: prodRef.path,
        sellerId: sellerId || null,
        userId: uid,
        userName: decoded.name || decoded.email || null,
        comment: String(comment || ''),
        role,
        createdAt: new Date(),
      })
      return NextResponse.json({ ok: true, id: replyRef.id })
    } else {
      const r = Number(rating || 0)
      if (!(r >= 1 && r <= 5)) return NextResponse.json({ ok: false, error: 'invalid/rating' }, { status: 400 })
      const reviewRef = prodRef.collection('reviews').doc()
      await reviewRef.set({
        userId: uid,
        userName: decoded.name || decoded.email || null,
        rating: r,
        comment: String(comment || ''),
        role,
        createdAt: new Date(),
      })
      // top-level tablo kaydı (review)
      await db.collection('reviews').doc(reviewRef.id).set({
        type: 'review',
        parentId: null,
        slug: norm,
        productPath: prodRef.path,
        sellerId: sellerId || null,
        userId: uid,
        userName: decoded.name || decoded.email || null,
        rating: r,
        comment: String(comment || ''),
        role,
        createdAt: new Date(),
      })
      return NextResponse.json({ ok: true, id: reviewRef.id })
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
