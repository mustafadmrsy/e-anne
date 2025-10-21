import admin from 'firebase-admin'

let app: admin.app.App | undefined

if (!admin.apps.length) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set')
  }
  const json = JSON.parse(raw)
  const privateKey: string = (json.private_key as string).replace(/\\n/g, '\n')

  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: json.project_id,
      clientEmail: json.client_email,
      privateKey
    })
  })
} else {
  app = admin.app()
}

export const adminAuth = admin.auth(app)
