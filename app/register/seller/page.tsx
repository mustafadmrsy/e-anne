"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebaseClient"
import { onAuthStateChanged } from "firebase/auth"
import { doc, serverTimestamp, setDoc, updateDoc, getDoc } from "firebase/firestore"
import app from "@/lib/firebaseClient"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

export default function SellerRegisterPage() {
  const router = useRouter()
  const [uid, setUid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [storeName, setStoreName] = useState("")
  const [taxId, setTaxId] = useState("")
  const [companyType, setCompanyType] = useState<"bireysel" | "kurumsal" | "">("")
  const [iban, setIban] = useState("")
  const [bankName, setBankName] = useState("")
  const [description, setDescription] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  useEffect(() => {
    if (logoFile) {
      const url = URL.createObjectURL(logoFile)
      setLogoPreview(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setLogoPreview(null)
    }
  }, [logoFile])

  useEffect(() => {
    if (coverFile) {
      const url = URL.createObjectURL(coverFile)
      setCoverPreview(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setCoverPreview(null)
    }
  }, [coverFile])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login")
        return
      }
      setUid(u.uid)
      try {
        const udoc = await getDoc(doc(db, "users", u.uid))
        const data = udoc.data() as any
        if (data?.sellerStatus === "approved") {
          router.push("/seller-dashboard")
          return
        }
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [router])

  const uploadIfAny = async (path: string, file: File | null) => {
    if (!file || !uid) return null
    const storage = getStorage(app)
    const r = ref(storage, `${path}/${uid}/${Date.now()}_${file.name}`)
    await uploadBytes(r, file)
    return await getDownloadURL(r)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uid) return
    setError(null)
    setSuccess(null)
    if (!storeName.trim() || !taxId.trim() || !companyType || !iban.trim()) {
      setError("Lütfen zorunlu alanları doldurun.")
      return
    }
    setSaving(true)
    try {
      const [logoUrl, coverUrl] = await Promise.all([
        uploadIfAny("sellers/logo", logoFile),
        uploadIfAny("sellers/cover", coverFile)
      ])
      await setDoc(doc(db, "sellers", uid), {
        storeName: storeName.trim(),
        taxIdOrNationalId: taxId.trim(),
        companyType,
        logoUrl: logoUrl || null,
        coverUrl: coverUrl || null,
        iban: iban.trim(),
        bankName: bankName.trim() || null,
        description: description.trim() || null,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true })
      await updateDoc(doc(db, "users", uid), {
        role: "seller",
        sellerStatus: "pending",
        updatedAt: serverTimestamp()
      })
      setSuccess("Başvurunuz alındı. Onaylanınca bilgilendirileceksiniz.")
      setTimeout(() => router.push("/"), 1200)
    } catch {
      setError("Başvuru kaydedilemedi.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <main className="container mx-auto px-4 py-8"><div>Yükleniyor...</div></main>

  return (
    <main className="w-full px-3 py-3 sm:py-4">
      <style jsx global>{`
        footer { display: none !important; }
      `}</style>
      <div className="mx-auto max-w-[1400px]">
        <div className="rounded-3xl bg-gradient-to-r from-slate-50 to-white border border-slate-200 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-secondary">Satıcı Kaydı</h1>
              <p className="mt-0.5 text-slate-600 text-sm">Mağazanızı oluşturun; onaylanınca paneliniz açılacak.</p>
            </div>
          </div>

          {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm">{error}</div>}
          {success && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-2 text-sm">{success}</div>}

          <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
            <section className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="text-base font-semibold text-slate-900">Mağaza Bilgileri</h2>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-700 mb-1">Mağaza Adı</label>
                  <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Örn. E-Anne Doğal Ürünler" value={storeName} onChange={(e)=>setStoreName(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-700 mb-1">Mağaza Açıklaması</label>
                  <textarea className="w-full rounded-lg border px-3 py-2 text-sm" rows={3} placeholder="Kısa tanıtım" value={description} onChange={(e)=>setDescription(e.target.value)} />
                </div>
              </div>

              <h2 className="mt-4 text-base font-semibold text-slate-900">Vergi ve Şirket</h2>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Vergi No / T.C. Kimlik No</label>
                  <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="1234567890" value={taxId} onChange={(e)=>setTaxId(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Şirket Türü</label>
                  <select className="w-full rounded-lg border px-3 py-2 text-sm" value={companyType} onChange={(e)=>setCompanyType(e.target.value as any)}>
                    <option value="">Seçiniz</option>
                    <option value="bireysel">Bireysel</option>
                    <option value="kurumsal">Kurumsal</option>
                  </select>
                </div>
              </div>

              <h2 className="mt-4 text-base font-semibold text-slate-900">Banka</h2>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs text-slate-700 mb-1">IBAN</label>
                  <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="TR__ ____ ____ ____ ____ ____" value={iban} onChange={(e)=>setIban(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Banka Adı (opsiyonel)</label>
                  <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Örn. Ziraat Bankası" value={bankName} onChange={(e)=>setBankName(e.target.value)} />
                </div>
              </div>
            </section>

            <section className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-4">
                <h2 className="text-base font-semibold text-slate-900">Görsel Önizleme</h2>
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border overflow-hidden">
                    <div className="h-28 bg-slate-100">
                      {coverPreview ? (
                        <img src={coverPreview} alt="Kapak" className="h-28 w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">Kapak görseli</div>
                      )}
                    </div>
                    <div className="-mt-6 pl-4">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl border bg-white overflow-hidden">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                        ) : (
                          <div className="text-slate-400 text-xs">Logo</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs text-slate-700 mb-1">Mağaza Logosu</label>
                      <input type="file" accept="image/*" onChange={(e)=>setLogoFile(e.target.files?.[0] || null)} className="w-full rounded-lg border px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-700 mb-1">Kapak Görseli</label>
                      <input type="file" accept="image/*" onChange={(e)=>setCoverFile(e.target.files?.[0] || null)} className="w-full rounded-lg border px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button type="submit" disabled={saving} className="rounded-lg bg-brand text-white px-3 py-2 disabled:opacity-50 text-sm">Başvuruyu Gönder</button>
                    <button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={()=>router.push('/register/role')}>Geri</button>
                  </div>
                  <div className="pt-2 border-t text-xs text-slate-600">İpucu: Net logo ve 1200×300 piksel kapak görseli önerilir. Bilgilerinizi doğru girdiğinizden emin olun.</div>
                </div>
            </section>
          </form>
        </div>
      </div>
    </main>
  )
}
