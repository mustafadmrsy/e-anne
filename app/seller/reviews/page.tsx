"use client"

import { useEffect, useMemo, useState } from "react"
import { auth, db } from "@/lib/firebaseClient"
import { onAuthStateChanged } from "firebase/auth"
import { collection, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore"

export default function Page() {
  const [uid, setUid] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState<string>("all")

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return
      setUid(u.uid)
      try {
        // Global reviews koleksiyonu varsayımı: { sellerId, productId, userId, rating, comment, reply, createdAt }
        const col = collection(db, "reviews")
        const base = rating === "all"
          ? query(col, where("sellerId", "==", u.uid), orderBy("createdAt", "desc"))
          : query(col, where("sellerId", "==", u.uid), where("rating", "==", parseInt(rating,10)), orderBy("createdAt", "desc"))
        const snap = await getDocs(base)
        setItems(snap.docs.map(d=>({ id: d.id, ...(d.data() as any) })))
      } finally { setLoading(false) }
    })
    return () => unsub()
  }, [rating])

  const fDate = (ts: any) => { try { const ms = ts?.toMillis? ts.toMillis(): 0; return ms? new Date(ms).toLocaleString('tr-TR') : '-' } catch { return '-' } }

  const saveReply = async (id: string, reply: string) => {
    try {
      await updateDoc(doc(db, "reviews", id), { reply: reply || null, replyAt: serverTimestamp() })
      setItems(prev => prev.map(x => x.id===id ? { ...x, reply } : x))
    } catch {}
  }

  return (
    <main className="px-1 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold">Yorumlar</h1>
        <select value={rating} onChange={(e)=>setRating(e.target.value)} className="rounded-lg border px-3 py-2 text-sm w-full sm:w-auto">
          <option value="all">Tümü</option>
          <option value="5">5 Yıldız</option>
          <option value="4">4 Yıldız</option>
          <option value="3">3 Yıldız</option>
          <option value="2">2 Yıldız</option>
          <option value="1">1 Yıldız</option>
        </select>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white overflow-auto">
        <table className="w-full text-sm min-w-[840px]">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-2">Ürün</th>
              <th className="text-left px-4 py-2">Kullanıcı</th>
              <th className="text-left px-4 py-2">Puan</th>
              <th className="text-left px-4 py-2">Yorum</th>
              <th className="text-left px-4 py-2">Yanıt</th>
              <th className="text-left px-4 py-2">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {loading && (<tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Yükleniyor...</td></tr>)}
            {!loading && items.length===0 && (<tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Kayıt bulunamadı.</td></tr>)}
            {items.map((r) => (
              <tr key={r.id} className="border-t align-top">
                <td className="px-4 py-2">
                  <div className="font-medium text-slate-800 line-clamp-2">{r.productName || r.productId || '—'}</div>
                </td>
                <td className="px-4 py-2">{r.userName || r.userId || '—'}</td>
                <td className="px-4 py-2">{r.rating || '-'}</td>
                <td className="px-4 py-2 max-w-[360px]"><div className="text-slate-700 whitespace-pre-wrap">{r.comment || '—'}</div></td>
                <td className="px-4 py-2 w-[320px]">
                  <textarea defaultValue={r.reply || ''} onBlur={(e)=>saveReply(r.id, e.target.value)} placeholder="Yanıt yazın ve alan dışına tıklayın" className="w-full rounded-lg border px-3 py-2 text-sm" rows={3} />
                </td>
                <td className="px-4 py-2">{fDate(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-slate-500">Not: Yanıt kaydı alan dışına tıklayınca otomatik kaydedilir.</div>
    </main>
  )
}
