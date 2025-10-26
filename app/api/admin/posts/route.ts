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

    // admin kontrolü: custom claim veya admins/{uid}
    const isAdmin = (decoded as any).admin === true
    const uid = decoded.uid
    let allowed = isAdmin
    if (!allowed) {
      try {
        const a = await db.collection('admins').doc(uid).get()
        allowed = a.exists
      } catch {}
    }
    if (!allowed) return NextResponse.json({ ok: false, error: 'auth/not-admin' }, { status: 403 })

    const body = await req.json()
    const { title, content, image, category, status } = body || {}
    if (!title || !content) return NextResponse.json({ ok: false, error: 'invalid/body' }, { status: 400 })

    const now = new Date()
    const doc = await db.collection('posts').add({
      title: String(title).trim(),
      content: String(content).trim(),
      image: image ? String(image) : null,
      category: category ? String(category) : null,
      status: status === 'published' ? 'published' : 'draft',
      authorId: uid,
      createdAt: now,
      updatedAt: now,
    })
    return NextResponse.json({ ok: true, id: doc.id })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
