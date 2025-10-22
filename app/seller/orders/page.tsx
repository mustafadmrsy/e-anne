"use client"

import { useEffect, useMemo, useState } from "react"
import { auth, db } from "@/lib/firebaseClient"
import { onAuthStateChanged } from "firebase/auth"
import { collection, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore"

type OrderItem = { name: string; image?: string; price: number; qty: number }
type Order = {
  id: string
  orderNo: string
  status: string
  createdAt?: any
  totals?: { payable: number }
  items: OrderItem[]
  customerId?: string
}

export default function Page() {
  const [uid, setUid] = useState<string | null>(null)
  const [items, setItems] = useState<Order[]>([])
  const [status, setStatus] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return
      setUid(u.uid)
      try {
        const col = collection(db, "sellers", u.uid, "orders")
        const base = query(col, orderBy("createdAt", "desc"))
        const snap = await getDocs(base)
        const arr: Order[] = []
        snap.forEach((d) => {
          const data = d.data() as any
          arr.push({
            id: d.id,
            orderNo: data.orderNo,
            status: data.status,
            createdAt: data.createdAt,
            items: data.items || [],
            totals: data.totals || { payable: 0 },
            customerId: data.customerId,
          })
        })
        setItems(arr)
      } finally { setLoading(false) }
    })
    return () => unsub()
  }, [])

  const filtered = useMemo(() => {
    return status === "all" ? items : items.filter(o => o.status === status)
  }, [items, status])

  const fmt = (n: number) => `₺${(n||0).toFixed(2)}`
  const fDate = (ts: any) => {
    try { const ms = ts?.toMillis ? ts.toMillis() : 0; if (!ms) return "-"; const d = new Date(ms); return d.toLocaleString('tr-TR') } catch { return '-' }
  }

  const updateStatus = async (id: string, st: string) => {
    if (!uid) return
    try {
      await updateDoc(doc(db, "sellers", uid, "orders", id), { status: st, updatedAt: serverTimestamp() })
      setItems(prev => prev.map(o => o.id===id ? { ...o, status: st } : o))
    } catch {}
  }

  return (
    <main className="px-1 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold">Siparişler</h1>
        <select value={status} onChange={(e)=>setStatus(e.target.value)} className="rounded-lg border px-3 py-2 text-sm w-full sm:w-auto">
          <option value="all">Tümü</option>
          <option value="hazırlanıyor">Hazırlanıyor</option>
          <option value="kargolandı">Kargolandı</option>
          <option value="teslim edildi">Teslim Edildi</option>
          <option value="iptal">İptal</option>
        </select>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white overflow-auto">
        <table className="w-full text-sm min-w-[840px]">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-2">Sipariş</th>
              <th className="text-left px-4 py-2">Tarih</th>
              <th className="text-left px-4 py-2">Durum</th>
              <th className="text-left px-4 py-2">Ürünler</th>
              <th className="text-right px-4 py-2">Tutar</th>
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
            {filtered.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="px-4 py-2 font-medium text-slate-800">{o.orderNo}</td>
                <td className="px-4 py-2">{fDate(o.createdAt)}</td>
                <td className="px-4 py-2">{o.status}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2 overflow-x-auto">
                    {o.items.slice(0,4).map((it, idx) => (
                      <div key={idx} className="inline-flex items-center gap-2 min-w-[160px]">
                        {it.image ? <img src={it.image} className="h-8 w-8 rounded object-cover" /> : <div className="h-8 w-8 rounded bg-slate-100" />}
                        <span className="text-slate-700 line-clamp-1">{it.name} × {it.qty}</span>
                      </div>
                    ))}
                    {o.items.length > 4 ? <span className="text-slate-500">+{o.items.length-4} daha</span> : null}
                  </div>
                </td>
                <td className="px-4 py-2 text-right">{fmt(o.totals?.payable || 0)}</td>
                <td className="px-4 py-2 text-right">
                  <div className="inline-flex gap-2">
                    <button onClick={()=>updateStatus(o.id, "hazırlanıyor")} className="rounded-lg border px-3 py-1.5">Hazırlanıyor</button>
                    <button onClick={()=>updateStatus(o.id, "kargolandı")} className="rounded-lg border px-3 py-1.5">Kargolandı</button>
                    <button onClick={()=>updateStatus(o.id, "teslim edildi")} className="rounded-lg border px-3 py-1.5">Teslim</button>
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
