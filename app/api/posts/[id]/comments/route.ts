import { NextRequest, NextResponse } from 'next/server'
import { getAdminDB } from '@/lib/firebaseAdmin'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getAdminDB()
    const postId = params.id
    const snap = await db.collection('posts').doc(postId).collection('comments').orderBy('createdAt','desc').limit(100).get()
    const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
    return NextResponse.json({ ok: true, items })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getAdminDB()
    const postId = params.id
    const body = await req.json()
    const name = String(body?.name || 'Misafir').slice(0, 60)
    const content = String(body?.content || '').slice(0, 2000)
    if (!content) return NextResponse.json({ ok: false, error: 'empty' }, { status: 400 })
    const doc = await db.collection('posts').doc(postId).collection('comments').add({
      name,
      content,
      createdAt: new Date(),
    })
    const data = await doc.get()
    return NextResponse.json({ ok: true, item: { id: doc.id, ...(data.data() as any) } })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
