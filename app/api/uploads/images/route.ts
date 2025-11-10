import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebaseAdmin'

export async function POST(req: NextRequest) {
  try {
    const { CF_ACCOUNT_ID, CF_IMAGES_TOKEN } = process.env as Record<string, string>
    if (!CF_ACCOUNT_ID || !CF_IMAGES_TOKEN) {
      return NextResponse.json({ ok: false, error: 'cf/env-missing' }, { status: 500 })
    }

    // Firebase ID token zorunlu
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    try {
      const auth = getAdminAuth()
      await auth.verifyIdToken(token)
    } catch {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    // Cloudflare Images Direct Upload URL al (v1)
    const cfRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1/direct_upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CF_IMAGES_TOKEN}`,
      },
    })
    const cfJson = await cfRes.json().catch(() => ({}))
    if (!cfRes.ok || !cfJson?.result?.uploadURL) {
      return NextResponse.json({ ok: false, error: 'cf/direct-upload-failed', details: cfJson?.errors || null }, { status: 500 })
    }

    return NextResponse.json({ ok: true, uploadURL: cfJson.result.uploadURL, raw: cfJson?.result || null })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
