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
    const { orderId, status, trackingUrl } = body || {}
    if (!orderId || (!status && typeof trackingUrl === 'undefined')) {
      return NextResponse.json({ ok: false, error: 'invalid/params' }, { status: 400 })
    }

    const now = admin.firestore.FieldValue.serverTimestamp()

    // Verify seller order exists under this seller
    const sRef = db.collection('sellers').doc(uid).collection('orders').doc(orderId)
    const sSnap = await sRef.get()
    if (!sSnap.exists) {
      return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
    }

    const updates: any = { updatedAt: now }
    if (typeof status === 'string' && status.trim()) updates.status = status
    if (typeof trackingUrl !== 'undefined') updates.trackingUrl = trackingUrl || null

    // Update seller order
    await sRef.set(updates, { merge: true })

    // Propagate to main order (user or guest)
    const customerId = sSnap.get('customerId') || null
    if (customerId) {
      await db.collection('users').doc(customerId).collection('orders').doc(orderId).set(updates, { merge: true })
    } else {
      await db.collection('guest_orders').doc(orderId).set(updates, { merge: true })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    try {
      const db = getAdminDB()
      await db.collection('logs').add({
        level: 'error',
        code: 'seller_order_update_failed',
        message: e?.message || String(e),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    } catch {}
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
