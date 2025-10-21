import { Suspense } from 'react'
import VerifyClient from './VerifyClient'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6">Yükleniyor...</div>}>
      <VerifyClient />
    </Suspense>
  )
}
