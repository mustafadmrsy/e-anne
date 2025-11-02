import { NextRequest, NextResponse } from 'next/server'
import { getAdminDB } from '@/lib/firebaseAdmin'

export async function GET(req: NextRequest) {
  try {
    const db = getAdminDB()
    const { searchParams } = new URL(req.url)
    const limit = Math.max(1, Math.min(20, parseInt(searchParams.get('limit') || '6', 10)))
    let items: any[] = []
    try {
      const snap = await db.collection('posts').where('status', '==', 'published').orderBy('createdAt', 'desc').limit(limit).get()
      items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (e) {
      // Fallback: index yoksa sadece orderBy ile çek ve filtrele
      const snap = await db.collection('posts').orderBy('createdAt', 'desc').limit(limit * 2).get()
      items = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter((x:any)=>x.status === 'published').slice(0, limit)
    }
    return NextResponse.json({ ok: true, items })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
