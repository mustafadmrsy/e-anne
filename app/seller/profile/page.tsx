"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebaseClient"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore"

export default function Page() {
  const router = useRouter()
  const [uid, setUid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [storeName, setStoreName] = useState("")
  const [description, setDescription] = useState("")
  const [companyType, setCompanyType] = useState<"bireysel"|"kurumsal"|"">("")
  const [taxIdOrNationalId, setTaxIdOrNationalId] = useState("")
  const [iban, setIban] = useState("")
  const [bankName, setBankName] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [coverUrl, setCoverUrl] = useState("")

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/login"); return }
      setUid(u.uid)
      try {
        const sdoc = await getDoc(doc(db, "sellers", u.uid))
        const data = sdoc.data() as any
        if (data) {
          setStoreName(data.storeName || "")
          setDescription(data.description || "")
          setCompanyType((data.companyType as any) || "")
          setTaxIdOrNationalId(data.taxIdOrNationalId || data.taxId || "")
          setIban(data.iban || "")
          setBankName(data.bankName || "")
          setLogoUrl(data.logoUrl || "")
          setCoverUrl(data.coverUrl || "")
        }
      } finally { setLoading(false) }
    })
    return () => unsub()
  }, [router])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uid) return
    setError(null)
    setSuccess(null)
    if (!storeName.trim()) { setError("Mağaza adı zorunlu."); return }
    setSaving(true)
    try {
      await setDoc(doc(db, "sellers", uid), {
        storeName: storeName.trim(),
        description: description.trim() || null,
        companyType: companyType || null,
        taxIdOrNationalId: taxIdOrNationalId.trim() || null,
        iban: iban.trim() || null,
        bankName: bankName.trim() || null,
        logoUrl: logoUrl.trim() || null,
        coverUrl: coverUrl.trim() || null,
        updatedAt: serverTimestamp(),
      }, { merge: true })
      setSuccess("Profil güncellendi.")
    } catch { setError("Güncelleme başarısız.") } finally { setSaving(false) }
  }

  if (loading) return <main className="container mx-auto p-4"><div>Yükleniyor...</div></main>

  return (
    <main className="px-1 sm:px-0">
      <h1 className="text-xl sm:text-2xl font-semibold">Mağaza Profili</h1>
      <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs text-slate-700 mb-1">Mağaza Adı</label>
              <input value={storeName} onChange={(e)=>setStoreName(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-700 mb-1">Açıklama</label>
              <textarea rows={4} value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-700 mb-1">Şirket Türü</label>
                <select value={companyType} onChange={(e)=>setCompanyType(e.target.value as any)} className="w-full rounded-lg border px-3 py-2 text-sm">
                  <option value="">Seçiniz</option>
                  <option value="bireysel">Bireysel</option>
                  <option value="kurumsal">Kurumsal</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-700 mb-1">Vergi No / TCKN</label>
                <input value={taxIdOrNationalId} onChange={(e)=>setTaxIdOrNationalId(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-700 mb-1">IBAN</label>
                <input value={iban} onChange={(e)=>setIban(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-700 mb-1">Banka Adı</label>
                <input value={bankName} onChange={(e)=>setBankName(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-700 mb-1">Logo URL</label>
                <input value={logoUrl} onChange={(e)=>setLogoUrl(e.target.value)} placeholder="https://..." className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-700 mb-1">Kapak URL</label>
                <input value={coverUrl} onChange={(e)=>setCoverUrl(e.target.value)} placeholder="https://..." className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="space-y-3">
            {error && <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}
            {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">{success}</div>}
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="rounded-lg bg-brand text-white px-4 py-2 text-sm disabled:opacity-50">{saving?"Kaydediliyor...":"Kaydet"}</button>
              <button type="button" onClick={()=>router.push('/seller')} className="rounded-lg border px-4 py-2 text-sm">İptal</button>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              <div>
                <div className="text-xs text-slate-500 mb-1">Logo Önizleme</div>
                {logoUrl ? <img src={logoUrl} className="h-20 w-20 rounded border object-cover" /> : <div className="h-20 w-20 rounded border bg-slate-50" />}
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Kapak Önizleme</div>
                {coverUrl ? <img src={coverUrl} className="h-20 w-full rounded border object-cover" /> : <div className="h-20 w-full rounded border bg-slate-50" />}
              </div>
            </div>
          </div>
        </section>
      </form>
    </main>
  );
}
