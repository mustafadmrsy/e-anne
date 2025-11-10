import { NextRequest, NextResponse } from 'next/server'
// B2 endpoint deprecated: Cloudflare Images is now used.

export async function POST(req: NextRequest) {
  return NextResponse.json({ ok: false, error: 'gone', message: 'Backblaze B2 upload endpoint is deprecated. Use /api/uploads/images (Cloudflare Images).' }, { status: 410 })
}
