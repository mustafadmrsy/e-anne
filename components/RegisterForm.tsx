'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { auth, db } from '@/lib/firebaseClient'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, deleteUser } from 'firebase/auth'

export default function RegisterForm() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<'customer' | 'seller'>('customer')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor')
      return
    }
    if (!agree) {
      setError('Şartları kabul etmelisiniz')
      return
    }
    try {
      setLoading(true)
      await createUserWithEmailAndPassword(auth, email, password)
      if (auth.currentUser && fullName) {
        await updateProfile(auth.currentUser, { displayName: fullName })
      }
      // Önce doğrulama e-postasını gönder
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/verify`
      try {
        await sendEmailVerification(auth.currentUser!, { url, handleCodeInApp: true })
      } catch (mailErr) {
        // E-posta gönderimi başarısızsa oluşturulan kullanıcıyı sil
        try { if (auth.currentUser) await deleteUser(auth.currentUser) } catch {}
        throw mailErr
      }
      // E-posta başarıyla gönderildiyse users/{uid} belgesini oluştur
      if (auth.currentUser) {
        const uid = auth.currentUser.uid
        try {
          await setDoc(doc(db, 'users', uid), {
            uid,
            email,
            fullName,
            role,
            sellerStatus: role === 'seller' ? 'pending' : null,
            verified: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true })
        } catch (fireErr: any) {
          console.error('Firestore setDoc error:', fireErr)
          setError('Kullanıcı oluşturuldu ancak profil kaydı açılamadı. Lütfen daha sonra tekrar deneyin.')
          return
        }
      }
      setMessage('E-posta doğrulama bağlantısı gönderildi. Lütfen e-postanızı kontrol edin.')
      if (role === 'seller') {
        setTimeout(() => router.push('/register/seller'), 400)
      }
    } catch (err: any) {
      console.error('Register error:', err)
      const code = err?.code as string | undefined
      const map: Record<string, string> = {
        'auth/email-already-in-use': 'Bu e-posta zaten kayıtlı.',
        'auth/invalid-email': 'Geçersiz e-posta adresi.',
        'auth/weak-password': 'Şifre en az 6 karakter olmalı.',
        'auth/operation-not-allowed': 'Bu giriş yöntemi devre dışı.',
        'auth/network-request-failed': 'Ağ hatası. Lütfen tekrar deneyin.',
      }
      setError(map[code ?? ''] ?? 'Kayıt başarısız. Lütfen e-posta adresini ve şifreyi kontrol et.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} aria-labelledby="register-heading">
      <h2 id="register-heading" className="sr-only">Kayıt Formu</h2>
      <div>
        <label className="block text-sm font-medium text-slate-700">Hesap Türü</label>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button type="button" onClick={()=>setRole('customer')} className={`rounded-2xl border p-4 text-left transition ${role==='customer' ? 'border-brand ring-2 ring-brand/30 bg-brand/5' : 'border-slate-200 hover:border-slate-300'}`}>
            <div className="flex items-center gap-3">
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${role==='customer' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-3-3.87"/><path d="M4 21v-2a4 4 0 0 1 3-3.87"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <div>
                <div className="font-semibold text-slate-900">Müşteri</div>
                <div className="text-sm text-slate-600">Alışveriş yap, siparişlerini yönet.</div>
              </div>
            </div>
          </button>
          <button type="button" onClick={()=>setRole('seller')} className={`rounded-2xl border p-4 text-left transition ${role==='seller' ? 'border-brand ring-2 ring-brand/30 bg-brand/5' : 'border-slate-200 hover:border-slate-300'}`}>
            <div className="flex items-center gap-3">
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${role==='seller' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M7 20h10"/></svg>
              </span>
              <div>
                <div className="font-semibold text-slate-900">Satıcı</div>
                <div className="text-sm text-slate-600">Mağaza aç, ürün ekle ve satış yap.</div>
              </div>
            </div>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">Ad Soyad</label>
          <input id="fullName" name="fullName" type="text" autoComplete="name" required placeholder="Adınız Soyadınız" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand transition-all" value={fullName} onChange={(e)=>setFullName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">E-posta</label>
          <input id="email" name="email" type="email" autoComplete="email" required placeholder="ornek@mail.com" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand transition-all" value={email} onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">Şifre</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required placeholder="••••••••" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand transition-all" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Şifre (Tekrar)</label>
          <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required placeholder="••••••••" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand transition-all" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} />
        </div>
      </div>
      <div className="flex items-start gap-3">
        <input id="terms" name="terms" type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" checked={agree} onChange={(e)=>setAgree(e.target.checked)} />
        <label htmlFor="terms" className="text-sm text-slate-700">
          <span>Şartları kabul ediyorum. </span>
          <Link href="/terms" className="text-brand hover:opacity-80">Kullanım Şartları</Link>
          <span> ve </span>
          <Link href="/privacy-policy" className="text-brand hover:opacity-80">Gizlilik Politikası</Link>
          <span>'nı okudum.</span>
        </label>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-green-600">{message}</p> : null}
      <button type="submit" disabled={loading} className="w-full rounded-lg bg-brand px-4 py-2.5 text-white font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-brand/50">
        {loading ? 'Gönderiliyor...' : 'Kayıt Ol'}
      </button>
      <div className="mt-2">
        <button type="button" className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-800 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-slate-200" aria-label="Google ile kayıt ol">
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fill="#EA4335" d="M12 11.8v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.7-2.6-5.7-5.8S8.9 8.4 12 8.4c1.8 0 3 .8 3.7 1.5l2.5-2.4C17 6 14.8 5 12 5 7.5 5 3.8 8.7 3.8 13.2S7.5 21.4 12 21.4c6 0 7.4-4.2 7.4-6.4 0-.4 0-.7-.1-1H12z"/>
            <path fill="#34A853" d="M12 21.4c3.6 0 4.9-2.4 5.1-3.6H12v-3.6H7c-.1.3-.2.7-.2 1 0 2.8 2.8 6.2 5.2 6.2z"/>
            <path fill="#4A90E2" d="M7 15.2l-3.2-2.5C3.3 11.9 3.1 11 3.1 10c0-1 .2-1.9.7-2.8L7 9.7c-.3.8-.4 1.8-.4 2.8 0 .9.1 1.8.4 2.7z"/>
            <path fill="#FBBC05" d="M3.8 7.2C4.9 5 7.3 3.6 10 3.6c2.8 0 5 1 6.2 2.9L13.7 9.9c-.6-.7-1.9-1.5-3.7-1.5-3.1 0-5.7 2.6-5.7 5.8 0 1 .2 1.9.6 2.7L3.8 17c-.5-1-.7-2-.7-3.2 0-2.3.3-4.3.7-6.6z"/>
          </svg>
          Google ile kayıt ol
        </button>
      </div>
      <p className="text-center text-sm text-slate-600 mt-4">Zaten hesabın var mı? <Link className="font-medium text-brand hover:opacity-80" href="/login">Giriş yap</Link></p>
    </form>
  )
}
