'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebaseClient'
import {
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  deleteUser
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore'

export default function AccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'addresses' | 'orders' | 'favorites' | 'security' | 'account'>('profile')

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Addresses state
  type Address = { id?: string; title: string; line1: string; city: string; district: string; zip: string; phone?: string }
  const [addresses, setAddresses] = useState<Address[]>([])
  const emptyAddress: Address = useMemo(() => ({ title: '', line1: '', city: '', district: '', zip: '', phone: '' }), [])
  const [editingAddress, setEditingAddress] = useState<Address>(emptyAddress)
  const [addrSaving, setAddrSaving] = useState(false)

  // Notification/Security preferences
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true)
  const [smsNotifications, setSmsNotifications] = useState<boolean>(false)
  const [twoFactorPref, setTwoFactorPref] = useState<boolean>(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login')
        return
      }
      try {
        setEmail(user.email || '')
        const ref = doc(db, 'users', user.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          const data = snap.data() as any
          setFullName(data.fullName || '')
          setPhone(data.phone || '')
          setAddress(data.address || '')
          setEmailNotifications(typeof data.emailNotifications === 'boolean' ? data.emailNotifications : true)
          setSmsNotifications(typeof data.smsNotifications === 'boolean' ? data.smsNotifications : false)
          setTwoFactorPref(typeof data.twoFactorPref === 'boolean' ? data.twoFactorPref : false)
        } else {
          await setDoc(
            ref,
            { uid: user.uid, email: user.email || '', createdAt: serverTimestamp(), emailNotifications: true, smsNotifications: false, twoFactorPref: false },
            { merge: true }
          )
        }

        // Load addresses
        const addrCol = collection(db, 'users', user.uid, 'addresses')
        const addrSnap = await getDocs(addrCol)
        const list: Address[] = []
        addrSnap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }))
        setAddresses(list)
      } catch {
        setError('Profil verisi yüklenemedi.')
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [router])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const u = auth.currentUser
    if (!u) {
      router.push('/login')
      return
    }
    if (!fullName.trim()) {
      setError('Ad Soyad zorunludur.')
      return
    }
    try {
      setSaving(true)
      const ref = doc(db, 'users', u.uid)
      await setDoc(
        ref,
        {
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          emailNotifications,
          smsNotifications,
          twoFactorPref,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      )
      try {
        const { updateProfile } = await import('firebase/auth')
        await updateProfile(u, { displayName: fullName.trim() })
        await u.reload()
      } catch {}
      try {
        const addrQ = query(collection(db, 'addresses'), where('userId', '==', u.uid))
        const addrDocs = await getDocs(addrQ)
        await Promise.all(
          addrDocs.docs.map((d) =>
            updateDoc(d.ref, { fullName: fullName.trim(), email: email })
          )
        )
      } catch {}
      setSuccess('Profil başarıyla güncellendi.')
    } catch {
      setError('Profil güncellenemedi.')
    } finally {
      setSaving(false)
    }
  }

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const u = auth.currentUser
    if (!u || !email) {
      router.push('/login')
      return
    }
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      setError('Şifre alanlarını kontrol edin.')
      return
    }
    try {
      const cred = EmailAuthProvider.credential(email, currentPassword)
      await reauthenticateWithCredential(u, cred)
      await updatePassword(u, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess('Şifre güncellendi.')
    } catch {
      setError('Şifre güncelleme başarısız. Mevcut şifre yanlış olabilir.')
    }
  }

  const saveAddress = async () => {
    setAddrSaving(true)
    setError(null)
    setSuccess(null)
    const u = auth.currentUser
    if (!u) {
      router.push('/login')
      return
    }
    try {
      const base = { title: editingAddress.title.trim(), line1: editingAddress.line1.trim(), city: editingAddress.city.trim(), district: editingAddress.district.trim(), zip: editingAddress.zip.trim(), phone: (editingAddress.phone || '').trim() }
      const colRef = collection(db, 'users', u.uid, 'addresses')
      if (editingAddress.id) {
        await updateDoc(doc(colRef, editingAddress.id), base)
        setAddresses((prev) => prev.map((a) => (a.id === editingAddress.id ? { ...editingAddress } : a)))
        try {
          await setDoc(
            doc(db, 'addresses', `${u.uid}_${editingAddress.id}`),
            {
              ...base,
              userId: u.uid,
              addressId: editingAddress.id,
              email,
              fullName,
              updatedAt: serverTimestamp()
            },
            { merge: true }
          )
        } catch {}
        setSuccess('Adres güncellendi.')
      } else {
        const created = await addDoc(colRef, base)
        setAddresses((prev) => [...prev, { ...base, id: created.id }])
        try {
          await setDoc(doc(db, 'addresses', `${u.uid}_${created.id}`), {
            ...base,
            userId: u.uid,
            addressId: created.id,
            email,
            fullName,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
        } catch {}
        setSuccess('Adres eklendi.')
      }
      setEditingAddress(emptyAddress)
    } catch {
      setError('Adres kaydedilemedi.')
    } finally {
      setAddrSaving(false)
    }
  }

  const editAddress = (a: Address) => setEditingAddress(a)
  const newAddress = () => setEditingAddress(emptyAddress)
  const removeAddress = async (id?: string) => {
    if (!id) return
    const u = auth.currentUser
    if (!u) return
    try {
      await deleteDoc(doc(collection(db, 'users', u.uid, 'addresses'), id))
      try { await deleteDoc(doc(db, 'addresses', `${u.uid}_${id}`)) } catch {}
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      setSuccess('Adres silindi.')
    } catch {
      setError('Adres silinemedi.')
    }
  }

  const onLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  const onDeleteAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const u = auth.currentUser
    if (!u || !email) return
    const form = new FormData(e.currentTarget)
    const confirm = (form.get('confirm') as string) || ''
    const pass = (form.get('password') as string) || ''
    if (confirm !== 'SIL') {
      setError('Onay metni hatalı. SIL yazın.')
      return
    }
    try {
      const cred = EmailAuthProvider.credential(email, pass)
      await reauthenticateWithCredential(u, cred)
      // Best-effort: kullanıcı doc ve adreslerini temizle
      try {
        const userRef = doc(db, 'users', u.uid)
        const addrCol = collection(db, 'users', u.uid, 'addresses')
        const addrSnap = await getDocs(addrCol)
        await Promise.all(addrSnap.docs.map((d) => deleteDoc(d.ref)))
        await deleteDoc(userRef)
      } catch {}
      await deleteUser(u)
      router.push('/')
    } catch {
      setError('Hesap silme başarısız. Şifreyi doğrulayın.')
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4 max-w-5xl mx-auto">
          <div className="h-8 w-56 bg-slate-200 rounded" />
          <div className="h-10 w-full bg-slate-200 rounded" />
          <div className="h-40 w-full bg-slate-200 rounded" />
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-secondary">Hesabım</h1>
          <p className="mt-2 text-slate-600">Profil, siparişler, adresler ve güvenlik ayarlarını yönetin.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <nav className="rounded-2xl border border-slate-200 bg-white p-2">
              {[
                { key: 'profile', label: 'Profil Bilgileri' },
                { key: 'password', label: 'Şifre Değiştir' },
                { key: 'addresses', label: 'Adresler' },
                { key: 'orders', label: 'Siparişler' },
                { key: 'favorites', label: 'Favoriler' },
                { key: 'security', label: 'Bildirim & Güvenlik' },
                { key: 'account', label: 'Hesap' }
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition ${
                    activeTab === t.key ? 'bg-brand text-white' : 'hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </aside>

          <section className="lg:col-span-3 space-y-6">
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>
            ) : null}
            {success ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-green-700">{success}</div>
            ) : null}

            {activeTab === 'profile' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="text-xl font-semibold mb-4">Profil Bilgileri</h2>
                <form onSubmit={onSubmit} className="space-y-5 max-w-xl">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">E-posta</label>
                    <input id="email" type="email" value={email} disabled className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-2.5 text-slate-900 outline-none" />
                  </div>
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">Ad Soyad</label>
                    <input id="fullName" type="text" required value={fullName} onChange={(e)=>setFullName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-brand transition-all" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Telefon</label>
                    <input id="phone" type="tel" value={phone} onChange={(e)=>setPhone(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-brand transition-all" />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-slate-700">Varsayılan Adres</label>
                    <textarea id="address" value={address} onChange={(e)=>setAddress(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-brand transition-all" rows={3} />
                  </div>
                  <button type="submit" disabled={saving} className="rounded-lg bg-brand px-4 py-2.5 text-white font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-brand/50">
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 max-w-xl">
                <h2 className="text-xl font-semibold mb-4">Şifre Değiştir</h2>
                <form onSubmit={onChangePassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Mevcut Şifre</label>
                    <input type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Yeni Şifre</label>
                    <input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Yeni Şifre (Tekrar)</label>
                    <input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand" />
                  </div>
                  <button type="submit" className="rounded-lg bg-brand px-4 py-2.5 text-white font-semibold">Şifreyi Güncelle</button>
                </form>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Adresler</h2>
                  <button onClick={newAddress} className="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-50">Yeni Adres</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((a) => (
                    <div key={a.id} className="rounded-xl border border-slate-200 p-4">
                      <div className="font-medium">{a.title || 'Başlık Yok'}</div>
                      <div className="text-sm text-slate-600 mt-1 whitespace-pre-line">{a.line1}\n{a.district} / {a.city} {a.zip}</div>
                      {a.phone ? <div className="text-sm text-slate-600">Tel: {a.phone}</div> : null}
                      <div className="mt-3 flex gap-2">
                        <button onClick={()=>editAddress(a)} className="text-sm px-3 py-1.5 rounded-lg border">Düzenle</button>
                        <button onClick={()=>removeAddress(a.id)} className="text-sm px-3 py-1.5 rounded-lg border border-red-300 text-red-600">Sil</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Edit/Create Form */}
                <div className="mt-6 border-t pt-6 max-w-xl">
                  <h3 className="font-semibold mb-3">{editingAddress.id ? 'Adresi Düzenle' : 'Yeni Adres'}</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <input placeholder="Başlık (Ev, İş...)" value={editingAddress.title} onChange={(e)=>setEditingAddress({...editingAddress, title: e.target.value})} className="rounded-lg border border-slate-300 px-4 py-2.5" />
                    <textarea placeholder="Adres satırı" value={editingAddress.line1} onChange={(e)=>setEditingAddress({...editingAddress, line1: e.target.value})} rows={3} className="rounded-lg border border-slate-300 px-4 py-2.5" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input placeholder="İl" value={editingAddress.city} onChange={(e)=>setEditingAddress({...editingAddress, city: e.target.value})} className="rounded-lg border border-slate-300 px-4 py-2.5" />
                      <input placeholder="İlçe" value={editingAddress.district} onChange={(e)=>setEditingAddress({...editingAddress, district: e.target.value})} className="rounded-lg border border-slate-300 px-4 py-2.5" />
                      <input placeholder="Posta Kodu" value={editingAddress.zip} onChange={(e)=>setEditingAddress({...editingAddress, zip: e.target.value})} className="rounded-lg border border-slate-300 px-4 py-2.5" />
                    </div>
                    <input placeholder="Telefon (opsiyonel)" value={editingAddress.phone || ''} onChange={(e)=>setEditingAddress({...editingAddress, phone: e.target.value})} className="rounded-lg border border-slate-300 px-4 py-2.5" />
                    <div className="flex gap-3">
                      <button onClick={saveAddress} disabled={addrSaving} className="rounded-lg bg-brand px-4 py-2.5 text-white">{addrSaving ? 'Kaydediliyor...' : 'Kaydet'}</button>
                      {editingAddress.id ? (
                        <button onClick={()=>setEditingAddress(emptyAddress)} type="button" className="rounded-lg border px-4 py-2.5">Vazgeç</button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="text-xl font-semibold mb-3">Sipariş Geçmişi</h2>
                <p className="text-slate-600 mb-4">Siparişlerinizi detaylı görmek için aşağıdaki sayfaya gidin.</p>
                <Link href="/orders" className="inline-block rounded-lg bg-brand px-4 py-2.5 text-white">Siparişlerim</Link>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="text-xl font-semibold mb-3">Favorilerim</h2>
                <p className="text-slate-600 mb-4">Favori ürünlerinizi yönetmek için aşağıdaki sayfaya gidin.</p>
                <Link href="/favorites" className="inline-block rounded-lg bg-brand px-4 py-2.5 text-white">Favorilerim</Link>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 max-w-xl">
                <h2 className="text-xl font-semibold mb-4">Bildirim & Güvenlik</h2>
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="flex items-center gap-3">
                    <input id="emailNotif" type="checkbox" checked={emailNotifications} onChange={(e)=>setEmailNotifications(e.target.checked)} />
                    <label htmlFor="emailNotif">E-posta bildirimleri</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input id="smsNotif" type="checkbox" checked={smsNotifications} onChange={(e)=>setSmsNotifications(e.target.checked)} />
                    <label htmlFor="smsNotif">SMS bildirimleri</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input id="twofa" type="checkbox" checked={twoFactorPref} onChange={(e)=>setTwoFactorPref(e.target.checked)} />
                    <label htmlFor="twofa">İki adımlı oturum tercihi (bilgilendirme)</label>
                  </div>
                  <button type="submit" className="rounded-lg bg-brand px-4 py-2.5 text-white">Ayarları Kaydet</button>
                </form>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 max-w-xl space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Hesap</h2>
                  <button onClick={onLogout} className="rounded-lg border px-4 py-2.5 hover:bg-slate-50">Çıkış Yap</button>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-red-600 mb-2">Hesabı Sil</h3>
                  <p className="text-sm text-slate-600 mb-3">Geri alınamaz. Onay için kutuya büyük harfle <b>SIL</b> yazın ve şifrenizi girin.</p>
                  <form onSubmit={onDeleteAccount} className="space-y-3">
                    <input name="confirm" placeholder="SIL" className="w-full rounded-lg border border-slate-300 px-4 py-2.5" />
                    <input name="password" type="password" placeholder="Şifreniz" className="w-full rounded-lg border border-slate-300 px-4 py-2.5" />
                    <button type="submit" className="rounded-lg bg-red-600 px-4 py-2.5 text-white">Hesabı Kalıcı Olarak Sil</button>
                  </form>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
