import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDB } from '@/lib/firebaseAdmin'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return NextResponse.json({ ok: false, error: 'auth/missing-token' }, { status: 401 })

    const auth = getAdminAuth()
    const db = getAdminDB()
    const decoded = await auth.verifyIdToken(token)
    const uid = decoded.uid

    const body = await req.json()
    const { slug, sellerId, productId, path, name, price, image, category } = body || {}
    if (!slug || !sellerId || !productId) {
      return NextResponse.json({ ok: false, error: 'invalid/params' }, { status: 400 })
    }
    if (uid !== sellerId) {
      return NextResponse.json({ ok: false, error: 'auth/not-owner' }, { status: 403 })
    }

    const userRef = db.collection('users').doc(uid)
    const userSnap = await userRef.get()
    const sellerStatus = userSnap.get('sellerStatus')
    if (sellerStatus !== 'approved') {
      return NextResponse.json({ ok: false, error: 'auth/not-approved-seller' }, { status: 403 })
    }

    const docRef = db.collection('catalog').doc(slug)
    await docRef.set({
      sellerId,
      productId,
      path: path || `sellers/${sellerId}/products/${productId}`,
      name: name || null,
      price: Number(price ?? 0),
      image: image || null,
      category: category || null,
      updatedAt: new Date(),
    }, { merge: true })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
