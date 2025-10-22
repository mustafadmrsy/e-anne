'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { auth, db } from '@/lib/firebaseClient'
import { signInWithEmailAndPassword, signOut, getIdTokenResult } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

const SUPERADMIN_UID = process.env.NEXT_PUBLIC_SUPERADMIN_UID || 'unOn6yl9HyQebMFRBA3znR9mq3I2'
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL || '').toLowerCase().split(',').map(s=>s.trim()).filter(Boolean)

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      setLoading(true)
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const u = cred.user
      const tokenResult = await getIdTokenResult(u, true)
      const verifiedClaim = (tokenResult.claims as any)?.verified
      const adminRef = doc(db, 'admins', u.uid)
      let adminSnap = await getDoc(adminRef)
      const emailIsAdmin = !!u.email && ADMIN_EMAILS.includes(u.email.toLowerCase())
      if (!adminSnap.exists() && (emailIsAdmin || u.uid === SUPERADMIN_UID)) {
        await setDoc(adminRef, {
          email: u.email ?? null,
          name: u.displayName ?? null,
          role: 'admin',
          createdAt: serverTimestamp(),
        }, { merge: true })
        adminSnap = await getDoc(adminRef)
      }
      const isAdmin = adminSnap.exists() || u.uid === SUPERADMIN_UID || emailIsAdmin
      const isVerified = u.emailVerified || verifiedClaim === 1 || isAdmin
      if (!isVerified) {
        await signOut(auth)
        setError('E-posta doğrulanmamış. Lütfen e-postanı doğrula ve tekrar dene.')
        return
      }
      router.push('/')
    } catch (err: any) {
      setError('Giriş başarısız. E-posta/şifreyi kontrol edin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit} aria-labelledby="login-heading">
      <h2 id="login-heading" className="sr-only">Giriş Formu</h2>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">E-posta</label>
        <input id="email" name="email" type="email" autoComplete="email" required placeholder="ornek@mail.com" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand transition-all" value={email} onChange={(e)=>setEmail(e.target.value)} />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">Şifre</label>
          <Link href="/forgot" className="text-sm text-brand hover:opacity-80">Şifremi Unuttum</Link>
        </div>
        <input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand transition-all" value={password} onChange={(e)=>setPassword(e.target.value)} />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" disabled={loading} className="w-full rounded-lg bg-brand px-4 py-2.5 text-white font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-brand/50">
        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </button>
      <p className="text-center text-sm text-slate-600 mt-4">
        Hesabın yok mu? <Link href="/register" className="font-medium text-brand hover:opacity-80">Kayıt ol</Link>
      </p>
    </form>
  )
}
