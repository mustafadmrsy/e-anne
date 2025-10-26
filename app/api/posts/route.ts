import { NextRequest, NextResponse } from 'next/server'
import { getAdminDB } from '@/lib/firebaseAdmin'

export async function GET(req: NextRequest) {
  try {
    const db = getAdminDB()
    const { searchParams } = new URL(req.url)
    const limit = Math.max(1, Math.min(20, parseInt(searchParams.get('limit') || '6', 10)))
    const snap = await db.collection('posts').where('status', '==', 'published').orderBy('createdAt', 'desc').limit(limit).get()
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ ok: true, items })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
