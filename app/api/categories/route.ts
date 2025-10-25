import { NextRequest, NextResponse } from 'next/server'
import { getAdminDB } from '@/lib/firebaseAdmin'

export async function GET(req: NextRequest) {
  try {
    const db = getAdminDB()
    const snap = await db.collection('categories').orderBy('order', 'asc').get()
    const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
    return NextResponse.json({ ok: true, items })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
