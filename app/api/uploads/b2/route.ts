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

    // Kimlik doğrulama ZORUNLU
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }
    let uid = ''
    try {
      const auth = getAdminAuth()
      const decoded = await auth.verifyIdToken(token)
      uid = decoded.uid || ''
    } catch {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    // İçerik türü whitelist (gerekirse genişletin)
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(contentType)) {
      return NextResponse.json({ ok: false, error: 'invalid-type' }, { status: 400 })
    }

    // Klasör ve dosya adı sanitizasyonu
    const safeFolder = folder.replace(/[^a-zA-Z0-9_\/-]/g, '').replace(/\.\.+/g, '').replace(/^\/+/, '').replace(/\/+$/,'')
    const safeName = filename.replace(/[^a-zA-Z0-9_.-]/g, '_')
    const prefix = safeFolder ? `${safeFolder}/` : ''
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
    // Public URL: path segment bazlı encode (slasha dokunma)
    const encodedKey = key.split('/').map(encodeURIComponent).join('/')
    const publicUrl = `https://${B2_S3_ENDPOINT}/${B2_BUCKET}/${encodedKey}`

    return NextResponse.json({ ok: true, uploadUrl, publicUrl, key })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
