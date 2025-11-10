import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDB } from '@/lib/firebaseAdmin'
import admin from 'firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    const auth = getAdminAuth()
    const db = getAdminDB()
    let uid: string | null = null
    if (token) {
      try {
        const decoded = await auth.verifyIdToken(token)
        uid = decoded.uid
      } catch {
        uid = null
      }
    }

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

    const orderRef = uid
      ? db.collection('users').doc(uid).collection('orders').doc()
      : db.collection('guest_orders').doc()
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

    await orderRef.set(orderDoc)

    // Fan-out + stok düş: item'larda sellerId/productId yoksa slug ile çözümle
    const resolved: any[] = []
    for (const it of items) {
      if (it?.sellerId && it?.productId) { resolved.push(it); continue }
      try {
        if (!it?.slug) { resolved.push(it); continue }
        let sellerId: string | null = null
        let productId: string | null = null
        // Normalize like products API
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
        const norm = normalize(String(it.slug))

        // 0) Try catalog index first
        try {
          const cat = await db.collection('catalog').doc(norm).get()
          if (cat.exists) {
            const c = cat.data() as any
            if (c?.sellerId && c?.productId) {
              sellerId = String(c.sellerId)
              productId = String(c.productId)
            } else if (c?.path) {
              const parts = String(c.path).split('/')
              // Expect sellers/{sellerId}/products/{productId}
              const sIdx = parts.indexOf('sellers')
              const pIdx = parts.indexOf('products')
              if (sIdx >= 0 && parts[sIdx+1] && pIdx >= 0 && parts[pIdx+1]) {
                sellerId = parts[sIdx+1]
                productId = parts[pIdx+1]
              }
            }
          }
        } catch {}

        // 1) Try nested sellers/*/products via collectionGroup, with multiple keys
        if (!sellerId || !productId) {
          let qs = await db.collectionGroup('products').where('slug', '==', it.slug).limit(1).get()
          if (qs.empty && it.slug !== norm) {
            qs = await db.collectionGroup('products').where('slug', '==', norm).limit(1).get()
          }
          if (qs.empty) {
            try { qs = await db.collectionGroup('products').where('slugNormalized', '==', norm).limit(1).get() } catch {}
          }
          if (!qs.empty) {
            const doc = qs.docs[0]
            productId = doc.id
            const sRef = doc.ref.parent.parent
            sellerId = sRef?.id || null
          }
        }

        // 2) Fallback: top-level products collection
        if ((!sellerId || !productId)) {
          let top = await db.collection('products').where('slug', '==', it.slug).limit(1).get()
          if (top.empty && it.slug !== norm) {
            top = await db.collection('products').where('slug', '==', norm).limit(1).get()
          }
          if (!top.empty) {
            const d = top.docs[0]
            productId = d.id
            const sid = d.get('sellerId') || d.get('seller') || null
            sellerId = sid || null
          }
        }

        if (sellerId && productId) resolved.push({ ...it, sellerId, productId })
        else resolved.push(it)
      } catch {
        resolved.push(it)
      }
    }
    // Normalize qty to number where possible
    const normalized = resolved.map((it: any) => ({
      ...it,
      qty: Number.isFinite(Number(it?.qty)) ? Number(it.qty) : it?.qty
    }))
    // Fan-out any resolvable items (do not require all of them)
    const fanoutItems = normalized.filter((it: any) => it && it.sellerId && it.productId && Number.isFinite(Number(it.qty)))
    if (fanoutItems.length > 0) {
      const batch = db.batch()
      const bySeller: Record<string, any[]> = {}
      for (const it of fanoutItems) {
        bySeller[it.sellerId] = bySeller[it.sellerId] || []
        bySeller[it.sellerId].push(it)
      }
      for (const sellerId of Object.keys(bySeller)) {
        const sRef = db.collection('sellers').doc(sellerId).collection('orders').doc(orderRef.id)
        batch.set(sRef, {
          buyerId: uid || null,
          customerId: uid || null,
          orderId: orderRef.id,
          orderNo: orderDoc.orderNo,
          items: bySeller[sellerId],
          amount: (totals?.payable ?? 0),
          totals: totals || null,
          status: orderDoc.status,
          createdAt: now,
          updatedAt: now,
        }, { merge: true })
      }
      await batch.commit()

      // Diagnostics: success log
      try {
        await db.collection('logs').add({
          level: 'info',
          code: 'fanout_success',
          orderId: orderRef.id,
          orderNo: orderDoc.orderNo,
          sellers: Object.keys(bySeller),
          counts: Object.fromEntries(Object.entries(bySeller).map(([k,v])=>[k, v.length])),
          createdAt: now,
        })
      } catch {}

      // Stok düş (transaction ile)
      await db.runTransaction(async (tx) => {
        for (const it of fanoutItems) {
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

    return NextResponse.json({ ok: true, id: orderRef.id, guest: !uid })
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
