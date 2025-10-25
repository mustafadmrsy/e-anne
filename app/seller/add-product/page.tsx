"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { auth, db } from "@/lib/firebaseClient"
import { onAuthStateChanged, getIdToken } from "firebase/auth"
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore"

export default function Page() {
  const router = useRouter()
  const sp = useSearchParams()
  const editId = sp.get("id")

  const [uid, setUid] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(!!editId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [sku, setSku] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [status, setStatus] = useState<"active"|"inactive">("active")
  const [imageUrl, setImageUrl] = useState("")
  const [slug, setSlug] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<{id:string;name:string}[]>([])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/login"); return }
      setUid(u.uid)
      if (editId) {
        try {
          const d = await getDoc(doc(db, "sellers", u.uid, "products", editId))
          const data = d.data() as any
          if (data) {
            setName(data.name || "")
            setSku(data.sku || "")
            setPrice(String(data.price ?? ""))
            setStock(String(data.stock ?? ""))
            setStatus((data.status as any) || "active")
            setImageUrl(data.image || data.imageUrl || "")
            setSlug((data.slugNormalized as string) || data.slug || "")
            setCategory(data.category || "")
          }
        } finally { setLoading(false) }
      }
    })
    return () => unsub()
  }, [router, editId])

  useEffect(() => {
    let alive = true
    fetch('/api/categories').then(r=>r.json()).then(d=>{
      if (!alive) return
      if (d?.ok) setCategories((d.items||[]).map((x:any)=>({id:x.id,name:x.name||x.title||x.id})))
    }).catch(()=>{})
    return () => { alive = false }
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uid) return
    setError(null)
    setSuccess(null)
    if (!name.trim()) { setError("Ürün adı zorunludur."); return }
    const toSlug = (s: string) => s
      .toLowerCase()
      .trim()
      .replace(/[çÇ]/g, 'c')
      .replace(/[ğĞ]/g, 'g')
      .replace(/[ıİ]/g, 'i')
      .replace(/[öÖ]/g, 'o')
      .replace(/[şŞ]/g, 's')
      .replace(/[üÜ]/g, 'u')
      .replace(/[^a-z0-9-\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    const finalSlug = toSlug(slug || name)
    if (!finalSlug) { setError('Geçerli bir slug üretilemedi.'); return }
    const p = parseFloat(price)
    const s = parseInt(stock || "0", 10)
    if (isNaN(p) || p < 0) { setError("Geçerli bir fiyat girin."); return }
    if (isNaN(s) || s < 0) { setError("Geçerli bir stok girin."); return }
    if (!category || category.trim().length < 2) { setError("Geçerli bir kategori seçin."); return }
    const url = imageUrl.trim()
    if (!url) { setError("Görsel URL zorunludur."); return }
    if (/google\.com\/search/i.test(url)) { setError("Lütfen doğrudan görsel URL'si kullanın (Google arama linki değil)."); return }
    if (!/^https?:\/\//i.test(url)) { setError("Görsel URL http/https ile başlamalıdır."); return }
    setSaving(true)
    try {
      const data = {
        name: name.trim(),
        sku: sku.trim() || null,
        price: Math.max(0, p),
        stock: Math.max(0, Math.floor(s)),
        status: status === 'inactive' ? 'inactive' : 'active',
        image: url,
        slug: finalSlug,
        slugNormalized: finalSlug,
        category,
        updatedAt: serverTimestamp(),
      }
      if (editId) {
        await updateDoc(doc(db, "sellers", uid, "products", editId), data as any)
        // catalog index upsert via API
        const token = await getIdToken(auth.currentUser!)
        await fetch('/api/catalog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            slug: finalSlug,
            sellerId: uid,
            productId: editId,
            path: `sellers/${uid}/products/${editId}`,
            name: data.name,
            price: data.price,
            image: data.image,
            category: data.category,
          })
        })
        setSuccess("Ürün güncellendi.")
      } else {
        const created = await addDoc(collection(db, "sellers", uid, "products"), {
          ...data,
          createdAt: serverTimestamp(),
        })
        // catalog index upsert via API
        const token = await getIdToken(auth.currentUser!)
        await fetch('/api/catalog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            slug: finalSlug,
            sellerId: uid,
            productId: created.id,
            path: `sellers/${uid}/products/${created.id}`,
            name: data.name,
            price: data.price,
            image: data.image,
            category: data.category,
          })
        })
        setSuccess("Ürün eklendi.")
      }
      setTimeout(() => router.push("/seller/products"), 800)
    } catch {
      setError("Kayıt başarısız.")
    } finally { setSaving(false) }
  }

  return (
    <main className="">
      <h1 className="text-xl sm:text-2xl font-semibold">{editId ? "Ürünü Düzenle" : "Ürün Ekle"}</h1>

      <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs text-slate-700 mb-1">Ürün Adı</label>
              <input value={name} onChange={(e)=>{
                const v = e.target.value
                setName(v)
                if (!slug) {
                  const s = v
                    .toLowerCase()
                    .trim()
                    .replace(/[çÇ]/g, 'c')
                    .replace(/[ğĞ]/g, 'g')
                    .replace(/[ıİ]/g, 'i')
                    .replace(/[öÖ]/g, 'o')
                    .replace(/[şŞ]/g, 's')
                    .replace(/[üÜ]/g, 'u')
                    .replace(/[^a-z0-9-\s]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                  setSlug(s)
                }
              }} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-700 mb-1">Slug</label>
              <input value={slug} onChange={(e)=>setSlug(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="ornek-urun" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-700 mb-1">SKU</label>
                <input value={sku} onChange={(e)=>setSku(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-700 mb-1">Durum</label>
                <select value={status} onChange={(e)=>setStatus(e.target.value as any)} className="w-full rounded-lg border px-3 py-2 text-sm">
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-700 mb-1">Fiyat</label>
                <input type="number" step="0.01" value={price} onChange={(e)=>setPrice(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-700 mb-1">Stok</label>
                <input type="number" value={stock} onChange={(e)=>setStock(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-700 mb-1">Kategori</label>
              <select value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm">
                <option value="">Seçin</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-700 mb-1">Görsel URL</label>
              <input value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} placeholder="https://..." className="w-full rounded-lg border px-3 py-2 text-sm" />
              <p className="text-xs text-slate-500 mt-1">Şimdilik URL girin. İleride Storage yükleme eklenecek.</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="space-y-3">
            {error && <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}
            {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">{success}</div>}
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="rounded-lg bg-brand text-white px-4 py-2 text-sm disabled:opacity-50">{saving?"Kaydediliyor...":"Kaydet"}</button>
              <button type="button" onClick={()=>router.push("/seller/products")} className="rounded-lg border px-4 py-2 text-sm">İptal</button>
            </div>
            {imageUrl ? (
              <div className="mt-2">
                <img src={imageUrl} alt="preview" className="h-32 w-32 object-cover rounded-lg border" />
              </div>
            ) : null}
          </div>
        </section>
      </form>
    </main>
  );
}
