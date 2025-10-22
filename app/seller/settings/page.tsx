"use client"

import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebaseClient"
import { onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { collection, deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore"

export default function Page() {
  const [uid, setUid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Basit tercih alanları (users/<uid> altında)
  const [lang, setLang] = useState("tr")
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifInApp, setNotifInApp] = useState(true)

  // Şifre değiştir (yalnızca email/password hesaplar için)
  const [oldPass, setOldPass] = useState("")
  const [newPass, setNewPass] = useState("")

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return
      setUid(u.uid)
      try {
        const udoc = await getDoc(doc(db, "users", u.uid))
        const data = udoc.data() as any
        if (data?.preferences) {
          setLang(data.preferences.lang || "tr")
          setNotifEmail(!!data.preferences.notifEmail)
          setNotifInApp(!!data.preferences.notifInApp)
        }
      } finally { setLoading(false) }
    })
    return () => unsub()
  }, [])

  const savePrefs = async () => {
    if (!uid) return
    setError(null); setSuccess(null); setSaving(true)
    try {
      await setDoc(doc(db, "users", uid), {
        preferences: { lang, notifEmail, notifInApp },
        updatedAt: serverTimestamp(),
      }, { merge: true })
      setSuccess("Ayarlar güncellendi.")
    } catch { setError("Güncelleme başarısız.") } finally { setSaving(false) }
  }

  const changePassword = async () => {
    try {
      const u = auth.currentUser
      if (!u || !u.email) { setError("Şifre değişimi bu hesap için uygun değil."); return }
      const cred = EmailAuthProvider.credential(u.email, oldPass)
      await reauthenticateWithCredential(u, cred)
      await updatePassword(u, newPass)
      setSuccess("Şifre güncellendi.")
      setOldPass(""); setNewPass("")
    } catch { setError("Şifre güncellenemedi.") }
  }

  if (loading) return <main className="container mx-auto p-4"><div>Yükleniyor...</div></main>

  return (
    <main className="px-1 sm:px-0">
      <h1 className="text-xl sm:text-2xl font-semibold">Ayarlar</h1>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold text-slate-900">Genel Tercihler</h2>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs text-slate-700 mb-1">Dil</label>
              <select value={lang} onChange={(e)=>setLang(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm">
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={notifEmail} onChange={(e)=>setNotifEmail(e.target.checked)} /> E-posta bildirimleri</label>
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={notifInApp} onChange={(e)=>setNotifInApp(e.target.checked)} /> Uygulama içi bildirimler</label>
            </div>
            <div>
              <button onClick={savePrefs} disabled={saving} className="rounded-lg bg-brand text-white px-4 py-2 text-sm disabled:opacity-50">Kaydet</button>
            </div>
            {error && <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}
            {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">{success}</div>}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold text-slate-900">Şifre Değiştir</h2>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs text-slate-700 mb-1">Mevcut Şifre</label>
              <input type="password" value={oldPass} onChange={(e)=>setOldPass(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-700 mb-1">Yeni Şifre</label>
              <input type="password" value={newPass} onChange={(e)=>setNewPass(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <button onClick={changePassword} className="rounded-lg border px-4 py-2 text-sm">Güncelle</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
