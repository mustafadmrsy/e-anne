import { NextRequest, NextResponse } from 'next/server'
import { getAdminDB } from '@/lib/firebaseAdmin'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getAdminDB()
    const snap = await db.collection('posts').doc(params.id).get()
    if (!snap.exists) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
    const data = snap.data() || {}
    if (data.status !== 'published') return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
    return NextResponse.json({ ok: true, item: { id: snap.id, ...data } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
