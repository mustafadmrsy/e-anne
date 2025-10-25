import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDB } from '@/lib/firebaseAdmin'
import admin from 'firebase-admin'

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
    const {
      orderNo,
      items,
      totals,
      shippingMethod,
      paymentMethod,
      address,
      coupon,
      status
    } = body || {}

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: false, error: 'invalid/items' }, { status: 400 })
    }

    const userOrderRef = db.collection('users').doc(uid).collection('orders').doc()
    const now = admin.firestore.FieldValue.serverTimestamp()

    const orderDoc = {
      orderNo: orderNo || `EA-${Date.now()}`,
      status: status || 'hazırlanıyor',
      createdAt: now,
      items,
      totals: totals || null,
      shippingMethod: shippingMethod || null,
      paymentMethod: paymentMethod || null,
      address: address || null,
      coupon: coupon || null,
      trackingUrl: null
    }

    await userOrderRef.set(orderDoc)

    // Fan-out + stok düş: item'larda sellerId/productId yoksa slug ile çözümle
    const resolved: any[] = []
    for (const it of items) {
      if (it?.sellerId && it?.productId) { resolved.push(it); continue }
      try {
        if (!it?.slug) { resolved.push(it); continue }
        const qs = await db.collectionGroup('products').where('slug', '==', it.slug).limit(1).get()
        if (!qs.empty) {
          const doc = qs.docs[0]
          const productId = doc.id
          const sellerRef = doc.ref.parent.parent
          const sellerId = sellerRef?.id
          resolved.push({ ...it, sellerId, productId })
        } else {
          resolved.push(it)
        }
      } catch {
        resolved.push(it)
      }
    }

    const canFanOut = resolved.every((it: any) => it && it.sellerId && it.productId && typeof it.qty === 'number')
    if (canFanOut) {
      const batch = db.batch()
      const bySeller: Record<string, any[]> = {}
      for (const it of resolved) {
        bySeller[it.sellerId] = bySeller[it.sellerId] || []
        bySeller[it.sellerId].push(it)
      }
      for (const sellerId of Object.keys(bySeller)) {
        const sRef = db.collection('sellers').doc(sellerId).collection('orders').doc(userOrderRef.id)
        batch.set(sRef, {
          buyerId: uid,
          orderId: userOrderRef.id,
          items: bySeller[sellerId],
          amount: (totals?.payable ?? 0),
          status: orderDoc.status,
          createdAt: now,
          updatedAt: now,
        }, { merge: true })
      }
      await batch.commit()

      // Stok düş (transaction ile)
      await db.runTransaction(async (tx) => {
        for (const it of resolved) {
          const pRef = db.collection('sellers').doc(it.sellerId).collection('products').doc(it.productId)
          const snap = await tx.get(pRef)
          if (!snap.exists) continue
          const stock = Number(snap.get('stock') || 0)
          const newStock = stock - Number(it.qty || 0)
          if (newStock < 0) {
            tx.update(pRef, { stock: 0, status: 'inactive', updatedAt: now })
          } else {
            tx.update(pRef, { stock: newStock, updatedAt: now })
          }
        }
      })
    }

    return NextResponse.json({ ok: true, id: userOrderRef.id })
  } catch (e: any) {
    try {
      const db = getAdminDB()
      await db.collection('logs').add({
        level: 'error',
        code: 'api_order_create_failed',
        message: e?.message || String(e),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    } catch {}
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
