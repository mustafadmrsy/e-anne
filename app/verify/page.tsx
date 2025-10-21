'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebaseClient'
import { doc, updateDoc } from 'firebase/firestore'
import { applyActionCode, reload, getIdToken, onAuthStateChanged } from 'firebase/auth'

export default function VerifyPage() {
  const params = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')

  useEffect(() => {
    // Eğer kullanıcı zaten doğrulanmışsa (ör. Firebase hosted handler doğrulamayı bitirdiyse) başarıya al ve yönlendir
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          await reload(u)
        } catch {}
        if (u.emailVerified && status !== 'success') {
          try {
            const token = await getIdToken(u, true)
            await fetch('/api/auth/sync-claims', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken: token })
            })
            try { await updateDoc(doc(db, 'users', u.uid), { verified: 1 }) } catch {}
          } catch {}
          setStatus('success')
          setTimeout(() => router.push('/'), 1000)
        }
      }
    })
    return () => unsub()
  }, [router, status])

  useEffect(() => {
    const code = params.get('oobCode')
    const mode = params.get('mode')
    if (!code || mode !== 'verifyEmail') {
      // oobCode yoksa bile, üstteki auth state dinleyicisi doğrulanmış kullanıcıyı yakalayacaktır
      setStatus((s) => (s === 'idle' ? 'verifying' : s))
      return
    }
    let done = false
    const timer = setTimeout(() => {
      if (!done) {
        setStatus('error')
      }
    }, 8000)
    const run = async () => {
      try {
        setStatus('verifying')
        await applyActionCode(auth, code)
        if (auth.currentUser) {
          await reload(auth.currentUser)
          const token = await getIdToken(auth.currentUser, true)
          await fetch('/api/auth/sync-claims', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: token })
          })
          try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), { verified: 1 })
          } catch {}
        }
        done = true
        clearTimeout(timer)
        setStatus('success')
        setTimeout(() => router.push('/'), 1200)
      } catch (e: any) {
        // Eğer kod zaten kullanılmış/geçersiz ama kullanıcı doğrulanmışsa, başarı gibi davran
        if (e?.code === 'auth/invalid-action-code') {
          done = true
          clearTimeout(timer)
          setStatus('success')
          setTimeout(() => router.push('/'), 1200)
          return
        }
        done = true
        clearTimeout(timer)
        setStatus('error')
      }
    }
    run()
    return () => clearTimeout(timer)
  }, [params, router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40 text-center">
        {status === 'idle' || status === 'verifying' ? (
          <>
            <h1 className="text-2xl font-bold text-secondary">E-posta Doğrulanıyor</h1>
            <p className="mt-2 text-slate-600 text-sm">Lütfen bekleyin...</p>
          </>
        ) : null}
        {status === 'success' ? (
          <>
            <h1 className="text-2xl font-bold text-secondary">E-posta Doğrulandı</h1>
            <p className="mt-2 text-slate-600 text-sm">Giriş yapabilirsiniz.</p>
          </>
        ) : null}
        {status === 'error' ? (
          <>
            <h1 className="text-2xl font-bold text-secondary">Doğrulama Hatası</h1>
            <p className="mt-2 text-slate-600 text-sm">Bağlantı geçersiz veya süresi doldu.</p>
          </>
        ) : null}
      </div>
    </main>
  )
}
