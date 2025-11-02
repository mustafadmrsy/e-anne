import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebaseAdmin'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export async function POST(req: NextRequest) {
  try {
    const { B2_KEY_ID, B2_APP_KEY, B2_BUCKET, B2_S3_ENDPOINT } = process.env as Record<string, string>
    if (!B2_KEY_ID || !B2_APP_KEY || !B2_BUCKET || !B2_S3_ENDPOINT) {
      return NextResponse.json({ ok: false, error: 'b2/env-missing' }, { status: 500 })
    }

    const body = await req.json().catch(() => ({}))
    let { filename, contentType, folder } = body || {}
    filename = String(filename || 'upload.bin')
    contentType = String(contentType || 'application/octet-stream')
    folder = String(folder || '')

    // Kimlik doğrulama (opsiyonel ama önerilir)
    let uid = 'anon'
    try {
      const authHeader = req.headers.get('authorization') || ''
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
      if (token) {
        const auth = getAdminAuth()
        const decoded = await auth.verifyIdToken(token)
        uid = decoded.uid || 'user'
      }
    } catch {}

    const safeName = filename.replace(/[^a-zA-Z0-9_.-]/g, '_')
    const prefix = folder ? `${folder}/` : ''
    const key = `${prefix}${uid}/${Date.now()}_${safeName}`

    const m = B2_S3_ENDPOINT.match(/s3\.([^.]+)\./)
    const region = (m && m[1]) || 'us-west-002'

    const s3 = new S3Client({
      region,
      endpoint: `https://${B2_S3_ENDPOINT}`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: B2_KEY_ID,
        secretAccessKey: B2_APP_KEY,
      },
    })

    const command = new PutObjectCommand({
      Bucket: B2_BUCKET,
      Key: key,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 })
    const publicUrl = `https://${B2_S3_ENDPOINT}/${B2_BUCKET}/${encodeURIComponent(key)}`

    return NextResponse.json({ ok: true, uploadUrl, publicUrl, key })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
