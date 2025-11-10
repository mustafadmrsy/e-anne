import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDB } from '@/lib/firebaseAdmin'

async function authSeller(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return { ok: false as const, status: 401 as const, error: 'auth/missing-token' as const }
  try {
    const auth = getAdminAuth()
    const decoded = await auth.verifyIdToken(token)
    const uid = decoded.uid
    const db = getAdminDB()
    const userSnap = await db.collection('users').doc(uid).get()
    const sellerStatus = userSnap.get('sellerStatus')
    const isApprovedSeller = sellerStatus === 'approved'
    if (!isApprovedSeller) return { ok: false as const, status: 403 as const, error: 'auth/not-approved-seller' as const }
    return { ok: true as const, uid }
  } catch {
    return { ok: false as const, status: 401 as const, error: 'auth/invalid-token' as const }
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const a = await authSeller(req)
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status })
  try {
    const db = getAdminDB()
    const ref = db.collection('posts').doc(params.id)
    const snap = await ref.get()
    if (!snap.exists) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
    const data = snap.data() as any
    if (data.authorId !== a.uid) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })

    const body = await req.json().catch(()=>({}))
    const allowed: any = {}
    if (typeof body.title === 'string') allowed.title = body.title.trim()
    if (typeof body.content === 'string') allowed.content = body.content.trim()
    if (typeof body.coverImage === 'string' || body.coverImage === null) allowed.coverImage = body.coverImage || null
    if (typeof body.contentImage === 'string' || body.contentImage === null) allowed.contentImage = body.contentImage || null
    if (typeof body.category === 'string' || body.category === null) allowed.category = body.category || null
    if (typeof body.status === 'string') allowed.status = (body.status === 'published' ? 'published' : 'draft')
    allowed.updatedAt = new Date()

    await ref.update(allowed)
    return NextResponse.json({ ok: true })
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const a = await authSeller(req)
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status })
  try {
    const db = getAdminDB()
    const ref = db.collection('posts').doc(params.id)
    const snap = await ref.get()
    if (!snap.exists) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
    const data = snap.data() as any
    if (data.authorId !== a.uid) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })

    await ref.delete()
    return NextResponse.json({ ok: true })
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
