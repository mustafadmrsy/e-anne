"use client"

import { useEffect, useMemo, useState } from "react"
import { auth, db } from "@/lib/firebaseClient"
import { onAuthStateChanged } from "firebase/auth"
import { collection, doc, getDocs, orderBy, query } from "firebase/firestore"

export default function Page() {
  const [uid, setUid] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<string>("all")

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return
      setUid(u.uid)
      try {
        const col = collection(db, "sellers", u.uid, "payouts")
        const snap = await getDocs(query(col, orderBy("createdAt", "desc")))
        setItems(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
      } finally { setLoading(false) }
    })
    return () => unsub()
  }, [])

  const filtered = useMemo(() => status==="all" ? items : items.filter(p => (p.status||"pending")===status), [items, status])
  const fmt = (n:number)=>`₺${(n||0).toFixed(2)}`

  return (
    <main className="px-1 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold">Finans / Ödemeler</h1>
        <select value={status} onChange={(e)=>setStatus(e.target.value)} className="rounded-lg border px-3 py-2 text-sm w-full sm:w-auto">
          <option value="all">Tümü</option>
          <option value="pending">Bekliyor</option>
          <option value="paid">Ödendi</option>
          <option value="on_hold">Bekletiliyor</option>
        </select>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white overflow-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-2">Dönem</th>
              <th className="text-left px-4 py-2">Durum</th>
              <th className="text-left px-4 py-2">Brüt</th>
              <th className="text-left px-4 py-2">Komisyon</th>
              <th className="text-left px-4 py-2">Net</th>
              <th className="text-left px-4 py-2">Sipariş Sayısı</th>
              <th className="text-left px-4 py-2">Oluşturma</th>
            </tr>
          </thead>
          <tbody>
            {loading && (<tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">Yükleniyor...</td></tr>)}
            {!loading && filtered.length===0 && (<tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">Kayıt bulunamadı.</td></tr>)}
            {filtered.map(p => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2 font-medium text-slate-800">{p.period || '—'}</td>
                <td className="px-4 py-2 capitalize">{p.status || 'pending'}</td>
                <td className="px-4 py-2">{fmt(p.amountGross||0)}</td>
                <td className="px-4 py-2">{fmt(p.commission||0)}</td>
                <td className="px-4 py-2">{fmt(p.amountNet||0)}</td>
                <td className="px-4 py-2">{Array.isArray(p.orders)? p.orders.length : (p.orderCount||0)}</td>
                <td className="px-4 py-2">{p.createdAt?.toMillis ? new Date(p.createdAt.toMillis()).toLocaleDateString('tr-TR') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        Not: Ödeme kalemleri admin veya arka plan işlemleri tarafından oluşturulur. Sorularınız için destek ile iletişime geçin.
      </div>
    </main>
  )
}
