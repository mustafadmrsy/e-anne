"use client"

import { useEffect, useMemo, useState } from "react"
import { auth, db } from "@/lib/firebaseClient"
import { onAuthStateChanged } from "firebase/auth"
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc } from "firebase/firestore"
import Link from "next/link"

export default function AdminProductsPage() {
  const [uid, setUid] = useState<string | null>(null)
  const [cats, setCats] = useState<Array<{ id: string; name: string; description?: string; order?: number }>>([])
  const [loading, setLoading] = useState(true)

  // form state
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [order, setOrder] = useState<string>("0")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { window.location.href = "/login"; return }
      setUid(u.uid)
      await loadCats()
    })
    return () => unsub()
  }, [])

  async function loadCats() {
    setLoading(true)
    try {
      const snap = await getDocs(query(collection(db, "categories"), orderBy("order", "asc")))
      const arr: typeof cats = []
      snap.forEach(d => {
        const x = d.data() as any
        arr.push({ id: d.id, name: x.name || x.title || d.id, description: x.description || "", order: Number(x.order || 0) })
      })
      setCats(arr)
    } finally { setLoading(false) }
  }

  const onEdit = async (id: string) => {
    setError(null); setSuccess(null)
    try {
      const d = await getDoc(doc(db, "categories", id))
      const x = d.data() as any
      setEditId(id)
      setName(x?.name || x?.title || id)
      setSlug(id)
      setDescription(x?.description || "")
      setOrder(String(x?.order ?? 0))
    } catch { setError("Kayıt okunamadı") }
  }

  const onDelete = async (id: string) => {
    setError(null); setSuccess(null)
    try {
      await deleteDoc(doc(db, "categories", id))
      setCats(prev => prev.filter(c => c.id !== id))
      setSuccess("Silindi")
    } catch { setError("Silme başarısız") }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setSuccess(null)
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
    if (!finalSlug) { setError("Geçerli bir slug girin"); return }
    const ord = parseInt(order || "0", 10)
    try {
      const data = { name: name.trim(), description: description.trim(), order: isNaN(ord) ? 0 : ord }
      await setDoc(doc(db, "categories", finalSlug), data, { merge: true })
      setSuccess(editId ? "Güncellendi" : "Oluşturuldu")
      setEditId(null); setName(""); setSlug(""); setDescription(""); setOrder("0")
      await loadCats()
    } catch { setError("Kaydetme başarısız") }
  }

  return (
    <main>
      <h1 className="text-2xl font-semibold">Ürünler • Kategori Yönetimi</h1>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="rounded-2xl border border-slate-800 bg-black/30 p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Kategoriler</h2>
            <button onClick={()=>{ setEditId(null); setName(""); setSlug(""); setDescription(""); setOrder("0") }} className="text-sm rounded-lg border border-slate-700 px-3 py-1.5 hover:bg-slate-800">Yeni</button>
          </div>
          <div className="mt-3 overflow-auto rounded-xl border border-slate-800">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-slate-900/40 text-slate-300">
                <tr>
                  <th className="text-left px-4 py-2">Slug</th>
                  <th className="text-left px-4 py-2">Ad</th>
                  <th className="text-left px-4 py-2">Sıra</th>
                  <th className="text-right px-4 py-2">Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Yükleniyor...</td></tr>
                ) : cats.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Kategori yok.</td></tr>
                ) : cats.map(c => (
                  <tr key={c.id} className="border-t border-slate-800">
                    <td className="px-4 py-2 text-slate-300">{c.id}</td>
                    <td className="px-4 py-2 text-slate-100">{c.name}</td>
                    <td className="px-4 py-2 text-slate-300">{c.order ?? 0}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="inline-flex gap-2">
                        <button onClick={()=>onEdit(c.id)} className="rounded-lg border border-slate-700 px-3 py-1.5 hover:bg-slate-800">Düzenle</button>
                        <button onClick={()=>onDelete(c.id)} className="rounded-lg border border-red-700 text-red-300 px-3 py-1.5 hover:bg-red-900/30">Sil</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-black/30 p-4">
          <h2 className="text-lg font-semibold">{editId ? "Kategoriyi Düzenle" : "Yeni Kategori"}</h2>
          <form onSubmit={onSubmit} className="mt-3 space-y-3">
            {error && <div className="rounded-lg border border-red-800 bg-red-900/30 text-red-200 px-3 py-2 text-sm">{error}</div>}
            {success && <div className="rounded-lg border border-emerald-800 bg-emerald-900/30 text-emerald-200 px-3 py-2 text-sm">{success}</div>}
            <div>
              <label className="block text-xs text-slate-300 mb-1">Ad</label>
              <input value={name} onChange={(e)=>{ 
                const v=e.target.value; setName(v);
                if(!slug){
                  const s=v.toLowerCase().trim()
                    .replace(/[çÇ]/g,'c').replace(/[ğĞ]/g,'g').replace(/[ıİ]/g,'i')
                    .replace(/[öÖ]/g,'o').replace(/[şŞ]/g,'s').replace(/[üÜ]/g,'u')
                    .replace(/[^a-z0-9-\s]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-')
                  setSlug(s)
                }
              }} className="w-full rounded-lg border border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-100" />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Slug</label>
              <input value={slug} onChange={(e)=>{
                const v=e.target.value
                const s=v.toLowerCase().trim()
                  .replace(/[çÇ]/g,'c').replace(/[ğĞ]/g,'g').replace(/[ıİ]/g,'i')
                  .replace(/[öÖ]/g,'o').replace(/[şŞ]/g,'s').replace(/[üÜ]/g,'u')
                  .replace(/[^a-z0-9-\s]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-')
                setSlug(s)
              }} className="w-full rounded-lg border border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-100" />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Sıra</label>
              <input type="number" value={order} onChange={(e)=>setOrder(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-100" />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Açıklama</label>
              <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-100 min-h-[80px]" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="rounded-lg bg-brand text-white px-4 py-2 text-sm">Kaydet</button>
              <button type="button" className="rounded-lg border border-slate-700 px-4 py-2 text-sm" onClick={()=>{ setEditId(null); setName(""); setSlug(""); setDescription(""); setOrder("0") }}>Temizle</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}
