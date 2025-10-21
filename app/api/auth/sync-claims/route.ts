import { NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebaseAdmin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json()
    if (!idToken) {
      return NextResponse.json({ error: 'missing idToken' }, { status: 400 })
    }
    const adminAuth = getAdminAuth()
    const decoded = await adminAuth.verifyIdToken(idToken)
    const { uid, email_verified } = decoded
    if (!email_verified) {
      return NextResponse.json({ ok: false, verified: 0 })
    }
    await adminAuth.setCustomUserClaims(uid, { verified: 1 })
    return NextResponse.json({ ok: true, verified: 1 })
  } catch (e) {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
