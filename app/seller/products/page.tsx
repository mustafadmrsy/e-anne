"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { auth, db } from "@/lib/firebaseClient"
import { onAuthStateChanged } from "firebase/auth"
import { collection, deleteDoc, doc, getDocs, orderBy, query, where } from "firebase/firestore"

type Product = {
  id: string
  name: string
  price: number
  stock: number
  sku?: string
  status?: "active" | "inactive"
  createdAt?: any
}

export default function Page() {
  const [uid, setUid] = useState<string | null>(null)
  const [items, setItems] = useState<Product[]>([])
  const [qtext, setQtext] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return
      setUid(u.uid)
      try {
        // Ürünleri sellers/<uid>/products üzerinden okuyalım
        const col = collection(db, "sellers", u.uid, "products")
        const q = query(col, orderBy("createdAt", "desc"))
        const snap = await getDocs(q)
        const arr: Product[] = []
        snap.forEach((d) => {
          const data = d.data() as any
          arr.push({
            id: d.id,
            name: data.name,
            price: Number(data.price || 0),
            stock: Number(data.stock || 0),
            sku: data.sku || undefined,
            status: data.status || "active",
            createdAt: data.createdAt,
          })
        })
        setItems(arr)
      } finally { setLoading(false) }
    })
    return () => unsub()
  }, [])

  const filtered = useMemo(() => {
    const t = qtext.trim().toLowerCase()
    return t ? items.filter(p => (p.name||"").toLowerCase().includes(t) || (p.sku||"").toLowerCase().includes(t)) : items
  }, [items, qtext])

  const remove = async (id: string) => {
    if (!uid) return
    try {
      await deleteDoc(doc(db, "sellers", uid, "products", id))
      setItems(prev => prev.filter(p => p.id !== id))
    } catch {}
  }

  const fmt = (n: number) => `₺${(n||0).toFixed(2)}`

  return (
    <main className="px-1 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold">Ürünler</h1>
        <div className="flex items-center gap-2">
          <input value={qtext} onChange={(e)=>setQtext(e.target.value)} placeholder="Ara (ad/sku)" className="rounded-lg border px-3 py-2 text-sm" />
          <Link href="/seller/add-product" className="rounded-lg bg-brand text-white px-3 py-2 text-sm">Ürün Ekle</Link>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white overflow-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-2">Ürün</th>
              <th className="text-left px-4 py-2">SKU</th>
              <th className="text-left px-4 py-2">Fiyat</th>
              <th className="text-left px-4 py-2">Stok</th>
              <th className="text-left px-4 py-2">Durum</th>
              <th className="text-right px-4 py-2">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Yükleniyor...</td></tr>
            )}
            {!loading && filtered.length===0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Kayıt bulunamadı.</td></tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2 font-medium text-slate-800">{p.name}</td>
                <td className="px-4 py-2">{p.sku || "—"}</td>
                <td className="px-4 py-2">{fmt(p.price)}</td>
                <td className="px-4 py-2">{p.stock}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs border ${p.status==='active'?"border-emerald-300 text-emerald-700":"border-slate-300 text-slate-600"}`}>{p.status==='active'?"Aktif":"Pasif"}</span>
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="inline-flex gap-2">
                    <Link href={`/seller/add-product?id=${p.id}`} className="rounded-lg border px-3 py-1.5">Düzenle</Link>
                    <button onClick={()=>remove(p.id)} className="rounded-lg border border-red-300 text-red-600 px-3 py-1.5">Sil</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
