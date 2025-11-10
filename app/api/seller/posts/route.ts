import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDB } from '@/lib/firebaseAdmin'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return NextResponse.json({ ok: false, error: 'auth/missing-token' }, { status: 401 })

    const auth = getAdminAuth()
    const db = getAdminDB()
    const decoded = await auth.verifyIdToken(token)
    const uid = decoded.uid

    // Check approved seller status from users/{uid}
    const userSnap = await db.collection('users').doc(uid).get()
    const sellerStatus = userSnap.get('sellerStatus')
    const isApprovedSeller = sellerStatus === 'approved'
    if (!isApprovedSeller) return NextResponse.json({ ok: false, error: 'auth/not-approved-seller' }, { status: 403 })

    const body = await req.json()
    const { title, content, image, coverImage, contentImage, category, status } = body || {}
    if (!title || !content) return NextResponse.json({ ok: false, error: 'invalid/body' }, { status: 400 })

    const now = new Date()
    const doc = await db.collection('posts').add({
      title: String(title).trim(),
      content: String(content).trim(),
      image: coverImage ? String(coverImage) : (image ? String(image) : null),
      coverImage: coverImage ? String(coverImage) : (image ? String(image) : null),
      contentImage: contentImage ? String(contentImage) : null,
      category: category ? String(category) : null,
      status: status === 'published' ? 'published' : 'draft',
      authorId: uid,
      authorRole: 'seller',
      createdAt: now,
      updatedAt: now,
    })
    return NextResponse.json({ ok: true, id: doc.id })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return NextResponse.json({ ok: false, error: 'auth/missing-token' }, { status: 401 })

    const auth = getAdminAuth()
    const db = getAdminDB()
    const decoded = await auth.verifyIdToken(token)
    const uid = decoded.uid

    const userSnap = await db.collection('users').doc(uid).get()
    const sellerStatus = userSnap.get('sellerStatus')
    const isApprovedSeller = sellerStatus === 'approved'
    if (!isApprovedSeller) return NextResponse.json({ ok: false, error: 'auth/not-approved-seller' }, { status: 403 })

    let items: any[] = []
    try {
      const snap = await db.collection('posts').where('authorId', '==', uid).orderBy('createdAt', 'desc').limit(50).get()
      items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
    } catch {
      // Fallback: index yoksa sadece where ile çek, hafızada sırala
      const snap = await db.collection('posts').where('authorId', '==', uid).limit(50).get()
      items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
      items.sort((a:any,b:any)=>{
        const ca = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0
        const cb = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0
        return cb - ca
      })
    }
    return NextResponse.json({ ok: true, items })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
