import admin from 'firebase-admin'

declare global {
  // eslint-disable-next-line no-var
  var adminApp: admin.app.App | undefined
}

export function getAdminAuth() {
  if (!globalThis.adminApp) {
    if (!admin.apps.length) {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      if (!raw) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set')
      }
      const json = JSON.parse(raw)
      const privateKey: string = (json.private_key as string).replace(/\\n/g, '\n')

      globalThis.adminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: json.project_id,
          clientEmail: json.client_email,
          privateKey
        })
      })
    } else {
      globalThis.adminApp = admin.app()
    }
  }
  return admin.auth(globalThis.adminApp)
}

export function getAdminDB() {
  if (!globalThis.adminApp) {
    if (!admin.apps.length) {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      if (!raw) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set')
      }
      const json = JSON.parse(raw)
      const privateKey: string = (json.private_key as string).replace(/\\n/g, '\n')

      globalThis.adminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: json.project_id,
          clientEmail: json.client_email,
          privateKey
        })
      })
    } else {
      globalThis.adminApp = admin.app()
    }
  }
  return admin.firestore(globalThis.adminApp)
}
