"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebaseClient"
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore"

export default function SellerNotificationsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const ql = query(collection(db, "notifications"), orderBy("createdAt", "desc"), limit(50))
        const s = await getDocs(ql)
        setItems(s.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
      } finally { setLoading(false) }
    })()
  }, [])

  const fDate = (ts: any) => {
    try { const ms = ts?.toMillis ? ts.toMillis() : 0; if (!ms) return "-"; const d = new Date(ms); return d.toLocaleString('tr-TR') } catch { return '-' }
  }

  return (
    <main>
      <h1 className="text-xl sm:text-2xl font-semibold">Bildirimler</h1>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white overflow-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-2">Başlık</th>
              <th className="text-left px-4 py-2">Mesaj</th>
              <th className="text-left px-4 py-2">Kanal</th>
              <th className="text-left px-4 py-2">Durum</th>
              <th className="text-left px-4 py-2">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {loading && (<tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Yükleniyor...</td></tr>)}
            {!loading && items.length===0 && (<tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Bildirim yok.</td></tr>)}
            {items.map(n => (
              <tr key={n.id} className="border-t">
                <td className="px-4 py-2 font-medium text-slate-800">{n.title || '—'}</td>
                <td className="px-4 py-2 text-slate-700">{n.body || '—'}</td>
                <td className="px-4 py-2">{n.channel || 'system'}</td>
                <td className="px-4 py-2">{n.status || '—'}</td>
                <td className="px-4 py-2">{fDate(n.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
