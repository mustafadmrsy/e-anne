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
